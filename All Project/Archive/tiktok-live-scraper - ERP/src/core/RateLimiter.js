/**
 * RateLimiter - Per-platform rate limiting
 */

const logger = require('../utils/logger');

class RateLimiter {
    constructor() {
        this.requestCounts = new Map(); // platform -> { count, resetTime }
        this.cooldowns = new Map(); // platform -> cooldown endTime
    }

    /**
     * Check if request is allowed for platform
     * @param {string} platform - Platform identifier
     * @param {Object} config - Rate limit config { requestsPerMinute, pageLoadDelay }
     * @returns {Promise<boolean>}
     */
    async checkLimit(platform, config) {
        const { requestsPerMinute } = config;
        const now = Date.now();
        
        // Check cooldown
        if (this.isInCooldown(platform)) {
            const remaining = this.cooldowns.get(platform) - now;
            logger.warn(`Platform ${platform} in cooldown for ${Math.ceil(remaining / 1000)}s`);
            return false;
        }

        // Get or initialize request count
        let record = this.requestCounts.get(platform);
        if (!record || now >= record.resetTime) {
            // Reset window
            record = {
                count: 0,
                resetTime: now + 60000, // 1 minute window
            };
            this.requestCounts.set(platform, record);
        }

        // Check if limit exceeded
        if (record.count >= requestsPerMinute) {
            const waitTime = record.resetTime - now;
            logger.warn(`Rate limit exceeded for ${platform}. Reset in ${Math.ceil(waitTime / 1000)}s`);
            return false;
        }

        return true;
    }

    /**
     * Record a request for platform
     * @param {string} platform
     */
    recordRequest(platform) {
        const record = this.requestCounts.get(platform);
        if (record) {
            record.count++;
            logger.debug(`Platform ${platform}: ${record.count} requests in current window`);
        }
    }

    /**
     * Wait with random delay based on platform config
     * @param {Object} config - Platform config with pageLoadDelay [min, max]
     */
    async randomDelay(config) {
        const [min, max] = config.pageLoadDelay || [1000, 3000];
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        logger.debug(`Random delay: ${delay}ms`);
        await this.sleep(delay);
    }

    /**
     * Set cooldown period for platform
     * @param {string} platform
     * @param {number} durationMs
     */
    setCooldown(platform, durationMs) {
        const endTime = Date.now() + durationMs;
        this.cooldowns.set(platform, endTime);
        logger.info(`Cooldown set for ${platform}: ${Math.ceil(durationMs / 1000)}s`);
    }

    /**
     * Check if platform is in cooldown
     */
    isInCooldown(platform) {
        const endTime = this.cooldowns.get(platform);
        if (!endTime) return false;
        
        if (Date.now() >= endTime) {
            this.cooldowns.delete(platform);
            return false;
        }
        
        return true;
    }

    /**
     * Reset rate limit for platform
     */
    reset(platform) {
        this.requestCounts.delete(platform);
        this.cooldowns.delete(platform);
        logger.info(`Rate limiter reset for platform: ${platform}`);
    }

    /**
     * Get current status for platform
     */
    getStatus(platform) {
        const record = this.requestCounts.get(platform);
        const cooldownEnd = this.cooldowns.get(platform);
        
        return {
            requestCount: record ? record.count : 0,
            resetTime: record ? record.resetTime : null,
            inCooldown: this.isInCooldown(platform),
            cooldownEnd: cooldownEnd || null,
        };
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = RateLimiter;
