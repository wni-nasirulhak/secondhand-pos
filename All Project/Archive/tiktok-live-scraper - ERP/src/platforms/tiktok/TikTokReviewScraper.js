/**
 * TikTok Review Scraper
 * Handles product review scraping from TikTok Shop
 */

const logger = require('../../utils/logger').module('TikTokReviewScraper');

class TikTokReviewScraper {
    constructor(page, adapter) {
        this.page = page;
        this.adapter = adapter;
    }

    /**
     * Scrape product reviews
     */
    async scrapeReviews(productUrl, options = {}) {
        logger.info(`Scraping reviews for: ${productUrl}`);

        const limit = options.limit || 20;
        const rating = options.rating || null; // Filter by rating (1-5)

        try {
            // Navigate to product page
            await this.page.goto(productUrl, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            await this.adapter.randomDelay(2000, 4000);

            // Try to click reviews tab/section
            try {
                const reviewTabSelector = [
                    '[data-testid="review-tab"]',
                    'button:has-text("Reviews")',
                    '[data-tab="reviews"]',
                    '.reviews-tab',
                    'a[href*="reviews"]',
                ].join(', ');

                await this.page.click(reviewTabSelector, { timeout: 5000 });
                await this.adapter.randomDelay(1000, 2000);
            } catch (error) {
                logger.debug('Review tab not found, assuming reviews are already visible');
            }

            // Wait for reviews to load
            await this.page.waitForSelector(
                '[data-testid="review-item"], .review-item, .review-card, [class*="review"]',
                { timeout: 10000 }
            ).catch(() => {
                logger.warn('Review items not found on page');
            });

            // Scroll to load more reviews (if lazy-loaded)
            if (limit > 10) {
                await this.scrollToLoadMore(Math.ceil(limit / 10));
            }

            // Extract reviews
            const reviews = await this.page.evaluate((maxReviews, filterRating) => {
                const items = [];

                // Try multiple selectors
                const selectors = [
                    '[data-testid="review-item"]',
                    '.review-item',
                    '.review-card',
                    '[class*="ReviewItem"]',
                    '[class*="review-container"]',
                ];

                let elements = [];
                for (const selector of selectors) {
                    elements = document.querySelectorAll(selector);
                    if (elements.length > 0) break;
                }

                Array.from(elements).slice(0, maxReviews).forEach(el => {
                    try {
                        // Extract rating
                        const ratingEl = el.querySelector('[data-testid="review-rating"], .review-rating, [class*="rating"]');
                        let rating = 0;
                        if (ratingEl) {
                            // Try to get rating from stars, data attribute, or text
                            const stars = ratingEl.querySelectorAll('.star-filled, .star-active, [class*="filled"]').length;
                            rating = stars || parseInt(ratingEl.getAttribute('data-rating')) || parseInt(ratingEl.textContent) || 0;
                        }

                        // Filter by rating if specified
                        if (filterRating && rating !== filterRating) return;

                        // Extract author
                        const authorEl = el.querySelector('[data-testid="review-author"], .review-author, .reviewer-name, [class*="author"]');
                        const author = authorEl ? authorEl.textContent.trim() : 'Anonymous';

                        // Extract comment
                        const commentEl = el.querySelector('[data-testid="review-comment"], .review-comment, .review-text, [class*="comment"]');
                        const comment = commentEl ? commentEl.textContent.trim() : '';

                        // Extract images
                        const imageEls = el.querySelectorAll('[data-testid="review-image"], .review-image, [class*="review"] img');
                        const images = Array.from(imageEls).map(img => img.src || img.getAttribute('data-src')).filter(Boolean);

                        // Extract date
                        const dateEl = el.querySelector('[data-testid="review-date"], .review-date, [class*="date"]');
                        const reviewedAt = dateEl ? dateEl.textContent.trim() : null;

                        // Extract variant info (if mentioned)
                        const variantEl = el.querySelector('[data-testid="review-variant"], .review-variant, [class*="variant"]');
                        const variantInfo = variantEl ? variantEl.textContent.trim() : null;

                        // Check if verified purchase
                        const verifiedEl = el.querySelector('[data-testid="verified"], .verified-purchase, [class*="verified"]');
                        const isVerifiedPurchase = Boolean(verifiedEl);

                        // Helpful count
                        const helpfulEl = el.querySelector('[data-testid="helpful-count"], .helpful-count, [class*="helpful"]');
                        const helpfulCount = helpfulEl ? parseInt(helpfulEl.textContent.replace(/\D/g, '')) || 0 : 0;

                        // Seller response
                        const responseEl = el.querySelector('[data-testid="seller-response"], .seller-response, [class*="response"]');
                        const sellerResponse = responseEl ? responseEl.textContent.trim() : null;

                        items.push({
                            rating,
                            author,
                            comment,
                            images,
                            reviewedAt,
                            variantInfo,
                            isVerifiedPurchase,
                            helpfulCount,
                            sellerResponse,
                        });
                    } catch (err) {
                        console.log('Error extracting review:', err);
                    }
                });

                return items;
            }, limit, rating);

            logger.info(`Scraped ${reviews.length} reviews`);

            // Add metadata
            return reviews.map(review => ({
                ...review,
                platform: 'tiktok',
                productUrl,
                scrapedAt: new Date(),
            }));

        } catch (error) {
            logger.error('Error scraping reviews:', error);
            throw new Error(`Failed to scrape reviews: ${error.message}`);
        }
    }

    /**
     * Scroll to load more reviews (for lazy-loaded content)
     */
    async scrollToLoadMore(times = 3) {
        logger.debug(`Scrolling to load more reviews (${times} times)`);

        for (let i = 0; i < times; i++) {
            await this.page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await this.adapter.randomDelay(1000, 2000);
        }

        // Scroll back to top
        await this.page.evaluate(() => {
            window.scrollTo(0, 0);
        });
    }

    /**
     * Get review statistics
     */
    async getReviewStats(productUrl) {
        logger.info(`Getting review stats for: ${productUrl}`);

        try {
            await this.page.goto(productUrl, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            await this.adapter.randomDelay(1000, 2000);

            const stats = await this.page.evaluate(() => {
                const data = {
                    averageRating: 0,
                    totalReviews: 0,
                    distribution: {
                        5: 0,
                        4: 0,
                        3: 0,
                        2: 0,
                        1: 0,
                    },
                };

                // Try to find rating summary
                const avgRatingEl = document.querySelector('[data-testid="average-rating"], .average-rating, .rating-average');
                if (avgRatingEl) {
                    data.averageRating = parseFloat(avgRatingEl.textContent) || 0;
                }

                const totalReviewsEl = document.querySelector('[data-testid="total-reviews"], .review-count, .total-reviews');
                if (totalReviewsEl) {
                    data.totalReviews = parseInt(totalReviewsEl.textContent.replace(/\D/g, '')) || 0;
                }

                // Try to find rating distribution
                [5, 4, 3, 2, 1].forEach(star => {
                    const distEl = document.querySelector(`[data-star="${star}"], .star-${star}-count, [class*="rating-${star}"]`);
                    if (distEl) {
                        data.distribution[star] = parseInt(distEl.textContent.replace(/\D/g, '')) || 0;
                    }
                });

                return data;
            });

            logger.info('Review stats:', stats);
            return stats;

        } catch (error) {
            logger.error('Error getting review stats:', error);
            return {
                averageRating: 0,
                totalReviews: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            };
        }
    }
}

module.exports = TikTokReviewScraper;
