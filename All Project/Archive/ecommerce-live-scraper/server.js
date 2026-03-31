const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Import routes
const webhooksRouter = require('./server/routes/webhooks');
const usersRouter = require('./server/routes/users');
const statsRouter = require('./server/routes/stats');
const aiRouter = require('./server/routes/ai');
const mockRulesRouter = require('./server/routes/mock-rules');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Mount routes
app.use('/api/webhooks', webhooksRouter);
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/mock-rules', mockRulesRouter);

// State
let scraperProcess = null;
let isRunning = false;
let currentConfig = null;
let comments = [];

// ========== API Endpoints ==========

// Get available platforms
app.get('/api/platforms', (req, res) => {
  res.json({
    success: true,
    platforms: [
      {
        id: 'tiktok',
        name: 'TikTok Live',
        emoji: '🎵',
        urlPlaceholder: 'https://www.tiktok.com/@username/live',
        features: ['read', 'respond']
      },
      {
        id: 'shopee',
        name: 'Shopee Live',
        emoji: '🛒',
        urlPlaceholder: 'https://live.shopee.co.th/...',
        features: ['read', 'respond']
      },
      {
        id: 'lazada',
        name: 'Lazada Live',
        emoji: '📦',
        urlPlaceholder: 'https://pages.lazada.co.th/wow/...',
        features: ['read']
      }
    ]
  });
});

// Start scraper
app.post('/api/start', async (req, res) => {
  if (isRunning) {
    return res.json({ success: false, error: 'Scraper is already running' });
  }

  try {
    const { platform, url, duration, interval, headless, mode } = req.body;

    if (!platform || !url || !duration || !interval) {
      return res.json({ success: false, error: 'Missing required parameters' });
    }

    currentConfig = { platform, url, duration, interval, headless: headless === true, mode: mode || 'read' };
    comments = [];

    // Start scraper in child process
    await startScraper(platform, url, duration, interval, headless === true, mode || 'read');

    res.json({
      success: true,
      message: 'Scraper started successfully',
      config: currentConfig
    });
  } catch (error) {
    console.error('Error starting scraper:', error);
    res.json({ success: false, error: error.message });
  }
});

// Stop scraper
app.post('/api/stop', (req, res) => {
  if (!isRunning) {
    return res.json({ success: false, error: 'Scraper is not running' });
  }

  try {
    stopScraper();
    res.json({
      success: true,
      message: 'Scraper stopped successfully',
      commentsCount: comments.length
    });
  } catch (error) {
    console.error('Error stopping scraper:', error);
    res.json({ success: false, error: error.message });
  }
});

// Get status
app.get('/api/status', (req, res) => {
  res.json({
    running: isRunning,
    config: currentConfig,
    commentsCount: comments.length
  });
});

// Get comments
app.get('/api/comments', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const limitedComments = comments.slice(-limit).reverse();

  res.json({
    success: true,
    comments: limitedComments,
    total: comments.length
  });
});

// Get comment histories
app.get('/api/histories', async (req, res) => {
  try {
    const { platform } = req.query;
    
    if (!platform) {
      return res.json({ success: false, error: 'Platform is required' });
    }

    const dataDir = path.join(__dirname, 'data', 'comments', platform);
    
    const fsSync = require('fs');
    if (!fsSync.existsSync(dataDir)) {
      return res.json({ success: true, histories: [] });
    }

    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const histories = await Promise.all(jsonFiles.map(async (filename) => {
      const filePath = path.join(dataDir, filename);
      const stats = await fs.stat(filePath);
      
      let count = 0;
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        count = Array.isArray(data) ? data.length : 0;
      } catch (e) {
        console.error(`Error reading ${filename}:`, e);
      }

      return {
        filename,
        count,
        size: stats.size,
        created: stats.birthtime
      };
    }));

    histories.sort((a, b) => new Date(b.created) - new Date(a.created));

    res.json({ success: true, histories });
  } catch (error) {
    console.error('Error listing histories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Find Chrome path
app.get('/api/find-chrome-path', (req, res) => {
  try {
    const os = require('os');
    const fsSync = require('fs');
    const username = os.userInfo().username;
    let chromePath = '';

    if (process.platform === 'win32') {
      chromePath = `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data`;
    } else if (process.platform === 'darwin') {
      chromePath = `/Users/${username}/Library/Application Support/Google/Chrome`;
    } else {
      chromePath = `/home/${username}/.config/google-chrome`;
    }

    const exists = fsSync.existsSync(chromePath);

    res.json({
      success: true,
      path: chromePath,
      exists: exists,
      platform: process.platform,
      username: username
    });
  } catch (error) {
    console.error('Error finding Chrome path:', error);
    res.json({ success: false, error: error.message });
  }
});

// Check cookies
app.get('/api/check-cookies', async (req, res) => {
  try {
    const storageStatePath = path.join(__dirname, 'storage-states', 'tiktok.json');
    const fsSync = require('fs');
    
    if (!fsSync.existsSync(storageStatePath)) {
      return res.json({ exists: false });
    }
    
    const storageState = JSON.parse(await fs.readFile(storageStatePath, 'utf-8'));
    const cookies = storageState.cookies || [];
    
    if (cookies.length === 0) {
      return res.json({ exists: false });
    }
    
    res.json({
      exists: true,
      cookieCount: cookies.length
    });
  } catch (error) {
    console.error('Error checking cookies:', error);
    res.json({ exists: false, error: error.message });
  }
});

// Import cookies
app.post('/api/import-cookies', async (req, res) => {
  try {
    const { cookiesJson } = req.body;
    if (!cookiesJson) {
      return res.json({ success: false, error: 'กรุณาใส่ JSON คุกกี้' });
    }

    let cookies;
    try {
      cookies = JSON.parse(cookiesJson);
    } catch (e) {
      return res.json({ success: false, error: 'รูปแบบ JSON ไม่ถูกต้อง' });
    }

    if (!Array.isArray(cookies) && cookies.cookies) {
      cookies = cookies.cookies;
    }

    if (!Array.isArray(cookies)) {
      return res.json({ success: false, error: 'คุกกี้ต้องเป็น Array ของ Object' });
    }

    const normalizedCookies = cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain || '.tiktok.com',
      path: c.path || '/',
      expires: c.expirationDate || c.expires || -1,
      httpOnly: c.httpOnly || false,
      secure: c.secure || false,
      sameSite: (c.sameSite || 'Lax')
    }));

    const storageState = {
      cookies: normalizedCookies,
      origins: []
    };

    const fsSync = require('fs');
    const storageDir = path.join(__dirname, 'storage-states');
    if (!fsSync.existsSync(storageDir)) {
      fsSync.mkdirSync(storageDir, { recursive: true });
    }

    await fs.writeFile(
      path.join(storageDir, 'tiktok.json'),
      JSON.stringify(storageState, null, 2),
      'utf8'
    );

    res.json({ success: true, message: 'บันทึกคุกกี้สำเร็จ!' });
  } catch (error) {
    console.error('Error importing cookies:', error);
    res.json({ success: false, error: error.message });
  }
});

