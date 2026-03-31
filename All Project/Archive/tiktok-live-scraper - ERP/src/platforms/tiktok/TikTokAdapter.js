/**
 * TikTok Platform Adapter
 */

const BasePlatformAdapter = require('../BasePlatformAdapter');
const config = require('./config');
const selectors = require('./selectors');
const TikTokShopScraper = require('./TikTokShopScraper');
const TikTokSearchScraper = require('./TikTokSearchScraper');
const TikTokReviewScraper = require('./TikTokReviewScraper');
const TikTokShopInfoScraper = require('./TikTokShopInfoScraper');

class TikTokAdapter extends BasePlatformAdapter {
    constructor(options = {}) {
        super(options);
        this.shopScraper = null;
        this.searchScraper = null;
        this.reviewScraper = null;
        this.shopInfoScraper = null;
    }

    // ========== Identity ==========

    get platformName() {
        return 'tiktok';
    }

    get platformDisplayName() {
        return 'TikTok Shop';
    }

    get platformIcon() {
        return '🎵';
    }

    get supportedFeatures() {
        return ['live', 'product', 'shop', 'search'];
    }

    // ========== Configuration ==========

    getPlatformConfig() {
        return config;
    }

    getSelectors() {
        return selectors;
    }

    // ========== Lifecycle ==========

    async initialize(context) {
        await super.initialize(context);
        
        // Create page
        await this.createPage();
        
        // Initialize scrapers
        this.shopScraper = new TikTokShopScraper(this.page, this);
        this.searchScraper = new TikTokSearchScraper(this.page, this);
        this.reviewScraper = new TikTokReviewScraper(this.page, this);
        this.shopInfoScraper = new TikTokShopInfoScraper(this.page, this);
        
        this.logger.info('TikTok adapter initialized with all scrapers');
    }

    // ========== Scraping Methods ==========

    /**
     * Scrape TikTok product (using TikTokShopScraper)
     */
    async scrapeProduct(url) {
        this.logger.info(`Scraping TikTok product: ${url}`);

        // Use dedicated shop scraper
        const productData = await this.shopScraper.scrapeProduct(url);

        // Normalize and return
        return this.normalizeProduct(productData);
    }

    /**
     * Scrape TikTok shop (using TikTokShopInfoScraper)
     */
    async scrapeShop(shopUrl, options = {}) {
        this.logger.info(`Scraping TikTok shop: ${shopUrl}`);

        // Use dedicated shop info scraper
        const shopData = await this.shopInfoScraper.scrapeShop(shopUrl);

        // If options.includeProducts, also scrape products
        if (options.includeProducts) {
            const products = await this.shopInfoScraper.scrapeShopProducts(shopUrl, {
                limit: options.productLimit || 20,
            });
            shopData.products = products;
        }

        return this.normalizeShop(shopData);
    }

    /**
     * Scrape TikTok search results (using TikTokSearchScraper)
     */
    async scrapeSearch(query, options = {}) {
        this.logger.info(`Searching TikTok for: ${query}`);

        // Use dedicated search scraper
        const results = await this.searchScraper.search(query, {
            limit: options.limit || 20,
            type: options.type || 'products',
        });

        return results.map(item => this.normalizeProduct(item));
    }

    /**
     * Scrape TikTok product reviews (using TikTokReviewScraper)
     */
    async scrapeReviews(productUrl, options = {}) {
        this.logger.info(`Scraping reviews for: ${productUrl}`);

        // Use dedicated review scraper
        const reviews = await this.reviewScraper.scrapeReviews(productUrl, {
            limit: options.limit || 20,
            rating: options.rating || null,
        });

        return reviews.map(review => this.normalizeReview(review));
    }

    /**
     * Scrape TikTok Live (legacy support)
     * This will integrate with the existing TikTok Live scraper logic
     */
    async scrapeLive(liveUrl, options = {}) {
        this.logger.info(`Scraping TikTok Live: ${liveUrl}`);

        // For now, return placeholder
        // Full implementation will migrate from scraper_wrapper.js
        throw new Error('TikTok Live scraping will be implemented in next iteration');
    }

    // ========== Data Normalization ==========

    normalizeProduct(rawData) {
        return {
            ...super.normalizeProduct(rawData),
            platform: 'tiktok',
            currency: 'USD', // TikTok Shop often uses USD
        };
    }
}

module.exports = TikTokAdapter;
