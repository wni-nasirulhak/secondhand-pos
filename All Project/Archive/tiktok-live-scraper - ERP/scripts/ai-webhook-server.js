/**
 * AI Webhook Simulator Server
 * 
 * รับคอมเมนต์จาก TikTok Scraper แล้วตอบกลับด้วย AI (mock/real)
 * 
 * Endpoints:
 *   POST /webhook        - รับ comment, คืน reply
 *   GET  /status         - สถานะ server
 *   GET  /logs           - ประวัติ interactions
 *   DELETE /logs         - ล้าง logs
 *   POST /config         - อัปเดต config
 */

const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = parseInt(process.argv[2]) || 3001;

app.use(express.json());

// ========== Configuration ==========
let config = {
    aiMode: 'mock',       // 'mock' | 'openai' | 'gemini'
    apiKey: '',
    systemPrompt: `คุณคือ AI ผู้ช่วยตอบคอมเมนต์ใน TikTok Live สด
ตอบเป็นภาษาไทย สั้น กระชับ เป็นมิตร ไม่เกิน 60 ตัวอักษร
ขึ้นต้นด้วย @username เสมอ
ห้ามตอบยาวเกินไป ห้ามใช้ markdown`,
    replyDelay: 300,      // ms delay ก่อนตอบ (จำลอง AI processing time)
    skipJoinMessages: true
};

// ========== Stats ==========
let totalProcessed = 0;
let totalReplied = 0;
let totalSkipped = 0;
const logs = [];

// ========== Mock AI Rules Engine ==========
let MOCK_RULES = [];

function loadMockRules() {
    try {
        const rulesPath = path.join(__dirname, '..', 'data', 'mock_rules.json');
        if (fs.existsSync(rulesPath)) {
            const content = fs.readFileSync(rulesPath, 'utf8');
            MOCK_RULES = JSON.parse(content);
        } else {
            MOCK_RULES = [];
        }
    } catch (e) {
        console.error('❌ Error loading mock rules:', e.message);
        MOCK_RULES = [];
    }
}

// Initial load
loadMockRules();

function generateMockReply(username, comment) {
    if (!comment) return null;
    const lower = comment.toLowerCase().trim();

    // Reload rules on each request for simplicity (small file)
    loadMockRules();

    // 1. Skip join/system messages
    if (config.skipJoinMessages) {
        if (['เข้าร่วมแล้ว', 'joined', 'followed', 'ติดตาม'].some(w => lower.includes(w))) {
            return null;
        }
    }

    // 2. Loop through Rule Engine
    for (const rule of MOCK_RULES) {
        if (rule.keywords && rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
            if (rule.replies && rule.replies.length > 0) {
                const randomIndex = Math.floor(Math.random() * rule.replies.length);
                const reply = rule.replies[randomIndex];
                return reply.replace('@username', `@${username}`);
            }
        }
    }

    // 3. Fallback: Default random replies
    const defaultReplies = [
        `@${username} ขอบคุณที่คอมเมนต์นะครับ 🙏`,
        `@${username} เห็นคอมเมนต์แล้วครับ! 😊`,
        `@${username} ขอบคุณมากๆ เลยนะครับ ❤️`,
        `@${username} ยินดีที่ได้คุยด้วยนะครับ ✨`,
        `@${username} ขอบคุณที่ติดตามนะครับ 💖`,
    ];
    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}

// ========== OpenAI API ==========
async function callOpenAI(username, comment) {
    if (!config.apiKey) throw new Error('ไม่มี OpenAI API key');

    const sysPrompt = config.systemPrompt || `You are a helpful TikTok Live host assistant. Reply in Thai, briefly and friendly, under 60 characters. Always start with @username.`;
    
    const payload = JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: `Username: ${username}\nComment: ${comment}` }
        ],
        max_tokens: 80,
        temperature: 0.8
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    if (res.statusCode === 429) {
                        reject(new Error('Rate Limit Exceeded (429): OpenAI quota hit! Please slow down or check your plan.'));
                        return;
                    }

                    const text = result.choices?.[0]?.message?.content?.trim();
                    if (text) resolve(text);
                    else reject(new Error('Invalid OpenAI response: ' + data.substring(0, 200)));
                } catch (e) {
                    reject(new Error('Invalid OpenAI JSON response'));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('OpenAI request timeout')); });
        req.write(payload);
        req.end();
    });
}

// ========== Google Gemini API ==========
async function callGemini(username, comment) {
    if (!config.apiKey) throw new Error('ไม่มี Gemini API key');

    const prompt = `${config.systemPrompt || 'ตอบเป็นภาษาไทย สั้น กระชับ เป็นมิตร ขึ้นต้นด้วย @username เสมอ'}

Username: ${username}
Comment: ${comment}

Reply:`;

    const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 80 }
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1/models/gemini-2.0-flash:generateContent?key=${config.apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    if (res.statusCode === 429) {
                        reject(new Error('Rate Limit Exceeded (429): Gemini quota hit! Please slow down or switch to gpt-4o-mini.'));
                        return;
                    }

                    const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (text) resolve(text);
                    else {
                        const geminiError = result.error ? ` [${result.error.code}] ${result.error.message}` : '';
                        reject(new Error(`Invalid Gemini response${geminiError}`));
                    }
                } catch (e) {
                    reject(new Error('Invalid Gemini JSON response'));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Gemini request timeout')); });
        req.write(payload);
        req.end();
    });
}