// Clear comments
app.delete('/api/comments', (req, res) => {
  comments = [];
  res.json({ success: true });
});

// Get specific history file
app.get('/api/histories/:platform/:filename', async (req, res) => {
  try {
    const { platform, filename } = req.params;
    const filePath = path.join(__dirname, 'data', 'comments', platform, filename);

    const fsSync = require('fs');
    if (!fsSync.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'ไม่พบไฟล์' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const comments = JSON.parse(content);

    res.json({ success: true, comments });
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download history file
app.get('/api/histories/:platform/:filename/download', async (req, res) => {
  try {
    const { platform, filename } = req.params;
    const filePath = path.join(__dirname, 'data', 'comments', platform, filename);

    const fsSync = require('fs');
    if (!fsSync.existsSync(filePath)) {
      return res.status(404).send('ไม่พบไฟล์');
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading history:', error);
    res.status(500).send('เกิดข้อผิดพลาด');
  }
});

// Delete history file
app.delete('/api/histories/:platform/:filename', async (req, res) => {
  try {
    const { platform, filename } = req.params;
    const filePath = path.join(__dirname, 'data', 'comments', platform, filename);

    const fsSync = require('fs');
    if (!fsSync.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'ไม่พบไฟล์' });
    }

    await fs.unlink(filePath);
    res.json({ success: true, message: 'ลบสำเร็จ' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== Helper Functions ==========

async function startScraper(platform, url, duration, interval, headless, mode) {
  const wrapperPath = path.join(__dirname, 'core', 'scraper-wrapper.js');
  
  const args = [
    wrapperPath,
    '--platform', platform,
    '--url', url,
    '--duration', duration,
    '--interval', interval,
    '--mode', mode
  ];

  if (headless) {
    args.push('--headless');
  }

  scraperProcess = spawn('node', args, {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  isRunning = true;

  console.log(`🚀 Starting ${platform} scraper...`);
  console.log('Config:', { platform, url, duration, interval, headless, mode });

  scraperProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Scraper]`, output);

    // Parse new comments
    if (output.includes('NEW_COMMENT:')) {
      try {
        const jsonStr = output.split('NEW_COMMENT:')[1].trim();
        const comment = JSON.parse(jsonStr);
        addComment(comment);
      } catch (e) {
        // Not JSON
      }
    }
  });

  scraperProcess.stderr.on('data', (data) => {
    console.error('[Scraper Error]', data.toString());
  });

  scraperProcess.on('close', (code) => {
    console.log(`🛑 Scraper process exited with code ${code}`);
    isRunning = false;
    scraperProcess = null;
  });

  scraperProcess.on('error', (error) => {
    console.error('❌ Failed to start scraper:', error);
    isRunning = false;
    scraperProcess = null;
  });
}

function stopScraper() {
  if (scraperProcess) {
    console.log('🛑 Stopping scraper process...');
    
    try {
      if (process.platform === 'win32') {
        const { exec } = require('child_process');
        exec(`taskkill /pid ${scraperProcess.pid} /T /F`, (error) => {
          if (error) console.error('Error killing process:', error);
        });
      } else {
        scraperProcess.kill('SIGTERM');
      }
    } catch (error) {
      console.error('Error stopping scraper:', error);
    }
    
    scraperProcess = null;
    isRunning = false;
    console.log('✅ Scraper stopped');
  }
}

function addComment(comment) {
  const exists = comments.some(c => 
    c.username === comment.username && 
    c.comment === comment.comment
  );

  if (!exists) {
    comments.push(comment);
  }
}

// ========== Start Server ==========

app.listen(PORT, () => {
  console.log(`🚀 E-commerce Live Scraper is running!`);
  console.log(`📱 Open in browser: http://localhost:${PORT}`);
  console.log(`🎨 Supports: TikTok, Shopee, Lazada\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  if (scraperProcess) {
    stopScraper();
  }
  process.exit(0);
});
