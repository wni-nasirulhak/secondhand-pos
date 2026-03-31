/**
 * TikTok Live Scraper Routes (Legacy Compatibility)
 */

const express = require('express');
const router = express.Router();
const TikTokLiveScraperService = require('../../services/TikTokLiveScraperService');
const dataRoutes = require('./data.routes');
const logger = require('../../utils/logger').module('TikTokLiveRoutes');

/**
 * POST /api/tiktok-live/start
 * Start TikTok Live scraper
 */
router.post('/start', async (req, res) => {
    try {
        const config = req.body;

        if (!config.url || !config.duration || !config.interval) {
            return res.json({ success: false, error: 'Missing required parameters' });
        }

        // Clear previous comments
        dataRoutes.clearComments();

        // Start scraper
        const result = TikTokLiveScraperService.start(config);

        res.json({
            success: true,
            message: 'TikTok Live scraper started',
            config: config
        });

    } catch (error) {
        logger.error('Error starting TikTok Live scraper:', error);
        res.json({ success: false, error: error.message });
    }
});

/**
 * POST /api/tiktok-live/stop
 * Stop TikTok Live scraper
 */
router.post('/stop', (req, res) => {
    try {
        const result = TikTokLiveScraperService.stop();
        
        res.json({
            success: true,
            message: 'TikTok Live scraper stopped',
            commentsCount: dataRoutes.legacyComments.length
        });

    } catch (error) {
        logger.error('Error stopping TikTok Live scraper:', error);
        res.json({ success: false, error: error.message });
    }
});

/**
 * GET /api/tiktok-live/status
 * Get scraper status
 */
router.get('/status', (req, res) => {
    const status = TikTokLiveScraperService.getStatus();
    
    res.json({
        ...status,
        commentsCount: dataRoutes.legacyComments.length
    });
});

module.exports = router;