// ========== Routes ==========

// Main webhook - receives comment, returns AI reply
app.post('/webhook', async (req, res) => {
    const { username, comment, timestamp } = req.body;

    if (!username || !comment) {
        return res.status(400).json({ reply: null, skip: true, error: 'Missing username or comment' });
    }

    totalProcessed++;
    const timeStr = new Date().toLocaleTimeString('th-TH');
    console.log(`\n📨 [${timeStr}] ${username}: ${comment}`);

    let reply = null;
    let aiProvider = config.aiMode;
    let errorMsg = null;
    const startTime = Date.now();

    // Simulate AI processing delay
    if (config.replyDelay > 0) {
        await new Promise(r => setTimeout(r, config.replyDelay));
    }

    try {
        switch (config.aiMode) {
            case 'openai':
                reply = await callOpenAI(username, comment);
                break;
            case 'gemini':
                reply = await callGemini(username, comment);
                break;
            default: // mock
                reply = generateMockReply(username, comment);
                aiProvider = 'mock';
        }
    } catch (err) {
        errorMsg = err.message;
        console.error(`❌ [${config.aiMode}] Error: ${err.message}`);
        // Fallback to mock
        reply = generateMockReply(username, comment);
        aiProvider = `mock (fallback จาก ${config.aiMode})`;
        console.log(`🔄 Fallback to mock AI`);
    }

    const duration = Date.now() - startTime;

    // Save log
    const logEntry = {
        id: Date.now() + Math.random(),
        receivedAt: new Date().toISOString(),
        username,
        comment,
        reply,
        aiProvider,
        duration,
        error: errorMsg,
        skipped: reply === null
    };

    logs.unshift(logEntry);
    if (logs.length > 500) logs.splice(500);

    if (reply) {
        totalReplied++;
        console.log(`🤖 [${aiProvider}] ${duration}ms → ${reply}`);
    } else {
        totalSkipped++;
        console.log(`⏭️  Skipped (no reply)`);
    }

    res.json({
        reply,
        processed: true,
        aiProvider,
        duration,
        error: errorMsg,
        skip: reply === null
    });
});

// GET /status
app.get('/status', (req, res) => {
    res.json({
        running: true,
        port: PORT,
        aiMode: config.aiMode,
        hasApiKey: !!config.apiKey,
        totalProcessed,
        totalReplied,
        totalSkipped,
        replyRate: totalProcessed > 0 ? ((totalReplied / totalProcessed) * 100).toFixed(1) : '0',
        uptime: Math.floor(process.uptime())
    });
});

// GET /logs
app.get('/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 30;
    res.json({ logs: logs.slice(0, limit), total: logs.length });
});

// DELETE /logs
app.delete('/logs', (req, res) => {
    logs.length = 0;
    totalProcessed = 0;
    totalReplied = 0;
    totalSkipped = 0;
    console.log('🗑️  Logs cleared');
    res.json({ success: true });
});

// POST /config
app.post('/config', (req, res) => {
    const { aiMode, apiKey, systemPrompt, replyDelay, skipJoinMessages } = req.body;
    if (aiMode) config.aiMode = aiMode;
    if (apiKey !== undefined) config.apiKey = apiKey;
    if (systemPrompt) config.systemPrompt = systemPrompt;
    if (replyDelay !== undefined) config.replyDelay = parseInt(replyDelay);
    if (skipJoinMessages !== undefined) config.skipJoinMessages = skipJoinMessages;

    console.log(`⚙️  Config: mode=${config.aiMode} | hasKey=${!!config.apiKey} | delay=${config.replyDelay}ms`);
    res.json({ success: true, config: { ...config, apiKey: config.apiKey ? '***' : '' } });
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Start server
const server = app.listen(PORT, () => {
    console.log(`\n🤖 ============================================`);
    console.log(`   AI Webhook Simulator`);
    console.log(`🤖 ============================================`);
    console.log(`📡 Port:    http://localhost:${PORT}`);
    console.log(`🔗 Webhook: POST http://localhost:${PORT}/webhook`);
    console.log(`📊 Status:  GET  http://localhost:${PORT}/status`);
    console.log(`📋 Logs:    GET  http://localhost:${PORT}/logs`);
    console.log(`⚙️  Mode:    ${config.aiMode}`);
    console.log(`🤖 ============================================\n`);

    if (process.send) {
        process.send({ type: 'ready', port: PORT });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 AI Webhook Server shutting down...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('\n🛑 AI Webhook Server interrupted');
    server.close(() => process.exit(0));
});
