/**
 * API Routes Aggregator
 */

const express = require('express');
const router = express.Router();

// Import route modules
const scraperRoutes = require('./scraper.routes');
const tiktokLiveRoutes = require('./tiktok-live.routes');
const webhookRoutes = require('./webhook.routes');
const authRoutes = require('./auth.routes');
const dataRoutes = require('./data.routes');
const aiWebhookRoutes = require('./ai-webhook.routes');
const mockRulesRoutes = require('./mock-rules.routes');
const platformRoutes = require('./platform.routes');

// Mount routes
router.use('/scraper', scraperRoutes);
router.use('/scrape', scraperRoutes); // Alias
router.use('/tiktok-live', tiktokLiveRoutes);
router.use('/webhook', webhookRoutes);
router.use('/auth', authRoutes);
router.use('/data', dataRoutes);
router.use('/ai-webhook', aiWebhookRoutes);
router.use('/mock-rules', mockRulesRoutes);
router.use('/platform', platformRoutes);

// Legacy compatibility (point old endpoints to new routes)
router.use('/start', (req, res, next) => { req.url = '/tiktok-live/start'; next(); }, tiktokLiveRoutes);
router.use('/stop', (req, res, next) => { req.url = '/tiktok-live/stop'; next(); }, tiktokLiveRoutes);
router.use('/status', (req, res, next) => { req.url = '/tiktok-live/status'; next(); }, tiktokLiveRoutes);
router.use('/comments', (req, res, next) => { req.url = '/data/comments'; next(); }, dataRoutes);
router.use('/download', (req, res, next) => { req.url = '/data/download'; next(); }, dataRoutes);
router.use('/comment-histories', dataRoutes);
router.use('/check-cookies', (req, res, next) => { req.url = '/auth/check-cookies'; next(); }, authRoutes);
router.use('/import-cookies', (req, res, next) => { req.url = '/auth/import-cookies'; next(); }, authRoutes);
router.use('/find-chrome-path', (req, res, next) => { req.url = '/auth/find-chrome-path'; next(); }, authRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'EcomScraper Hub API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
