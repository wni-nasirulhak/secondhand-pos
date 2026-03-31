/**
 * ScraperEngine - Main orchestrator for scraping jobs
 */

const EventBus = require('./EventBus');
const BrowserManager = require('./BrowserManager');
const RateLimiter = require('./RateLimiter');
const RetryStrategy = require('./RetryStrategy');
const logger = require('../utils/logger').module('ScraperEngine');
const { generateId } = require('../utils/helpers');

class ScraperEngine {
    constructor() {
        this.jobs = new Map(); // jobId -> job state
        this.runningJobs = new Set();
        this.rateLimiter = new RateLimiter();
        this.retryStrategy = new RetryStrategy();
    }

    /**
     * Create a new scraping job
     * @param {Object} config - Job configuration
     * @returns {string} jobId
     */
    createJob(config) {
        const jobId = generateId();
        
        const job = {
            id: jobId,
            platform: config.platform,
            type: config.type, // 'product' | 'shop' | 'search' | 'review' | 'live'
            targetUrl: config.targetUrl || null,
            searchQuery: config.searchQuery || null,
            options: config.options || {},
            status: 'pending', // 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
            itemsScraped: 0,
            itemsFailed: 0,
            error: null,
            createdAt: new Date(),
            startedAt: null,
            completedAt: null,
        };

        this.jobs.set(jobId, job);
        logger.info(`Job created: ${jobId}`, { platform: config.platform, type: config.type });

        return jobId;
    }

    /**
     * Start a scraping job
     * @param {string} jobId
     * @param {Object} adapter - Platform adapter instance
     */
    async startJob(jobId, adapter) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job not found: ${jobId}`);
        }

        if (this.runningJobs.has(jobId)) {
            throw new Error(`Job already running: ${jobId}`);
        }

        // Check rate limit
        const platformConfig = adapter.getPlatformConfig();
        const canProceed = await this.rateLimiter.checkLimit(job.platform, platformConfig.rateLimit);
        if (!canProceed) {
            throw new Error(`Rate limit exceeded for platform: ${job.platform}`);
        }

        // Update job status
        job.status = 'running';
        job.startedAt = new Date();
        this.runningJobs.add(jobId);

        // Emit started event
        EventBus.emitScraperStarted(jobId, job.platform, job);

        try {
            // Create browser context
            const context = await BrowserManager.createContext(jobId, {
                storageStatePath: platformConfig.storageStatePath,
                proxy: job.options.proxy,
            });

            // Initialize adapter
            await adapter.initialize(context);

            // Execute scraping based on type
            let result;
            switch (job.type) {
                case 'product':
                    result = await this.scrapeProduct(jobId, adapter, job.targetUrl);
                    break;
                case 'shop':
                    result = await this.scrapeShop(jobId, adapter, job.targetUrl, job.options);
                    break;
                case 'search':
                    result = await this.scrapeSearch(jobId, adapter, job.searchQuery, job.options);
                    break;
                case 'review':
                    result = await this.scrapeReviews(jobId, adapter, job.targetUrl, job.options);
                    break;
                case 'live':
                    result = await this.scrapeLive(jobId, adapter, job.targetUrl, job.options);
                    break;
                default:
                    throw new Error(`Unsupported job type: ${job.type}`);
            }

            // Job completed successfully
            job.status = 'completed';
            job.completedAt = new Date();
            job.result = result;

            EventBus.emitScraperCompleted(jobId, result);
            logger.info(`Job completed: ${jobId}`, { itemsScraped: job.itemsScraped });

            return result;

        } catch (error) {
            // Job failed
            job.status = 'failed';
            job.completedAt = new Date();
            job.error = error.message;

            EventBus.emitScraperError(jobId, error);
            logger.error(`Job failed: ${jobId}`, { error: error.message });

            throw error;

        } finally {
            // Cleanup
            this.runningJobs.delete(jobId);
            await BrowserManager.closeContext(jobId);
            await adapter.destroy();
        }
    }

    /**
     * Scrape a single product
     */
    async scrapeProduct(jobId, adapter, url) {
        logger.info(`Scraping product: ${url}`);
        
        const product = await this.retryStrategy.execute(
            async () => await adapter.scrapeProduct(url),
            { key: `product_${jobId}` }
        );

        this.jobs.get(jobId).itemsScraped++;
        EventBus.emitProductScraped(product);

        return { product };
    }

    /**
     * Scrape shop data
     */
    async scrapeShop(jobId, adapter, shopUrl, options) {
        logger.info(`Scraping shop: ${shopUrl}`);

        const shop = await this.retryStrategy.execute(
            async () => await adapter.scrapeShop(shopUrl, options),
            { key: `shop_${jobId}` }
        );

        this.jobs.get(jobId).itemsScraped++;

        return { shop };
    }

    /**
     * Scrape search results
     */
    async scrapeSearch(jobId, adapter, query, options) {
        logger.info(`Scraping search results for: ${query}`);

        const results = await this.retryStrategy.execute(
            async () => await adapter.scrapeSearch(query, options),
            { key: `search_${jobId}` }
        );

        this.jobs.get(jobId).itemsScraped += results.length;

        return { results, count: results.length };
    }

    /**
     * Scrape reviews
     */
    async scrapeReviews(jobId, adapter, productUrl, options) {
        logger.info(`Scraping reviews for: ${productUrl}`);

        const reviews = await this.retryStrategy.execute(
            async () => await adapter.scrapeReviews(productUrl, options),
            { key: `reviews_${jobId}` }
        );

        this.jobs.get(jobId).itemsScraped += reviews.length;

        reviews.forEach(review => EventBus.emitReviewScraped(review));

        return { reviews, count: reviews.length };
    }

    /**
     * Scrape live stream (TikTok specific)
     */
    async scrapeLive(jobId, adapter, liveUrl, options) {
        logger.info(`Scraping live stream: ${liveUrl}`);

        const comments = await this.retryStrategy.execute(
            async () => await adapter.scrapeLive(liveUrl, options),
            { key: `live_${jobId}` }
        );

        this.jobs.get(jobId).itemsScraped += comments.length;

        return { comments, count: comments.length };
    }

    /**
     * Stop a running job
     */
    async stopJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job not found: ${jobId}`);
        }

        if (!this.runningJobs.has(jobId)) {
            throw new Error(`Job not running: ${jobId}`);
        }

        job.status = 'cancelled';
        job.completedAt = new Date();
        this.runningJobs.delete(jobId);

        await BrowserManager.closeContext(jobId);

        logger.info(`Job stopped: ${jobId}`);

        return job;
    }

    /**
     * Get job status
     */
    getJobStatus(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job not found: ${jobId}`);
        }

        return {
            id: job.id,
            platform: job.platform,
            type: job.type,
            status: job.status,
            itemsScraped: job.itemsScraped,
            itemsFailed: job.itemsFailed,
            error: job.error,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
        };
    }

    /**
     * Get all jobs
     */
    getAllJobs() {
        return Array.from(this.jobs.values());
    }

    /**
     * Get running jobs
     */
    getRunningJobs() {
        return Array.from(this.runningJobs).map(jobId => this.jobs.get(jobId));
    }

    /**
     * Clear completed jobs
     */
    clearCompletedJobs() {
        for (const [jobId, job] of this.jobs.entries()) {
            if (job.status === 'completed' || job.status === 'failed') {
                this.jobs.delete(jobId);
            }
        }
        logger.info('Cleared completed jobs');
    }
}

// Singleton instance
const scraperEngine = new ScraperEngine();

module.exports = scraperEngine;
