/**
 * Mock Rules API Routes
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const logger = require('../../utils/logger').module('MockRulesRoutes');

const MOCK_RULES_FILE = path.join(__dirname, '../../../data/mock_rules.json');

/**
 * GET /api/mock-rules
 * Get mock rules
 */
router.get('/', async (req, res) => {
    try {
        if (fsSync.existsSync(MOCK_RULES_FILE)) {
            const content = await fs.readFile(MOCK_RULES_FILE, 'utf8');
            res.json(JSON.parse(content));
        } else {
            res.json([]);
        }
    } catch (error) {
        logger.error('Error reading mock rules:', error);
        res.status(500).json({ error: 'Failed to read mock rules' });
    }
});

/**
 * POST /api/mock-rules
 * Save mock rules
 */
router.post('/', async (req, res) => {
    try {
        const rules = req.body;
        if (!Array.isArray(rules)) {
            return res.status(400).json({ error: 'Invalid rules format (must be an array)' });
        }

        // Ensure directory exists
        const dir = path.dirname(MOCK_RULES_FILE);
        if (!fsSync.existsSync(dir)) {
            fsSync.mkdirSync(dir, { recursive: true });
        }

        await fs.writeFile(MOCK_RULES_FILE, JSON.stringify(rules, null, 2), 'utf8');
        res.json({ success: true, message: 'บันทึกกฎ Mock AI สำเร็จ!' });
    } catch (error) {
        logger.error('Error saving mock rules:', error);
        res.status(500).json({ error: 'Failed to save mock rules' });
    }
});

module.exports = router;
