/**
 * Webhook API Routes
 */

const express = require('express');
const router = express.Router();
const WebhookService = require('../../services/WebhookService');
const logger = require('../../utils/logger').module('WebhookRoutes');

/**
 * POST /api/webhook/test
 * Test webhook delivery
 */
router.post('/test', async (req, res) => {
    try {
        const { webhook, testMessage } = req.body;
        
        if (!webhook) {
            return res.json({ success: false, error: 'ไม่มี webhook config' });
        }

        const testData = testMessage || {
            username: 'Test User',
            comment: 'นี่คือข้อความทดสอบจาก EcomScraper Hub! 🎉',
            timestamp: Date.now()
        };

        const result = await WebhookService.send(webhook, testData);
        
        if (result.success) {
            res.json({ success: true, message: 'ส่ง webhook สำเร็จ!' });
        } else {
            res.json({ success: false, error: result.error });
        }
    } catch (error) {
        logger.error('Webhook test error:', error);
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;
