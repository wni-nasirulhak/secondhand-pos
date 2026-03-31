/**
 * Scraper API Routes
 */

const express = require('express');
const router = express.Router();
const ScraperEngine = require('../../core/ScraperEngine');
const PlatformRegistry = require('../../platforms');
const { validate, schemas } = require('../../utils/validators');
const logger = require('../../utils/logger').module('ScraperRoutes');

/**
 * POST /api/scraper/start
 * Start a scraping job
 */
router.post('/start', async (req, res) => {
    try {
        const { platform, type, url, query, options } = req.body;

        // Validate input
        validate({ platform, type, url: url || query }, schemas.jobConfig);

        // Create job
        const jobId = ScraperEngine.createJob({
            platform,
            type,
            targetUrl: url,
            searchQuery: query,
            options: options || {},
        });

        // Get adapter
        const adapter = PlatformRegistry.createInstance(platform);

        // Start job (async)
        ScraperEngine.startJob(jobId, adapter).catch(error => {
            logger.error(`Job ${jobId} failed:`, error);
        });

        res.json({
            success: true,
            jobId,
            message: 'Scraping job started',
        });

    } catch (error) {
        logger.error('Start scraper error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/scraper/stop/:jobId
 * Stop a running job
 */
router.post('/stop/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await ScraperEngine.stopJob(jobId);

        res.json({
            success: true,
            message: 'Job stopped',
            job: ScraperEngine.getJobStatus(jobId),
        });

    } catch (error) {
        logger.error('Stop scraper error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/scraper/status
 * Get all jobs status
 */
router.get('/status', (req, res) => {
    try {
        const allJobs = ScraperEngine.getAllJobs();
        const runningJobs = ScraperEngine.getRunningJobs();

        res.json({
            success: true,
            total: allJobs.length,
            running: runningJobs.length,
            jobs: allJobs.map(job => ({
                id: job.id,
                platform: job.platform,
                type: job.type,
                status: job.status,
                itemsScraped: job.itemsScraped,
                createdAt: job.createdAt,
            })),
        });

    } catch (error) {
        logger.error('Get status error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/scraper/status/:jobId
 * Get specific job status
 */
router.get('/status/:jobId', (req, res) => {
    try {
        const { jobId } = req.params;
        const status = ScraperEngine.getJobStatus(jobId);

        res.json({
            success: true,
            job: status,
        });

    } catch (error) {
        logger.error('Get job status error:', error);
        res.status(404).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/scrape/product
 * Quick scrape a single product (auto-detect platform)
 */
router.post('/product', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            throw new Error('URL is required');
        }

        const { detectPlatform } = require('../../utils/validators');
        const platform = detectPlatform(url);

        if (!platform) {
            throw new Error('Could not detect platform from URL');
        }

        // Create and start job
        const jobId = ScraperEngine.createJob({
            platform,
            type: 'product',
            targetUrl: url,
        });

        const adapter = PlatformRegistry.createInstance(platform);
        const result = await ScraperEngine.startJob(jobId, adapter);

        res.json({
            success: true,
            platform,
            product: result.product,
        });

    } catch (error) {
        logger.error('Scrape product error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
