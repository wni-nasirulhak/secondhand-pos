/**
 * TikTok Search Scraper
 * Handles search results scraping from TikTok
 */

const logger = require('../../utils/logger').module('TikTokSearchScraper');

class TikTokSearchScraper {
    constructor(page, adapter) {
        this.page = page;
        this.adapter = adapter;
    }

    /**
     * Search TikTok Shop by keyword
     */
    async search(query, options = {}) {
        logger.info(`Searching TikTok for: "${query}"`);

        const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
        const limit = options.limit || 20;
        const type = options.type || 'products'; // products, shops, videos, users

        try {
            await this.page.goto(searchUrl, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            // Wait for search results
            await this.page.waitForSelector('[data-e2e="search-result"], .search-result-item, [data-testid="search-result"]', {
                timeout: 15000,
            }).catch(() => {
                logger.warn('Search results selector not found');
            });

            await this.adapter.randomDelay(2000, 4000);

            // Switch to products tab if needed
            if (type === 'products') {
                try {
                    await this.page.click('[data-e2e="search-tab-products"], button:has-text("Products"), [data-tab="products"]', {
                        timeout: 5000,
                    });
                    await this.adapter.randomDelay(1000, 2000);
                } catch (error) {
                    logger.debug('Products tab not found or already selected');
                }
            }

            // Extract search results
            const results = await this.page.evaluate((maxResults, searchType) => {
                const items = [];

                // Try different selectors based on type
                let selectors;
                if (searchType === 'products') {
                    selectors = [
                        '[data-e2e="search-product-item"]',
                        '.product-search-item',
                        '[data-testid="product-item"]',
                        '.search-product-card',
                    ];
                } else {
                    selectors = [
                        '[data-e2e="search-result-item"]',
                        '.search-result-card',
                        '[data-testid="search-item"]',
                    ];
                }

                let elements = [];
                for (const selector of selectors) {
                    elements = document.querySelectorAll(selector);
                    if (elements.length > 0) break;
                }

                if (elements.length === 0) {
                    // Fallback: try to find any card-like elements
                    elements = document.querySelectorAll('.search-card, .result-card, [class*="search"][class*="item"]');
                }

                Array.from(elements).slice(0, maxResults).forEach(el => {
                    try {
                        // Extract link
                        const linkEl = el.querySelector('a[href*="product"], a[href*="tiktok.com/@"]');
                        const url = linkEl ? linkEl.href : null;

                        if (!url) return; // Skip if no link

                        // Extract title/name
                        const nameEl = el.querySelector('[data-e2e="product-name"], .product-name, h3, h4, [class*="title"]');
                        const name = nameEl ? nameEl.textContent.trim() : '';

                        // Extract price
                        const priceEl = el.querySelector('[data-e2e="product-price"], .product-price, [class*="price"]');
                        let price = 0;
                        if (priceEl) {
                            const priceText = priceEl.textContent.replace(/[^\d.]/g, '');
                            price = parseFloat(priceText) || 0;
                        }

                        // Extract image
                        const imgEl = el.querySelector('img');
                        const image = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : null;

                        // Extract rating
                        const ratingEl = el.querySelector('[data-e2e="rating"], .rating, [class*="rating"]');
                        const rating = ratingEl ? parseFloat(ratingEl.textContent) || 0 : 0;

                        // Extract sold count
                        const soldEl = el.querySelector('[data-e2e="sold"], .sold-count, [class*="sold"]');
                        const soldCount = soldEl ? parseInt(soldEl.textContent.replace(/\D/g, '')) || 0 : 0;

                        // Extract shop name
                        const shopEl = el.querySelector('[data-e2e="shop-name"], .shop-name, [class*="seller"]');
                        const shopName = shopEl ? shopEl.textContent.trim() : null;

                        items.push({
                            name,
                            url,
                            price,
                            image,
                            rating,
                            soldCount,
                            shopName,
                        });
                    } catch (err) {
                        console.log('Error extracting search result:', err);
                    }
                });

                return items;
            }, limit, type);

            logger.info(`Found ${results.length} search results for "${query}"`);
            
            // Add metadata
            return results.map(item => ({
                ...item,
                platform: 'tiktok',
                searchQuery: query,
                scrapedAt: new Date(),
            }));

        } catch (error) {
            logger.error('Error searching TikTok:', error);
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    /**
     * Search and scrape full product details
     */
    async searchAndScrapeProducts(query, options = {}) {
        logger.info(`Searching and scraping products for: "${query}"`);

        try {
            // First, get search results
            const searchResults = await this.search(query, options);

            // Then scrape each product (if TikTokShopScraper is available)
            if (!options.detailsOnly) {
                return searchResults;
            }

            // If details requested, would need TikTokShopScraper instance
            logger.warn('Full product scraping from search requires TikTokShopScraper');
            return searchResults;

        } catch (error) {
            logger.error('Error in searchAndScrapeProducts:', error);
            throw error;
        }
    }
}

module.exports = TikTokSearchScraper;
