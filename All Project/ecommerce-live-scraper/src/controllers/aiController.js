const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs').promises;

let aiWebhookProcess = null;
let isAIWebhookRunning = false;
const AI_WEBHOOK_PORT = 3099;
const MOCK_RULES_FILE = path.join(process.cwd(), 'data', 'mock_rules.json');

async function startAIWebhook(req, res) {
    if (isAIWebhookRunning) return res.json({ success: true, message: 'AI Webhook server already running', port: AI_WEBHOOK_PORT });
    try {
        const serverPath = path.join(process.cwd(), 'scripts', 'ai-webhook-server.js');
        aiWebhookProcess = spawn('node', [serverPath, AI_WEBHOOK_PORT], { stdio: ['ignore', 'pipe', 'pipe'] });
        isAIWebhookRunning = true;
        aiWebhookProcess.on('close', () => { isAIWebhookRunning = false; aiWebhookProcess = null; });
        res.json({ success: true, message: 'AI Webhook server started!', port: AI_WEBHOOK_PORT });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

async function stopAIWebhook(req, res) {
    if (!isAIWebhookRunning || !aiWebhookProcess) return res.json({ success: true, message: 'AI Webhook server is not running' });
    try {
        if (process.platform === 'win32') {
            require('child_process').exec(`taskkill /pid ${aiWebhookProcess.pid} /T /F`);
        } else {
            aiWebhookProcess.kill('SIGTERM');
        }
        isAIWebhookRunning = false;
        res.json({ success: true, message: 'AI Webhook server stopped' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

async function getMockRules(req, res) {
    try {
        const content = await fs.readFile(MOCK_RULES_FILE, 'utf8');
        res.json(JSON.parse(content));
    } catch (e) {
        res.json([]);
    }
}

async function saveMockRules(req, res) {
    try {
        await fs.writeFile(MOCK_RULES_FILE, JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true, message: 'บันทึกกฎ Mock AI สำเร็จ!' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

module.exports = {
    startAIWebhook,
    stopAIWebhook,
    getMockRules,
    saveMockRules
};
