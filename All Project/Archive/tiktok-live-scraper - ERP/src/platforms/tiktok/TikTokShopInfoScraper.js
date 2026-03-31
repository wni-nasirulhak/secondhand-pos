/**
 * TikTok Shop Info Scraper
 * Handles shop/seller page scraping from TikTok
 */

const logger = require('../../utils/logger').module('TikTokShopInfoScraper');

class TikTokShopInfoScraper {
    constructor(page, adapter) {
        this.page = page;
        this.adapter = adapter;
    }

    /**
     * Scrape shop information
     */
    async scrapeShop(shopUrl, options = {}) {
        logger.info(`Scraping TikTok shop: ${shopUrl}`);

        try {
            await this.page.goto(shopUrl, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            await this.adapter.randomDelay(2000, 4000);

            // Extract shop data
            const shopData = await this.page.evaluate(() => {
                const data = {};

                // Shop name
                const nameEl = document.querySelector('[data-e2e="shop-name"], .shop-name, h1[class*="shop"]');
                data.name = nameEl ? nameEl.textContent.trim() : '';

                // Shop ID/username (from URL or data attribute)
                const shopIdEl = document.querySelector('[data-shop-id]');
                data.shopId = shopIdEl ? shopIdEl.getAttribute('data-shop-id') : null;
                
                if (!data.shopId) {
                    // Try to extract from URL (@username)
                    const urlMatch = window.location.href.match(/@([^\/\?]+)/);
                    data.shopId = urlMatch ? urlMatch[1] : null;
                }

                // Shop avatar/logo
                const avatarEl = document.querySelector('[data-e2e="shop-avatar"] img, .shop-avatar img, .shop-logo');
                data.logo = avatarEl ? (avatarEl.src || avatarEl.getAttribute('data-src')) : null;

                // Rating
                const ratingEl = document.querySelector('[data-e2e="shop-rating"], .shop-rating, [class*="rating"]');
                data.rating = ratingEl ? parseFloat(ratingEl.textContent) || 0 : 0;

                // Follower count
                const followerEl = document.querySelector('[data-e2e="follower-count"], .follower-count, [class*="follower"]');
                if (followerEl) {
                    const followerText = followerEl.textContent;
                    // Handle K, M suffixes (e.g., "10.5K" -> 10500)
                    let count = parseFloat(followerText.replace(/[^\d.KMkm]/g, '')) || 0;
                    if (followerText.toLowerCase().includes('k')) count *= 1000;
                    if (followerText.toLowerCase().includes('m')) count *= 1000000;
                    data.followerCount = Math.round(count);
                } else {
                    data.followerCount = 0;
                }

                // Product count
                const productCountEl = document.querySelector('[data-e2e="product-count"], .product-count, [class*="products"]');
                if (productCountEl) {
                    data.productCount = parseInt(productCountEl.textContent.replace(/\D/g, '')) || 0;
                } else {
                    // Try counting visible products
                    const products = document.querySelectorAll('[data-e2e="product-item"], .product-item');
                    data.productCount = products.length;
                }

                // Response rate & time
                const responseRateEl = document.querySelector('[data-e2e="response-rate"], .response-rate');
                data.responseRate = responseRateEl ? parseFloat(responseRateEl.textContent) || 0 : null;

                const responseTimeEl = document.querySelector('[data-e2e="response-time"], .response-time');
                data.responseTime = responseTimeEl ? responseTimeEl.textContent.trim() : null;

                // Joined date
                const joinedEl = document.querySelector('[data-e2e="joined-date"], .joined-date, [class*="joined"]');
                data.joinedDate = joinedEl ? joinedEl.textContent.trim() : null;

                // Location
                const locationEl = document.querySelector('[data-e2e="shop-location"], .shop-location, [class*="location"]');
                data.location = locationEl ? locationEl.textContent.trim() : null;

                // Official/verified status
                const officialEl = document.querySelector('[data-e2e="official-badge"], .official-badge, [class*="verified"]');
                data.isOfficial = Boolean(officialEl);

                // Description
                const descEl = document.querySelector('[data-e2e="shop-description"], .shop-description, .shop-bio');
                data.description = descEl ? descEl.textContent.trim() : null;

                return data;
            });

            // Add URL
            shopData.url = shopUrl;
            shopData.platform = 'tiktok';

            logger.info(`Shop scraped successfully: ${shopData.name}`);
            logger.debug('Shop data:', shopData);

            return shopData;

        } catch (error) {
            logger.error('Error scraping TikTok shop:', error);
            throw new Error(`Failed to scrape shop: ${error.message}`);
        }
    }

    /**
     * Scrape shop products
     */
    async scrapeShopProducts(shopUrl, options = {}) {
        logger.info(`Scraping products from shop: ${shopUrl}`);

        const limit = options.limit || 20;

        try {
            await this.page.goto(shopUrl, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            await this.adapter.randomDelay(2000, 4000);

            // Scroll to load more products if needed
            if (limit > 20) {
                await this.scrollToLoadMore(Math.ceil(limit / 20));
            }

            // Extract product links
            const products = await this.page.evaluate((maxProducts) => {
                const items = [];

                const productEls = document.querySelectorAll('[data-e2e="shop-product-item"], .shop-product-item, .product-card');
                
                Array.from(productEls).slice(0, maxProducts).forEach(el => {
                    try {
                        // Link
                        const linkEl = el.querySelector('a[href*="product"]');
                        const url = linkEl ? linkEl.href : null;

                        if (!url) return;

                        // Name
                        const nameEl = el.querySelector('[data-e2e="product-name"], .product-name, h3, h4');
                        const name = nameEl ? nameEl.textContent.trim() : '';

                        // Price
                        const priceEl = el.querySelector('[data-e2e="product-price"], .product-price, [class*="price"]');
                        let price = 0;
                        if (priceEl) {
                            price = parseFloat(priceEl.textContent.replace(/[^\d.]/g, '')) || 0;
                        }

                        // Image
                        const imgEl = el.querySelector('img');
                        const image = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : null;

                        // Rating
                        const ratingEl = el.querySelector('[data-e2e="rating"], .rating');
                        const rating = ratingEl ? parseFloat(ratingEl.textContent) || 0 : 0;

                        // Sold count
                        const soldEl = el.querySelector('[data-e2e="sold"], .sold-count');
                        const soldCount = soldEl ? parseInt(soldEl.textContent.replace(/\D/g, '')) || 0 : 0;

                        items.push({
                            name,
                            url,
                            price,
                            image,
                            rating,
                            soldCount,
                        });
                    } catch (err) {
                        console.log('Error extracting product:', err);
                    }
                });

                return items;
            }, limit);

            logger.info(`Found ${products.length} products in shop`);

            return products.map(p => ({
                ...p,
                platform: 'tiktok',
                shopUrl,
            }));

        } catch (error) {
            logger.error('Error scraping shop products:', error);
            throw new Error(`Failed to scrape shop products: ${error.message}`);
        }
    }

    /**
     * Scroll to load more content
     */
    async scrollToLoadMore(times = 2) {
        logger.debug(`Scrolling to load more content (${times} times)`);

        for (let i = 0; i < times; i++) {
            await this.page.evaluate(() => {
                window.scrollBy(0, window.innerHeight * 0.8);
            });
            await this.adapter.randomDelay(1000, 2000);
        }

        // Scroll back
        await this.page.evaluate(() => {
            window.scrollTo(0, 0);
        });
    }
}

module.exports = TikTokShopInfoScraper;
