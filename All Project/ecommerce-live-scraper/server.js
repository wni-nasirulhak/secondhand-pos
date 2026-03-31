// Express Server สำหรับ TikTok Live Scraper UI
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

console.log('=========================================');
console.log('🚀 TRUTH TRAP: SERVER VERSION 2.5.0 ACTIVE');
console.log('📁 PATH:', __filename);
console.log('=========================================');
const https = require('https');
const http = require('http');
const readline = require('readline');

const app = express();
const PORT = 3000;

// ========== Webhook Helper Functions ==========
async function sendWebhook(webhook, data) {
    try {
        const { platform } = webhook;
        
        if (platform === 'discord') {
            return await sendDiscordWebhook(webhook, data);
        } else if (platform === 'slack') {
            return await sendSlackWebhook(webhook, data);
        } else if (platform === 'telegram') {
            return await sendTelegramMessage(webhook, data);
        } else if (platform === 'custom') {
            return await sendCustomWebhook(webhook, data);
        }
        
        return { success: false, error: 'Unknown platform' };
    } catch (error) {
        console.error('Webhook error:', error);
        return { success: false, error: error.message };
    }
}

async function sendDiscordWebhook(webhook, data) {
    return new Promise((resolve, reject) => {
        const payload = {
            embeds: [{
                title: '💬 TikTok Live Comment',
                description: data.comment,
                color: 0xfe2c55,
                fields: [
                    { name: '👤 Username', value: data.username, inline: true },
                    { name: '⏰ Time', value: new Date(data.timestamp).toLocaleString('th-TH'), inline: true }
                ],
                footer: { text: 'TikTok Live Scraper' },
                timestamp: new Date().toISOString()
            }]
        };

        const postData = JSON.stringify(payload);
        const url = new URL(webhook.url);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ success: true });
            } else {
                resolve({ success: false, error: `Discord returned ${res.statusCode}` });
            }
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function sendSlackWebhook(webhook, data) {
    return new Promise((resolve, reject) => {
        const payload = {
            text: '💬 TikTok Live Comment',
            blocks: [
                {
                    type: 'header',
                    text: { type: 'plain_text', text: '💬 TikTok Live Comment' }
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Username:*\n${data.username}` },
                        { type: 'mrkdwn', text: `*Time:*\n${new Date(data.timestamp).toLocaleString('th-TH')}` }
                    ]
                },
                {
                    type: 'section',
                    text: { type: 'mrkdwn', text: data.comment }
                }
            ]
        };

        const postData = JSON.stringify(payload);
        const url = new URL(webhook.url);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 200) {
                resolve({ success: true });
            } else {
                resolve({ success: false, error: `Slack returned ${res.statusCode}` });
            }
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function sendTelegramMessage(webhook, data) {
    return new Promise((resolve, reject) => {
        const payload = {
            chat_id: webhook.chatId,
            text: `💬 *TikTok Live Comment*\n\n👤 *User:* ${data.username}\n⏰ *Time:* ${new Date(data.timestamp).toLocaleString('th-TH')}\n\n💬 *Message:*\n${data.comment}`,
            parse_mode: 'Markdown'
        };

        const postData = JSON.stringify(payload);
        const url = new URL(`https://api.telegram.org/bot${webhook.token}/sendMessage`);
        
        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${webhook.token}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                const response = JSON.parse(responseData);
                if (response.ok) {
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: response.description || 'Telegram error' });
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function sendCustomWebhook(webhook, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const url = new URL(webhook.url);
        const isHttps = url.protocol === 'https:';
        
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const requestLib = isHttps ? https : http;
        const req = requestLib.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ success: true });
            } else {
                resolve({ success: false, error: `Custom webhook returned ${res.statusCode}` });
            }
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// State management (Multi-Session)
const sessions = new Map(); // id -> sessionObject
const DATA_DIR = path.join(__dirname, 'data', 'comments');
const MOCK_RULES_FILE = path.join(__dirname, 'data', 'mock_rules.json');

// Helper to generate unique session IDs
function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Global getters for backward compatibility where possible
const getIsRunning = () => Array.from(sessions.values()).some(s => s.status === 'running');
const getTotalComments = () => Array.from(sessions.values()).reduce((sum, s) => sum + s.comments.length, 0);

// AI Webhook Server state
let aiWebhookProcess = null;
let isAIWebhookRunning = false;
const AI_WEBHOOK_PORT = 3099;

// Helper: proxy request to AI webhook server
function proxyToAIWebhook(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: AI_WEBHOOK_PORT,
            path: path,
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
        req.setTimeout(3000, () => { req.destroy(); reject(new Error('AI Webhook proxy timeout')); });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ========== AI Webhook Server Endpoints ==========

// เริ่ม AI Webhook Server
app.post('/api/ai-webhook/start', async (req, res) => {
    if (isAIWebhookRunning) {
        return res.json({ success: true, message: 'AI Webhook server already running', port: AI_WEBHOOK_PORT });
    }

    try {
        const serverPath = path.join(__dirname, 'scripts', 'ai-webhook-server.js');
        const { aiMode, apiKey, systemPrompt, replyDelay } = req.body || {};

        aiWebhookProcess = spawn('node', [serverPath, AI_WEBHOOK_PORT], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        isAIWebhookRunning = true;

        aiWebhookProcess.stdout.on('data', data => {
            console.log('[AIWebhook]', data.toString().trim());
        });

        aiWebhookProcess.stderr.on('data', data => {
            const msg = data.toString().trim();
            if (msg) console.error('[AIWebhook]', msg);
        });

        aiWebhookProcess.on('close', code => {
            console.log(`[AIWebhook] Process closed (code: ${code})`);
            isAIWebhookRunning = false;
            aiWebhookProcess = null;
        });

        aiWebhookProcess.on('error', err => {
            console.error('[AIWebhook] Process error:', err.message);
            isAIWebhookRunning = false;
            aiWebhookProcess = null;
        });

        // Configure AI mode after startup
        if (aiMode || apiKey || systemPrompt || replyDelay !== undefined) {
            await new Promise(r => setTimeout(r, 1200));
            try {
                await proxyToAIWebhook('POST', '/config', { aiMode, apiKey, systemPrompt, replyDelay });
            } catch (e) {
                console.error('[AIWebhook] Config error:', e.message);
            }
        }

        res.json({
            success: true,
            message: 'AI Webhook server started!',
            port: AI_WEBHOOK_PORT,
            url: `http://localhost:${AI_WEBHOOK_PORT}/webhook`
        });
    } catch (error) {
        isAIWebhookRunning = false;
        console.error('Error starting AI webhook server:', error);
        res.json({ success: false, error: error.message });
    }
});

// หยุด AI Webhook Server
app.post('/api/ai-webhook/stop', (req, res) => {
    if (!isAIWebhookRunning || !aiWebhookProcess) {
        isAIWebhookRunning = false;
        return res.json({ success: true, message: 'AI Webhook server is not running' });
    }

    try {
        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec(`taskkill /pid ${aiWebhookProcess.pid} /T /F`, () => {});
        } else {
            aiWebhookProcess.kill('SIGTERM');
        }
        isAIWebhookRunning = false;
        aiWebhookProcess = null;
        res.json({ success: true, message: 'AI Webhook server stopped' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// สถานะ AI Webhook Server
app.get('/api/ai-webhook/status', async (req, res) => {
    if (!isAIWebhookRunning) {
        return res.json({ running: false });
    }

    try {
        const status = await proxyToAIWebhook('GET', '/status');
        res.json({ running: true, ...status, port: AI_WEBHOOK_PORT });
    } catch (e) {
        // Process might be starting still
        res.json({ running: isAIWebhookRunning, port: AI_WEBHOOK_PORT, error: e.message });
    }
});

// Logs ของ AI Webhook Server
app.get('/api/ai-webhook/logs', async (req, res) => {
    if (!isAIWebhookRunning) {
        return res.json({ logs: [], running: false });
    }

    try {
        const limit = req.query.limit || 20;
        const data = await proxyToAIWebhook('GET', `/logs?limit=${limit}`);
        res.json({ ...data, running: true });
    } catch (e) {
        res.json({ logs: [], running: true, error: e.message });
    }
});

// ล้าง Logs
app.delete('/api/ai-webhook/logs', async (req, res) => {
    try {
        const data = await proxyToAIWebhook('DELETE', '/logs');
        res.json(data);
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// อัปเดต Config ของ AI Webhook Server
app.post('/api/ai-webhook/config', async (req, res) => {
    try {
        const data = await proxyToAIWebhook('POST', '/config', req.body);
        res.json(data);
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// ========== API Endpoints ==========

// เริ่ม scraper
app.post('/api/start', async (req, res) => {
    try {
        let { url, duration, interval, headless, authMode, stealth, chromePath, browser, mode, replyCooldown, replyOnQuestion, replyTemplates, blacklist, whitelist, viplist, webhooks, aiWebhookUrl, hostUsername } = req.body;

        // Ensure headless is a strict boolean
        headless = (headless === true || headless === 'true');

        if (!url || !duration || !interval) {
            return res.json({ success: false, error: 'Missing required parameters' });
        }

        const sessionId = generateSessionId();
        const session = {
            id: sessionId,
            url,
            status: 'starting',
            config: { url, duration, interval, headless, authMode, stealth, chromePath, browser, mode, replyCooldown, replyOnQuestion, replyTemplates, blacklist, whitelist, viplist, webhooks, aiWebhookUrl, hostUsername },
            comments: [],
            startTime: Date.now(),
            process: null
        };

        sessions.set(sessionId, session);

        // เริ่ม scraper process
        const scraperProcess = await startScraper(sessionId, url, duration, interval, headless, authMode, stealth, chromePath, browser || 'chromium', mode || 'read', replyCooldown, replyOnQuestion, replyTemplates, blacklist, whitelist, viplist, webhooks, aiWebhookUrl, hostUsername);
        
        session.process = scraperProcess;
        session.status = 'running';

        res.json({ 
            success: true, 
            message: 'Scraper session started',
            sessionId: sessionId,
            config: session.config
        });
    } catch (error) {
        console.error('Error starting scraper:', error);
        res.json({ success: false, error: error.message });
    }
});

// เช็คสถานะคุกกี้
app.get('/api/check-cookies', async (req, res) => {
    try {
        // Ensure platform is correctly identified and trimmed
        let platform = (req.query.platform || '').toLowerCase().trim();
        
        // If empty or explicitly tiktok, set to tiktok. Otherwise don't fallback to tiktok.
        if (!platform || platform === 'undefined') platform = 'tiktok';
        
        const storageStatePath = path.join(__dirname, 'storage-states', `${platform}.json`);
        
        console.log(`[Cookies] Checking status for [${platform}] at: ${storageStatePath}`);
        
        const fsSync = require('fs');
        if (!fsSync.existsSync(storageStatePath)) {
            console.log(`[Cookies] ${platform} not found on disk.`);
            return res.json({ exists: false });
        }
        
        const content = await fs.readFile(storageStatePath, 'utf-8');
        const storageState = JSON.parse(content);
        const cookies = storageState.cookies || [];
        
        console.log(`[Cookies] Result for ${platform}: found ${cookies.length} cookies`);
        
        if (cookies.length === 0) {
            return res.json({ exists: false });
        }
        
        // Check if cookies are still valid (check expires)
        const now = Date.now() / 1000;
        let validCount = 0;
        let oldestExpiry = Infinity;
        
        cookies.forEach(cookie => {
            const expires = cookie.expires || -1;
            if (expires === -1 || expires > now) {
                validCount++;
                if (expires !== -1 && expires < oldestExpiry) {
                    oldestExpiry = expires;
                }
            }
        });
        
        const isValid = validCount > 0 && validCount / cookies.length > 0.5; // ถ้ามีครึ่งหนึ่งยังใช้ได้
        
        let expiryDate = null;
        if (oldestExpiry !== Infinity) {
            expiryDate = new Date(oldestExpiry * 1000).toLocaleString('th-TH');
        }
        
        res.json({
            exists: true,
            valid: isValid,
            cookieCount: cookies.length,
            validCount: validCount,
            expiryDate: expiryDate
        });
    } catch (error) {
        console.error('Error checking cookies:', error);
        res.json({ exists: false, error: error.message });
    }
});

// นำเข้า cookies จาก UI
app.post('/api/import-cookies', async (req, res) => {
    try {
        const { cookiesJson, platform: pName } = req.body;
        const platform = pName || 'tiktok';

        if (!cookiesJson) {
            return res.json({ success: false, error: 'กรุณาใส่ JSON คุกกี้' });
        }

        let cookies;
        try {
            cookies = JSON.parse(cookiesJson);
        } catch (e) {
            return res.json({ success: false, error: 'รูปแบบ JSON ไม่ถูกต้อง' });
        }

        // ถ้าเป็น object ที่มี cookies key (เช่น EditThisCookie export)
        if (!Array.isArray(cookies) && cookies.cookies) {
            cookies = cookies.cookies;
        }

        if (!Array.isArray(cookies)) {
            return res.json({ success: false, error: 'คุกกี้ต้องเป็น Array ของ Object' });
        }

        // Mapping platform to default domain
        const domainMap = {
            tiktok: '.tiktok.com',
            shopee: '.shopee.co.th',
            lazada: '.lazada.co.th',
            facebook: '.facebook.com',
            instagram: '.instagram.com',
            youtube: '.youtube.com'
        };

        // Normalize sameSite for Playwright
        const normalizedCookies = cookies.map(c => {
            let sameSite = (c.sameSite || 'Lax').toLowerCase();
            if (sameSite === 'no_restriction' || sameSite === 'none') {
                sameSite = 'None';
            } else if (sameSite === 'strict') {
                sameSite = 'Strict';
            } else {
                sameSite = 'Lax';
            }
            return {
                name: c.name,
                value: c.value,
                domain: c.domain || domainMap[platform] || '.tiktok.com',
                path: c.path || '/',
                expires: c.expirationDate || c.expires || -1,
                httpOnly: c.httpOnly || false,
                secure: c.secure || false,
                sameSite: sameSite
            };
        });

        const storageState = {
            cookies: normalizedCookies,
            origins: []
        };

        // บันทึกทั้งสองที่เพื่อให้ทำงานได้ทั้ง scraper และ check status
        const STATE_FILE_1 = path.join(__dirname, 'user-data', `${platform}_state.json`);
        const STATE_FILE_2 = path.join(__dirname, 'storage-states', `${platform}.json`);
        
        // Ensure directories exist
        const fsSync = require('fs');
        [STATE_FILE_1, STATE_FILE_2].forEach(file => {
            const dir = path.dirname(file);
            if (!fsSync.existsSync(dir)) {
                fsSync.mkdirSync(dir, { recursive: true });
            }
        });

        // บันทึกทั้งสองไฟล์
        await Promise.all([
            fs.writeFile(STATE_FILE_1, JSON.stringify(storageState, null, 2), 'utf8'),
            fs.writeFile(STATE_FILE_2, JSON.stringify(storageState, null, 2), 'utf8')
        ]);

        res.json({ 
            success: true, 
            message: `บันทึกคุกกี้สำหรับ ${platform} สำเร็จ! ตอนนี้คุณสามารถใช้โหมด StorageState ได้แล้ว` 
        });

    } catch (error) {
        console.error('Error importing cookies:', error);
        res.json({ success: false, error: error.message });
    }
});

// หยุด scraper
app.post('/api/stop', (req, res) => {
    const { sessionId } = req.body;
    
    if (sessionId) {
        // Stop specific session
        const session = sessions.get(sessionId);
        if (!session) return res.json({ success: false, error: 'Session not found' });
        
        try {
            stopScraper(sessionId);
            res.json({ success: true, message: `Session ${sessionId} stopped` });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    } else {
        // Stop ALL sessions
        try {
            sessions.forEach((s, id) => stopScraper(id));
            res.json({ success: true, message: 'All sessions stopped' });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    }
});

// ดึงรายการ Sessions ทั้งหมด
app.get('/api/sessions', (req, res) => {
    const list = Array.from(sessions.values()).map(s => ({
        id: s.id,
        url: s.url,
        status: s.status,
        startTime: s.startTime,
        commentsCount: s.comments.length,
        config: s.config
    }));
    res.json({ success: true, sessions: list });
});

// ดึงสถานะ (Legacy compat)
app.get('/api/status', (req, res) => {
    res.json({
        running: getIsRunning(),
        sessionsCount: sessions.size,
        totalComments: getTotalComments()
    });
});

// ดึงคอมเมนต์
app.get('/api/comments', (req, res) => {
    const { sessionId } = req.query;
    const limit = parseInt(req.query.limit) || 100;

    if (!sessionId) {
        // Legacy or consolidated view? For now return error or latest session
        const latestSession = Array.from(sessions.values()).pop();
        if (!latestSession) return res.json({ success: true, comments: [], total: 0 });
        
        const limitedComments = latestSession.comments.slice(-limit).reverse();
        return res.json({
            success: true,
            comments: limitedComments,
            total: latestSession.comments.length,
            sessionId: latestSession.id
        });
    }

    const session = sessions.get(sessionId);
    if (!session) {
        return res.json({ success: false, error: 'Session not found' });
    }

    const limitedComments = session.comments.slice(-limit).reverse();
    res.json({
        success: true,
        comments: limitedComments,
        total: session.comments.length,
        sessionId: sessionId
    });
});

// หา Chrome Profile Path
app.get('/api/find-chrome-path', (req, res) => {
    try {
        const os = require('os');
        const fs = require('fs');
        const username = os.userInfo().username;
        let chromePath = '';

        if (process.platform === 'win32') {
            chromePath = `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data`;
        } else if (process.platform === 'darwin') {
            chromePath = `/Users/${username}/Library/Application Support/Google/Chrome`;
        } else {
            chromePath = `/home/${username}/.config/google-chrome`;
        }

        // ตรวจสอบว่า path มีจริงหรือไม่
        const exists = fs.existsSync(chromePath);

        // หา profiles ทั้งหมด
        const profiles = [];
        if (exists) {
            try {
                const items = fs.readdirSync(chromePath);
                
                // หา Default
                if (items.includes('Default')) {
                    const defaultPath = path.join(chromePath, 'Default');
                    profiles.push({
                        name: 'Default',
                        path: defaultPath,
                        fullPath: defaultPath
                    });
                }

                // หา Profile 1, 2, 3...
                items.forEach(item => {
                    if (item.startsWith('Profile ')) {
                        const profilePath = path.join(chromePath, item);
                        profiles.push({
                            name: item,
                            path: profilePath,
                            fullPath: profilePath
                        });
                    }
                });
            } catch (err) {
                console.error('Error reading profiles:', err);
            }
        }

        res.json({
            success: true,
            path: chromePath,
            exists: exists,
            platform: process.platform,
            username: username,
            profiles: profiles
        });
    } catch (error) {
        console.error('Error finding Chrome path:', error);
        res.json({ success: false, error: error.message });
    }
});

// ดาวน์โหลดคอมเมนต์
app.get('/api/download', async (req, res) => {
    const format = req.query.format || 'json';

    try {
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=tiktok_comments_${Date.now()}.json`);
            res.send(JSON.stringify(comments, null, 2));
        } else if (format === 'csv') {
            const csv = convertToCSV(comments);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=tiktok_comments_${Date.now()}.csv`);
            res.send('\ufeff' + csv); // BOM for UTF-8
        } else {
            res.status(400).json({ error: 'Invalid format. Use json or csv.' });
        }
    } catch (error) {
        console.error('Error downloading:', error);
        res.status(500).json({ error: error.message });
    }
});

// ดูรายการประวัติคอมเมนต์
app.get('/api/comment-histories', async (req, res) => {
    try {
        const dataDir = path.join(__dirname, 'data', 'comments');
        
        // ตรวจสอบว่ามีโฟลเดอร์หรือไม่
        if (!require('fs').existsSync(dataDir)) {
            return res.json({ success: true, histories: [] });
        }

        const files = await fs.readdir(dataDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        const histories = await Promise.all(jsonFiles.map(async (filename) => {
            const filePath = path.join(dataDir, filename);
            const stats = await fs.stat(filePath);
            
            // อ่านไฟล์เพื่อนับจำนวนคอมเมนต์
            let count = 0;
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);
                count = Array.isArray(data) ? data.length : 0;
            } catch (e) {
                console.error(`Error reading ${filename}:`, e);
            }

            // Parse วันที่จากชื่อไฟล์ (comments_YYYY-MM-DD_HH-mm-ss.json)
            const match = filename.match(/comments_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.json/);
            let date = 'Unknown';
            let time = 'Unknown';
            
            if (match) {
                date = match[1];
                time = match[2].replace(/-/g, ':');
            }

            return {
                filename,
                date,
                time,
                count,
                size: stats.size,
                created: stats.birthtime
            };
        }));

        // เรียงตามวันที่ล่าสุด
        histories.sort((a, b) => new Date(b.created) - new Date(a.created));

        res.json({ success: true, histories });
    } catch (error) {
        console.error('Error listing histories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ดูคอมเมนต์เฉพาะไฟล์
app.get('/api/comment-histories/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'data', 'comments', filename);

        if (!require('fs').existsSync(filePath)) {
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

// ดาวน์โหลดไฟล์ประวัติ
app.get('/api/comment-histories/:filename/download', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'data', 'comments', filename);

        if (!require('fs').existsSync(filePath)) {
            return res.status(404).send('ไม่พบไฟล์');
        }

        res.download(filePath, filename);
    } catch (error) {
        console.error('Error downloading history:', error);
        res.status(500).send('เกิดข้อผิดพลาด');
    }
});

// ทดสอบ Webhook
app.post('/api/webhook/test', async (req, res) => {
    try {
        const { webhook, testMessage } = req.body;
        
        if (!webhook) {
            return res.json({ success: false, error: 'ไม่มี webhook config' });
        }

        const result = await sendWebhook(webhook, testMessage);
        
        if (result.success) {
            res.json({ success: true, message: 'ส่ง webhook สำเร็จ!' });
        } else {
            res.json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error testing webhook:', error);
        res.json({ success: false, error: error.message });
    }
});

// ========== Mock Rules API ==========

app.get('/api/mock-rules', async (req, res) => {
    try {
        const fsSync = require('fs');
        if (fsSync.existsSync(MOCK_RULES_FILE)) {
            const content = await fs.readFile(MOCK_RULES_FILE, 'utf8');
            res.json(JSON.parse(content));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading mock rules:', error);
        res.status(500).json({ error: 'Failed to read mock rules' });
    }
});

app.post('/api/mock-rules', async (req, res) => {
    try {
        const rules = req.body;
        if (!Array.isArray(rules)) {
            return res.status(400).json({ error: 'Invalid rules format (must be an array)' });
        }
        await fs.writeFile(MOCK_RULES_FILE, JSON.stringify(rules, null, 2), 'utf8');
        res.json({ success: true, message: 'บันทึกกฎ Mock AI สำเร็จ!' });
    } catch (error) {
        console.error('Error saving mock rules:', error);
        res.status(500).json({ error: 'Failed to save mock rules' });
    }
});

// ลบเซสชัน
app.delete('/api/sessions/:id', (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = sessions.get(sessionId);
        
        if (!session) {
            return res.status(404).json({ success: false, error: 'ไม่พบเซสชัน' });
        }

        if (session.status === 'running') {
            return res.status(400).json({ success: false, error: 'ไม่สามารถลบเซสชันที่กำลังทำงานอยู่ได้ กรุณาหยุดก่อน' });
        }

        sessions.delete(sessionId);
        console.log(`🗑️ Deleted session: ${sessionId}`);
        res.json({ success: true, message: 'ลบเซสชันสำเร็จ' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ลบไฟล์ประวัติ
app.delete('/api/comment-histories/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'data', 'comments', filename);

        if (!require('fs').existsSync(filePath)) {
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

async function startScraper(sessionId, url, duration, interval, headless, authMode, stealth, chromePath, browser = 'chromium', mode = 'read', replyCooldown = 5, replyOnQuestion = true, replyTemplates = [], blacklist = [], whitelist = [], viplist = [], webhooks = [], aiWebhookUrl = null, hostUsername = null) {
    let wrapperPath = path.join(__dirname, 'scripts', 'scraper_wrapper.js');
    
    // Choose wrapper based on platform
    const lowUrl = url.toLowerCase();
    const isMultiPlatform = lowUrl.includes('shopee') || 
                            lowUrl.includes('lazada') || 
                            lowUrl.includes('facebook.com') || 
                            lowUrl.includes('instagram.com') || 
                            lowUrl.includes('youtube.com') || 
                            lowUrl.includes('youtu.be');

    if (isMultiPlatform) {
        wrapperPath = path.join(__dirname, 'scripts', 'unified_wrapper.js');
        let platform = 'Platform';
        if (lowUrl.includes('shopee')) platform = 'Shopee';
        else if (lowUrl.includes('lazada')) platform = 'Lazada';
        else if (lowUrl.includes('facebook')) platform = 'Facebook';
        else if (lowUrl.includes('instagram')) platform = 'Instagram';
        else if (lowUrl.includes('youtube') || lowUrl.includes('youtu.be')) platform = 'YouTube';
        
        console.log(`🔌 Using Unified Wrapper for: ${platform}`);
    } else {
        console.log('📱 Using Original Wrapper for TikTok');
    }


    
    const args = [
        wrapperPath,
        '--url', url,
        '--duration', duration,
        '--interval', interval,
        '--browser', browser,
        '--mode', mode
    ];

    if (headless === true) {
        args.push('--headless');
        console.log('👻 Starting in HEADLESS mode (window hidden)');
    } else {
        console.log('🌐 Starting in HEADFUL mode (window visible)');
    }

    if (stealth === 'enabled' || stealth === true) args.push('--stealth');

    // Reply settings for respond mode
    if (mode === 'respond') {
        args.push('--reply-cooldown');
        args.push(replyCooldown || 5);
        
        if (replyOnQuestion) {
            args.push('--reply-on-question');
        }
        
        // Send reply templates as JSON
        if (replyTemplates && replyTemplates.length > 0) {
            args.push('--reply-templates');
            args.push(JSON.stringify(replyTemplates));
        }
        
        // Send user lists as JSON
        if (blacklist && blacklist.length > 0) {
            args.push('--blacklist');
            args.push(JSON.stringify(blacklist));
        }
        
        if (whitelist && whitelist.length > 0) {
            args.push('--whitelist');
            args.push(JSON.stringify(whitelist));
        }
        
        if (viplist && viplist.length > 0) {
            args.push('--viplist');
            args.push(JSON.stringify(viplist));
        }
        
        // Send webhooks as JSON
        if (webhooks && webhooks.length > 0) {
            args.push('--webhooks');
            args.push(JSON.stringify(webhooks));
        }
    }

    if (authMode === 'chrome' && chromePath) {
        args.push('--chrome-profile');
        args.push(chromePath);
    } else if (authMode === 'persistent' || authMode === 'storage') {
        // StorageState is handled inside the wrapper if STATE_FILE exists
        if (authMode === 'persistent') args.push('--persistent');
    }

    // AI Webhook URL (for AI-powered replies)
    if (aiWebhookUrl && mode === 'respond') {
        args.push('--ai-webhook-url');
        args.push(aiWebhookUrl);
        console.log(`🤖 AI Webhook enabled: ${aiWebhookUrl}`);
    }

    // Host Username (to prevent self-replying)
    if (hostUsername) {
        args.push('--host-username');
        args.push(hostUsername);
        console.log(`🏠 Host exclusion enabled: ${hostUsername}`);
    }

    const scraperProcess = spawn('node', args, {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    console.log(`🚀 Starting scraper [${sessionId}] with browser: ${browser} | mode: ${mode}`);

    // Data handling (stdout) - Robust line-by-line parsing
    const rl = readline.createInterface({
        input: scraperProcess.stdout,
        terminal: false
    });

    rl.on('line', (line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        let commentData = null;
        if (trimmedLine.startsWith('COMMENT:')) {
            try {
                commentData = JSON.parse(trimmedLine.substring(8));
            } catch (e) {}
        } else if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
            try {
                commentData = JSON.parse(trimmedLine);
            } catch (e) {}
        }

        if (commentData && commentData.username && commentData.comment) {
            addCommentToSession(sessionId, commentData);
            
            // Send to webhooks if in respond mode and not internal
            if (mode === 'respond' && !commentData.isInternal && webhooks && webhooks.length > 0) {
                webhooks.forEach(wh => sendWebhook(wh, commentData).catch(e => console.error('Webhook error:', e)));
            }
        } else {
            console.log(`[${sessionId}]`, trimmedLine);
        }
    });

    scraperProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.error(`[${sessionId} ERR]`, msg);
    });

    scraperProcess.on('close', (code) => {
        console.log(`🛑 [${sessionId}] Scraper process exited with code ${code}`);
        const session = sessions.get(sessionId);
        if (session) {
            session.status = 'stopped';
            saveSessionComments(sessionId);
        }
    });

    scraperProcess.on('error', (err) => {
        console.error(`❌ [${sessionId}] Failed to start scraper:`, err);
        const session = sessions.get(sessionId);
        if (session) session.status = 'error';
    });

    return scraperProcess;
}

function stopScraper(sessionId) {
    const session = sessions.get(sessionId);
    if (!session || !session.process) return;

    console.log(`🛑 Stopping scraper session: ${sessionId}`);
    
    try {
        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec(`taskkill /pid ${session.process.pid} /T /F`, (err) => {
                if (err) console.error(`Error killing ${sessionId}:`, err);
            });
        } else {
            session.process.kill('SIGTERM');
            setTimeout(() => {
                if (session.process && !session.process.killed) session.process.kill('SIGKILL');
            }, 2000);
        }
    } catch (e) {
        console.error(`Error stopping ${sessionId}:`, e);
    }
    
    session.status = 'stopped';
    saveSessionComments(sessionId);
}

function addCommentToSession(sessionId, comment) {
    const session = sessions.get(sessionId);
    if (!session) return;

    // Check for duplicates
    const exists = session.comments.some(c => 
        c.username === comment.username && 
        c.comment === comment.comment
    );

    if (!exists) {
        session.comments.push({
            timestamp: comment.timestamp || new Date().toISOString(),
            username: comment.username,
            comment: comment.comment,
            isInternal: comment.isInternal || false
        });

        // Limit memory
        if (session.comments.length > 5000) session.comments.shift();
    }
}

async function saveSessionComments(sessionId) {
    const session = sessions.get(sessionId);
    if (!session || session.comments.length === 0) return;

    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const date = new Date().toISOString().split('T')[0];
        const lowUrl = session.config.url.toLowerCase();
        let platform = 'live';
        if (lowUrl.includes('tiktok')) platform = 'tiktok';
        else if (lowUrl.includes('shopee')) platform = 'shopee';
        else if (lowUrl.includes('lazada')) platform = 'lazada';
        else if (lowUrl.includes('facebook')) platform = 'facebook';
        else if (lowUrl.includes('instagram')) platform = 'instagram';
        else if (lowUrl.includes('youtube')) platform = 'youtube';
        
        const filename = `history_${platform}_${sessionId}_${date}.json`;
        const filepath = path.join(DATA_DIR, filename);

        await fs.writeFile(filepath, JSON.stringify(session.comments, null, 2), 'utf8');
        console.log(`💾 Saved ${session.comments.length} comments for ${sessionId} to ${filename}`);
    } catch (error) {
        console.error(`❌ Error saving ${sessionId}:`, error);
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = ['Timestamp', 'Username', 'Comment'];
    const rows = data.map(item => [
        item.timestamp,
        item.username,
        item.comment.replace(/"/g, '""') // Escape quotes
    ]);

    const csvRows = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];

    return csvRows.join('\n');
}

function ensureWrapperScript() {
    const wrapperPath = path.join(__dirname, 'scripts', 'scraper_wrapper.js');
    const wrapperContent = `// Auto-generated wrapper script
// This file connects the UI to the scraper
const { chromium } = require('playwright');
const path = require('path');

const args = process.argv.slice(2);
const config = {
    url: args[args.indexOf('--url') + 1] || '',
    duration: parseInt(args[args.indexOf('--duration') + 1]) || 60,
    interval: parseInt(args[args.indexOf('--interval') + 1]) || 3,
    headless: args.includes('--headless'),
    usePersistent: args.includes('--persistent'),
    proxy: args.includes('--proxy') ? args[args.indexOf('--proxy') + 1] : null,
    chromePath: args.includes('--chrome-profile') ? args[args.indexOf('--chrome-profile') + 1] : null
};

const seenKeys = new Set();
let browser = null;
let context = null;
let shouldStop = false;

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.error('🛑 Received SIGTERM, stopping gracefully...');
    shouldStop = true;
    if (browser) {
        await browser.close();
    }
    if (context) {
        await context.close();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.error('🛑 Received SIGINT, stopping gracefully...');
    shouldStop = true;
    if (browser) {
        await browser.close();
    }
    if (context) {
        await context.close();
    }
    process.exit(0);
});

async function extractComments(page) {
    return await page.evaluate(() => {
        const comments = [];
        const selectors = {
            container: ['[data-e2e="comment-item"]', '.comment-item', '[class*="Comment"]'],
            username: ['[data-e2e="comment-username"]', '.comment-username', '[class*="Username"]'],
            text: ['[data-e2e="comment-text"]', '.comment-text-content', '[class*="CommentText"]']
        };

        function findElements(selectors) {
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) return Array.from(elements);
            }
            return [];
        }

        function getText(parent, selectors) {
            for (const selector of selectors) {
                const el = parent.querySelector(selector);
                if (el && el.textContent.trim()) return el.textContent.trim();
            }
            return '';
        }

        const commentElements = findElements(selectors.container);
        commentElements.forEach((element) => {
            try {
                const username = getText(element, selectors.username) || 'Unknown';
                const commentText = getText(element, selectors.text);
                if (commentText) {
                    comments.push({ username, comment: commentText });
                }
            } catch (e) {}
        });

        return comments;
    });
}

async function main() {
    try {
        let page;
        
        // เลือกใช้ Chrome profile
        if (config.chromePath) {
            console.error('🌐 Using Chrome profile path:', config.chromePath);
            
            let userDataDir = config.chromePath;
            let profileDir = 'Default';
            
            // Extract Profile Directory if included in the path (e.g., ends with \\Default or \\Profile 1)
            const pathParts = config.chromePath.split(/[\\\\\\/]/);
            const lastPart = pathParts[pathParts.length - 1];
            
            if (lastPart === 'Default' || lastPart.startsWith('Profile ')) {
                profileDir = lastPart;
                userDataDir = config.chromePath.substring(0, config.chromePath.length - lastPart.length - 1);
            }
            
            const port = 9222;
            const os = require('os');
            const fs = require('fs');
            
            let execPath = '';
            if (process.platform === 'win32') {
                const paths = [
                    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
                    'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
                    path.join(os.homedir(), 'AppData\\\\Local\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe')
                ];
                execPath = paths.find(p => fs.existsSync(p));
            } else if (process.platform === 'darwin') {
                execPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            } else {
                execPath = '/usr/bin/google-chrome';
            }

            if (!execPath) throw new Error('Could not find Chrome executable. Please install Google Chrome.');

            const chromeArgs = [
                \`--user-data-dir=\${userDataDir}\`,
                \`--profile-directory=\${profileDir}\`,
                \`--remote-debugging-port=\${port}\`,
                \`--remote-allow-origins=*\`,
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-restore-session-state'
            ];
            
            if (config.headless) {
                chromeArgs.push('--headless');
            }
            if (config.proxy) {
                chromeArgs.push(\`--proxy-server=\${config.proxy}\`);
            }
            
            try {
                console.error('🚀 Launching Chrome natively (bypassing Playwright hang)...');
                console.error(\`📂 User Data Dir: \${userDataDir}\`);
                console.error(\`👤 Profile Dir: \${profileDir}\`);

                const { spawn } = require('child_process');
                const chromeProcess = spawn(execPath, chromeArgs, {
                    detached: true,
                    stdio: 'ignore'
                });
                chromeProcess.unref();

                console.error('⏳ Waiting for Chrome CDP to be available (3 seconds)...');
                await new Promise(r => setTimeout(r, 3000));

                console.error('🔌 Connecting to Chrome over CDP on 127.0.0.1...');
                browser = await chromium.connectOverCDP(\`http://127.0.0.1:\${port}\`, { timeout: 15000 });
                context = browser.contexts()[0];
                
                // สร้าง Tab ใหม่เสมอเพื่อป้องกัน ERR_ABORTED จากหน้าโฮมเพจ/New Tab ของ Chrome
                page = await context.newPage();
                
                // ปิด Tab เก่าๆ ที่เพิ่งเปิดขึ้นมาพร้อมกับ Chrome ตัวใหม่
                try {
                    const pages = context.pages();
                    for (let i = 0; i < pages.length; i++) {
                        if (pages[i] !== page) {
                            await pages[i].close();
                        }
                    }
                } catch (e) {}

                console.error('✅ Connected to Chrome successfully!');
            } catch (error) {
                console.error('❌ Error connecting to Chrome over CDP:', error.message);
                console.error('💡 Make sure ALL Google Chrome windows are closed before running!');
                throw error;
            }
        } else if (config.usePersistent) {
            // ใช้ persistent context ของ scraper
            const userDataDir = path.join(__dirname, '..', 'user-data');
            console.error('🔐 Using persistent browser context (logged in session)');
            
            const launchOptions = { 
                headless: config.headless,
                channel: 'chrome'
            };
            
            if (config.proxy) {
                launchOptions.proxy = { server: config.proxy };
            }
            
            context = await chromium.launchPersistentContext(userDataDir, launchOptions);
            page = context.pages()[0] || await context.newPage();
        } else {
            // ใช้ browser แบบปกติ
            const launchOptions = { 
                headless: config.headless,
                channel: 'chrome'
            };
            
            if (config.proxy) {
                launchOptions.proxy = { server: config.proxy };
            }
            
            browser = await chromium.launch(launchOptions);
            const contextOptions = {};
            if (config.proxy) {
                contextOptions.proxy = { server: config.proxy };
            }
            context = await browser.newContext(contextOptions);
            page = await context.newPage();
        }

        console.error('🔴 Starting scraper...');
        console.error(\`⚙️  URL: \${config.url}\`);
        console.error(\`⏱️  Duration: \${config.duration}s | Interval: \${config.interval}s\`);
        console.error(\`🌐 Chrome Path: \${config.chromePath || 'default'}\`);

        // รอให้ page พร้อม
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.error(\`🔗 Navigating to: \${config.url}\`);
        
        try {
            await page.goto(config.url, { 
                waitUntil: 'domcontentloaded', 
                timeout: 60000 
            });
            console.error('✅ Page loaded successfully');
            
            // รอให้ page โหลดเสร็จ
            await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
                console.error('⚠️  Network not idle, continuing anyway...');
            });
            
            console.error('✅ Page ready, starting to scrape...');
        } catch (error) {
            console.error('⚠️  Navigation error:', error.message);
            console.error('🔄 Trying again with simpler wait...');
            await page.goto(config.url, { 
                waitUntil: 'load', 
                timeout: 60000 
            });
        }

        const startTime = Date.now();
        let round = 0;

        while ((Date.now() - startTime) / 1000 < config.duration && !shouldStop) {
            if (shouldStop) break;
            
            round++;
            
            try {
                const comments = await extractComments(page);

                comments.forEach(({ username, comment }) => {
                    const key = \`\${username}:\${comment}\`;
                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        console.log(JSON.stringify({
                            timestamp: new Date().toISOString(),
                            username,
                            comment
                        }));
                    }
                });
            } catch (error) {
                console.error('Error extracting comments:', error.message);
            }

            if (!shouldStop) {
                await new Promise(resolve => setTimeout(resolve, config.interval * 1000));
            }
        }

        if (browser) {
            await browser.close();
            browser = null;
        }
        if (context && !config.usePersistent) {
            await context.close();
            context = null;
        }
        console.error('✅ Scraping completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (browser) {
            await browser.close();
        }
        if (context && !config.usePersistent) {
            await context.close();
        }
        process.exit(1);
    }
}

main();
`;

    try {
        require('fs').writeFileSync(wrapperPath, wrapperContent, 'utf8');
    } catch (error) {
        console.error('Error creating wrapper script:', error);
    }
}

// ========== Start Server ==========

app.listen(PORT, () => {
    console.log(`🚀 TikTok Live Scraper UI is running!`);
    console.log(`📱 Open in browser: http://localhost:${PORT}`);
    console.log(`🎨 Ready to scrape TikTok Live comments!\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    if (scraperProcess) {
        stopScraper();
    }
    process.exit(0);
});
