// AI Webhook Server Routes
const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let aiProcess = null;
let isRunning = false;
const AI_PORT = 3099;

// Proxy helper
function proxyToAI(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: AI_PORT,
      path: apiPath,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body) {
      const data = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, res => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(rawData)); }
        catch (e) { resolve({ raw: rawData }); }
      });
    });

    req.on('error', reject);
    req.setTimeout(3000, () => { req.destroy(); reject(new Error('AI server timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Start AI webhook server
router.post('/start', async (req, res) => {
  if (isRunning) {
    return res.json({ success: true, message: 'AI server already running', port: AI_PORT });
  }

  try {
    const serverPath = path.join(__dirname, '..', '..', 'scripts', 'ai-webhook-server.js');
    const { aiMode, apiKey, systemPrompt, replyDelay } = req.body || {};

    aiProcess = spawn('node', [serverPath, AI_PORT], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    isRunning = true;

    aiProcess.stdout.on('data', data => {
      console.log('[AI]', data.toString().trim());
    });

    aiProcess.stderr.on('data', data => {
      const msg = data.toString().trim();
      if (msg) console.error('[AI]', msg);
    });

    aiProcess.on('close', code => {
      console.log(`[AI] Process closed (code: ${code})`);
      isRunning = false;
      aiProcess = null;
    });

    aiProcess.on('error', err => {
      console.error('[AI] Process error:', err.message);
      isRunning = false;
      aiProcess = null;
    });

    // Configure AI after startup
    if (aiMode || apiKey || systemPrompt || replyDelay !== undefined) {
      await new Promise(r => setTimeout(r, 1200));
      try {
        await proxyToAI('POST', '/config', { aiMode, apiKey, systemPrompt, replyDelay });
      } catch (e) {
        console.error('[AI] Config error:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'AI server started!',
      port: AI_PORT,
      url: `http://localhost:${AI_PORT}/webhook`
    });
  } catch (error) {
    isRunning = false;
    console.error('Error starting AI server:', error);
    res.json({ success: false, error: error.message });
  }
});

// Stop AI webhook server
router.post('/stop', (req, res) => {
  if (!isRunning || !aiProcess) {
    isRunning = false;
    return res.json({ success: true, message: 'AI server not running' });
  }

  try {
    if (process.platform === 'win32') {
      const { exec } = require('child_process');
      exec(`taskkill /pid ${aiProcess.pid} /T /F`, () => {});
    } else {
      aiProcess.kill('SIGTERM');
    }
    isRunning = false;
    aiProcess = null;
    res.json({ success: true, message: 'AI server stopped' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Get AI status
router.get('/status', async (req, res) => {
  if (!isRunning) {
    return res.json({ running: false });
  }

  try {
    const status = await proxyToAI('GET', '/status');
    res.json({ running: true, ...status, port: AI_PORT });
  } catch (e) {
    res.json({ running: isRunning, port: AI_PORT, error: e.message });
  }
});

// Get AI logs
router.get('/logs', async (req, res) => {
  if (!isRunning) {
    return res.json({ logs: [], running: false });
  }

  try {
    const limit = req.query.limit || 20;
    const data = await proxyToAI('GET', `/logs?limit=${limit}`);
    res.json({ ...data, running: true });
  } catch (e) {
    res.json({ logs: [], running: true, error: e.message });
  }
});

// Clear AI logs
router.delete('/logs', async (req, res) => {
  try {
    const data = await proxyToAI('DELETE', '/logs');
    res.json(data);
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// Update AI config
router.post('/config', async (req, res) => {
  try {
    const data = await proxyToAI('POST', '/config', req.body);
    res.json(data);
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

module.exports = router;
