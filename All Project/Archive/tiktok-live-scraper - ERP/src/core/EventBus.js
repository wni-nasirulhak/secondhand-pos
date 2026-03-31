/**
 * EventBus - Central event management system
 * Based on Node.js EventEmitter for decoupled communication
 */

const EventEmitter = require('events');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50); // Allow more listeners for complex scenarios
    }

    /**
     * Emit scraper started event
     */
    emitScraperStarted(jobId, platform, config) {
        this.emit('scraper:started', { jobId, platform, config, timestamp: Date.now() });
    }

    /**
     * Emit scraper progress event
     */
    emitScraperProgress(jobId, itemCount, totalItems = null) {
        this.emit('scraper:progress', { jobId, itemCount, totalItems, timestamp: Date.now() });
    }

    /**
     * Emit scraper completed event
     */
    emitScraperCompleted(jobId, result) {
        this.emit('scraper:completed', { jobId, result, timestamp: Date.now() });
    }

    /**
     * Emit scraper error event
     */
    emitScraperError(jobId, error) {
        this.emit('scraper:error', { jobId, error: error.message, stack: error.stack, timestamp: Date.now() });
    }

    /**
     * Emit product scraped event
     */
    emitProductScraped(product) {
        this.emit('product:scraped', { product, timestamp: Date.now() });
    }

    /**
     * Emit review scraped event
     */
    emitReviewScraped(review) {
        this.emit('review:scraped', { review, timestamp: Date.now() });
    }

    /**
     * Emit price changed event
     */
    emitPriceChanged(productId, oldPrice, newPrice) {
        this.emit('price:changed', { productId, oldPrice, newPrice, timestamp: Date.now() });
    }

    /**
     * Emit alert triggered event
     */
    emitAlert(type, data) {
        this.emit('alert:triggered', { type, data, timestamp: Date.now() });
    }

    /**
     * Emit comment scraped event (legacy TikTok Live)
     */
    emitCommentScraped(comment) {
        this.emit('comment:scraped', { comment, timestamp: Date.now() });
    }
}

// Singleton instance
const eventBus = new EventBus();

module.exports = eventBus;
