/**
 * TikTok Shop Product Scraper
 * Handles product page scraping from TikTok Shop
 */

const logger = require('../../utils/logger').module('TikTokShopScraper');

class TikTokShopScraper {
    constructor(page, adapter) {
        this.page = page;
        this.adapter = adapter;
    }

    /**
     * Scrape product data from TikTok Shop product page
     */
    async scrapeProduct(url) {
        logger.info(`Scraping TikTok Shop product: ${url}`);

        try {
            await this.page.goto(url, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            // Wait for product content to load
            await this.page.waitForSelector('[data-testid="product-detail"]', {
                timeout: 15000,
            }).catch(() => {
                logger.warn('Product detail selector not found, trying alternate methods');
            });

            // Random delay to appear human-like
            await this.adapter.randomDelay(2000, 4000);

            // Extract product data from page
            const productData = await this.page.evaluate(() => {
                const data = {};

                // Try to find product data in various locations

                // Method 1: Look for structured data (JSON-LD)
                const jsonLd = document.querySelector('script[type="application/ld+json"]');
                if (jsonLd) {
                    try {
                        const structured = JSON.parse(jsonLd.textContent);
                        if (structured['@type'] === 'Product') {
                            data.name = structured.name;
                            data.description = structured.description;
                            data.price = parseFloat(structured.offers?.price) || 0;
                            data.currency = structured.offers?.priceCurrency || 'USD';
                            data.images = structured.image ? [structured.image] : [];
                            data.rating = parseFloat(structured.aggregateRating?.ratingValue) || 0;
                            data.reviewCount = parseInt(structured.aggregateRating?.reviewCount) || 0;
                        }
                    } catch (e) {
                        console.log('JSON-LD parse error:', e);
                    }
                }

                // Method 2: Extract from DOM
                // Product name
                if (!data.name) {
                    const nameEl = document.querySelector('h1[data-testid="product-title"], h1.product-title, .product-name h1');
                    data.name = nameEl ? nameEl.textContent.trim() : '';
                }

                // Price
                if (!data.price) {
                    const priceEl = document.querySelector('[data-testid="product-price"], .product-price, .price-current');
                    if (priceEl) {
                        const priceText = priceEl.textContent.replace(/[^\d.]/g, '');
                        data.price = parseFloat(priceText) || 0;
                    }
                }

                // Original price (if discounted)
                const originalPriceEl = document.querySelector('[data-testid="original-price"], .price-original, .old-price');
                if (originalPriceEl) {
                    const originalText = originalPriceEl.textContent.replace(/[^\d.]/g, '');
                    data.originalPrice = parseFloat(originalText) || data.price;
                }

                // Description
                if (!data.description) {
                    const descEl = document.querySelector('[data-testid="product-description"], .product-description, .description-content');
                    data.description = descEl ? descEl.textContent.trim() : '';
                }

                // Images
                if (!data.images || data.images.length === 0) {
                    const imageEls = document.querySelectorAll('[data-testid="product-image"], .product-image img, .product-gallery img');
                    data.images = Array.from(imageEls).map(img => img.src || img.getAttribute('data-src')).filter(Boolean);
                }

                // Rating
                if (!data.rating) {
                    const ratingEl = document.querySelector('[data-testid="product-rating"], .product-rating, .rating-value');
                    data.rating = ratingEl ? parseFloat(ratingEl.textContent) || 0 : 0;
                }

                // Review count
                if (!data.reviewCount) {
                    const reviewCountEl = document.querySelector('[data-testid="review-count"], .review-count, .rating-count');
                    data.reviewCount = reviewCountEl ? parseInt(reviewCountEl.textContent.replace(/\D/g, '')) || 0 : 0;
                }

                // Sold count
                const soldEl = document.querySelector('[data-testid="sold-count"], .sold-count, .sales-count');
                data.soldCount = soldEl ? parseInt(soldEl.textContent.replace(/\D/g, '')) || 0 : 0;

                // Stock status
                const stockEl = document.querySelector('[data-testid="stock"], .stock-info, .inventory');
                if (stockEl) {
                    const stockText = stockEl.textContent.toLowerCase();
                    data.isInStock = !stockText.includes('out of stock') && !stockText.includes('sold out');
                    data.stock = parseInt(stockText.replace(/\D/g, '')) || null;
                } else {
                    data.isInStock = true; // Assume in stock if not specified
                }

                // Variants (sizes, colors, etc.)
                const variantEls = document.querySelectorAll('[data-testid="variant"], .product-variant, .sku-option');
                data.variants = Array.from(variantEls).map(el => ({
                    name: el.getAttribute('data-name') || el.textContent.trim(),
                    available: !el.classList.contains('disabled') && !el.classList.contains('sold-out'),
                }));

                // Shop info
                const shopNameEl = document.querySelector('[data-testid="shop-name"], .shop-name, .seller-name');
                data.shopName = shopNameEl ? shopNameEl.textContent.trim() : null;

                const shopIdEl = document.querySelector('[data-testid="shop-id"], .shop-id');
                data.shopId = shopIdEl ? shopIdEl.getAttribute('data-id') || shopIdEl.textContent.trim() : null;

                // Extract product ID from URL or data attributes
                const productIdEl = document.querySelector('[data-product-id]');
                data.productId = productIdEl ? productIdEl.getAttribute('data-product-id') : null;
                
                if (!data.productId) {
                    // Try to extract from URL
                    const urlMatch = window.location.href.match(/product\/(\d+)/);
                    data.productId = urlMatch ? urlMatch[1] : null;
                }

                return data;
            });

            // Calculate discount if applicable
            if (productData.originalPrice && productData.originalPrice > productData.price) {
                productData.discountPercent = Math.round(
                    ((productData.originalPrice - productData.price) / productData.originalPrice) * 100
                );
            }

            // Set URL
            productData.url = url;
            productData.platform = 'tiktok';

            logger.info(`Product scraped successfully: ${productData.name}`);
            logger.debug('Product data:', productData);

            return productData;

        } catch (error) {
            logger.error('Error scraping TikTok Shop product:', error);
            throw new Error(`Failed to scrape product: ${error.message}`);
        }
    }

    /**
     * Scrape multiple products from a listing page
     */
    async scrapeProductListing(url, options = {}) {
        logger.info(`Scraping TikTok product listing: ${url}`);

        try {
            await this.page.goto(url, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            const limit = options.limit || 20;
            const products = [];

            // Wait for product grid to load
            await this.page.waitForSelector('[data-testid="product-card"], .product-item, .product-card', {
                timeout: 15000,
            }).catch(() => {
                logger.warn('Product listing selector not found');
            });

            await this.adapter.randomDelay(1000, 2000);

            // Extract product links
            const productLinks = await this.page.evaluate((maxProducts) => {
                const cards = document.querySelectorAll('[data-testid="product-card"] a, .product-item a, .product-card a');
                const links = Array.from(cards)
                    .map(a => a.href)
                    .filter(href => href && href.includes('product'))
                    .slice(0, maxProducts);
                return [...new Set(links)]; // Remove duplicates
            }, limit);

            logger.info(`Found ${productLinks.length} products in listing`);

            // Scrape each product (with rate limiting)
            for (const link of productLinks) {
                try {
                    const product = await this.scrapeProduct(link);
                    products.push(product);
                    
                    // Rate limiting delay between products
                    if (products.length < productLinks.length) {
                        await this.adapter.randomDelay(3000, 6000);
                    }
                } catch (error) {
                    logger.error(`Failed to scrape product ${link}:`, error);
                    // Continue with next product
                }
            }

            logger.info(`Successfully scraped ${products.length} products`);
            return products;

        } catch (error) {
            logger.error('Error scraping product listing:', error);
            throw new Error(`Failed to scrape listing: ${error.message}`);
        }
    }
}

module.exports = TikTokShopScraper;
