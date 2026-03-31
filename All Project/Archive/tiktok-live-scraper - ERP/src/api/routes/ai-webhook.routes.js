/**
 * AI Webhook Server Routes
 */

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const logger = require('../../utils/logger').module('AIWebhookRoutes');

let aiWebhookProcess = null;
let isAIWebhookRunning = false;
const AI_WEBHOOK_PORT = 3099;

/**
 * Proxy request to AI webhook server
 */
function proxyToAIWebhook(method, apiPath, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: AI_WEBHOOK_PORT,
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
                try {
                    resolve(JSON.parse(rawData));
                } catch (e) {
                    resolve({ raw: rawData });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(3000, () => {
            req.destroy();
            reject(new Error('AI Webhook proxy timeout'));
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

/**
 * POST /api/ai-webhook/start
 * Start AI Webhook Server
 */
router.post('/start', async (req, res) => {
    if (isAIWebhookRunning) {
        return res.json({
            success: true,
            message: 'AI Webhook server already running',
            port: AI_WEBHOOK_PORT
        });
    }

    try {
        const serverPath = path.join(__dirname, '../../../scripts/ai-webhook-server.js');
        const { aiMode, apiKey, systemPrompt, replyDelay } = req.body || {};

        aiWebhookProcess = spawn('node', [serverPath, AI_WEBHOOK_PORT], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        isAIWebhookRunning = true;

        aiWebhookProcess.stdout.on('data', data => {
            logger.debug('[AIWebhook]', data.toString().trim());
        });

        aiWebhookProcess.stderr.on('data', data => {
            const msg = data.toString().trim();
            if (msg) logger.error('[AIWebhook]', msg);
        });

        aiWebhookProcess.on('close', code => {
            logger.info(`AI Webhook process closed (code: ${code})`);
            isAIWebhookRunning = false;
            aiWebhookProcess = null;
        });

        aiWebhookProcess.on('error', err => {
            logger.error('AI Webhook process error:', err);
            isAIWebhookRunning = false;
            aiWebhookProcess = null;
        });

        // Configure after startup
        if (aiMode || apiKey || systemPrompt || replyDelay !== undefined) {
            await new Promise(r => setTimeout(r, 1200));
            try {
                await proxyToAIWebhook('POST', '/config', { aiMode, apiKey, systemPrompt, replyDelay });
            } catch (e) {
                logger.error('AI Webhook config error:', e.message);
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
        logger.error('Error starting AI webhook server:', error);
        res.json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai-webhook/stop
 * Stop AI Webhook Server
 */
router.post('/stop', (req, res) => {
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

/**
 * GET /api/ai-webhook/status
 * Get AI Webhook Server status
 */
router.get('/status', async (req, res) => {
    if (!isAIWebhookRunning) {
        return res.json({ running: false });
    }

    try {
        const status = await proxyToAIWebhook('GET', '/status');
        res.json({ running: true, ...status, port: AI_WEBHOOK_PORT });
    } catch (e) {
        res.json({ running: isAIWebhookRunning, port: AI_WEBHOOK_PORT, error: e.message });
    }
});

/**
 * GET /api/ai-webhook/logs
 * Get AI Webhook Server logs
 */
router.get('/logs', async (req, res) => {
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

/**
 * DELETE /api/ai-webhook/logs
 * Clear AI Webhook logs
 */
router.delete('/logs', async (req, res) => {
    try {
        const data = await proxyToAIWebhook('DELETE', '/logs');
        res.json(data);
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

/**
 * POST /api/ai-webhook/config
 * Update AI Webhook config
 */
router.post('/config', async (req, res) => {
    try {
        const data = await proxyToAIWebhook('POST', '/config', req.body);
        res.json(data);
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

module.exports = router;
