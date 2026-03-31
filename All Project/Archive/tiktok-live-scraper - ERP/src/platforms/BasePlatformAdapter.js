/**
 * BasePlatformAdapter - Abstract base class for all platform adapters
 * All platform-specific adapters MUST extend this class
 */

const logger = require('../utils/logger');

class BasePlatformAdapter {
    constructor(config = {}) {
        if (new.target === BasePlatformAdapter) {
            throw new TypeError('Cannot construct BasePlatformAdapter instances directly');
        }

        this.config = config;
        this.context = null;
        this.page = null;
        this.logger = logger.module(this.platformName);
    }

    // ========== Identity Properties (MUST be implemented) ==========

    /**
     * Platform identifier (lowercase)
     * @returns {string} 'tiktok' | 'shopee' | 'lazada'
     */
    get platformName() {
        throw new Error('platformName must be implemented');
    }

    /**
     * Human-readable platform name
     * @returns {string}
     */
    get platformDisplayName() {
        throw new Error('platformDisplayName must be implemented');
    }

    /**
     * Platform icon (emoji or URL)
     * @returns {string}
     */
    get platformIcon() {
        return '🛒';
    }

    /**
     * Supported features list
     * @returns {string[]} e.g., ['product', 'shop', 'review', 'search', 'live']
     */
    get supportedFeatures() {
        return ['product', 'shop', 'search', 'review'];
    }

    // ========== Configuration ==========

    /**
     * Get platform-specific configuration
     */
    getPlatformConfig() {
        throw new Error('getPlatformConfig must be implemented');
    }

    /**
     * Get selectors registry
     */
    getSelectors() {
        return {};
    }

    /**
     * Get rate limit configuration
     */
    getRateLimits() {
        return this.getPlatformConfig().rateLimit || {};
    }

    // ========== Lifecycle Methods ==========

    /**
     * Initialize adapter with browser context
     * @param {BrowserContext} context - Playwright browser context
     */
    async initialize(context) {
        this.context = context;
        this.logger.info(`Adapter initialized for ${this.platformDisplayName}`);
    }

    /**
     * Authenticate with platform (if needed)
     * @param {Object} credentials
     */
    async authenticate(credentials) {
        this.logger.info('No authentication required for this platform');
    }

    /**
     * Cleanup and destroy adapter
     */
    async destroy() {
        if (this.page && !this.page.isClosed()) {
            await this.page.close();
        }
        this.page = null;
        this.context = null;
        this.logger.info('Adapter destroyed');
    }

    // ========== Scraping Methods (MUST be implemented) ==========

    /**
     * Scrape single product
     * @param {string} url - Product URL
     * @returns {Promise<Object>} Normalized product data
     */
    async scrapeProduct(url) {
        throw new Error('scrapeProduct must be implemented');
    }

    /**
     * Scrape shop/store data
     * @param {string} shopUrl - Shop URL
     * @param {Object} options - Scraping options
     * @returns {Promise<Object>} Normalized shop data
     */
    async scrapeShop(shopUrl, options = {}) {
        throw new Error('scrapeShop must be implemented');
    }

    /**
     * Scrape search results
     * @param {string} query - Search keyword
     * @param {Object} options - Search options (page, limit, filters)
     * @returns {Promise<Array>} Array of normalized product data
     */
    async scrapeSearch(query, options = {}) {
        throw new Error('scrapeSearch must be implemented');
    }

    /**
     * Scrape product reviews
     * @param {string} productUrl - Product URL
     * @param {Object} options - Review scraping options
     * @returns {Promise<Array>} Array of normalized review data
     */
    async scrapeReviews(productUrl, options = {}) {
        throw new Error('scrapeReviews must be implemented');
    }

    /**
     * Scrape category listings
     * @param {string} categoryUrl - Category URL
     * @param {Object} options
     * @returns {Promise<Array>}
     */
    async scrapeCategory(categoryUrl, options = {}) {
        this.logger.warn('scrapeCategory not implemented for this platform');
        return [];
    }

    /**
     * Scrape live stream (platform-specific, e.g., TikTok)
     * @param {string} liveUrl - Live stream URL
     * @param {Object} options
     * @returns {Promise<Array>}
     */
    async scrapeLive(liveUrl, options = {}) {
        throw new Error('scrapeLive not supported for this platform');
    }

    // ========== Data Normalization ==========

    /**
     * Normalize raw product data to unified schema
     * @param {Object} rawData - Platform-specific raw data
     * @returns {Object} Normalized product object
     */
    normalizeProduct(rawData) {
        return {
            platform: this.platformName,
            platformId: rawData.id || null,
            name: rawData.name || '',
            description: rawData.description || '',
            brand: rawData.brand || null,
            category: rawData.category || null,
            price: rawData.price || 0,
            originalPrice: rawData.originalPrice || rawData.price || 0,
            currency: rawData.currency || 'THB',
            rating: rawData.rating || 0,
            reviewCount: rawData.reviewCount || 0,
            soldCount: rawData.soldCount || 0,
            stock: rawData.stock || 0,
            isInStock: rawData.isInStock !== false,
            images: rawData.images || [],
            url: rawData.url || '',
            scrapedAt: new Date(),
        };
    }

    /**
     * Normalize review data
     */
    normalizeReview(rawData) {
        return {
            platform: this.platformName,
            author: rawData.author || 'Anonymous',
            rating: rawData.rating || 0,
            comment: rawData.comment || '',
            reviewedAt: rawData.reviewedAt || new Date(),
            scrapedAt: new Date(),
        };
    }

    /**
     * Normalize shop data
     */
    normalizeShop(rawData) {
        return {
            platform: this.platformName,
            platformShopId: rawData.id || null,
            name: rawData.name || '',
            url: rawData.url || '',
            rating: rawData.rating || 0,
            productCount: rawData.productCount || 0,
            followerCount: rawData.followerCount || 0,
            scrapedAt: new Date(),
        };
    }

    // ========== Helper Methods ==========

    /**
     * Create new page in context
     */
    async createPage() {
        if (!this.context) {
            throw new Error('Adapter not initialized. Call initialize() first.');
        }

        this.page = await this.context.newPage();
        
        // Set default headers
        await this.page.setExtraHTTPHeaders(this.getDefaultHeaders());

        return this.page;
    }

    /**
     * Navigate to URL with retry
     */
    async navigateWithRetry(url, options = {}) {
        const maxRetries = options.maxRetries || 3;
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.page.goto(url, {
                    waitUntil: options.waitUntil || 'networkidle',
                    timeout: options.timeout || 30000,
                });
                return;
            } catch (error) {
                lastError = error;
                this.logger.warn(`Navigation retry ${i + 1}/${maxRetries}`, { url, error: error.message });
                await this.sleep(2000 * (i + 1));
            }
        }

        throw lastError;
    }

    /**
     * Get default HTTP headers
     */
    getDefaultHeaders() {
        return {
            'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        };
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Random delay (human-like)
     */
    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.sleep(delay);
    }
}

module.exports = BasePlatformAdapter;
