/**
 * RetryStrategy - Exponential backoff and circuit breaker pattern
 */

const logger = require('../utils/logger');

class RetryStrategy {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.baseDelay = options.baseDelay || 1000;
        this.maxDelay = options.maxDelay || 30000;
        this.exponentialFactor = options.exponentialFactor || 2;
        
        // Circuit breaker
        this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;
        this.circuitBreakerResetTime = options.circuitBreakerResetTime || 60000; // 1 minute
        this.failures = new Map(); // key -> failure count
        this.openCircuits = new Map(); // key -> reset timestamp
    }

    /**
     * Execute function with retry logic
     * @param {Function} fn - Function to execute
     * @param {Object} options - Retry options
     * @returns {Promise<any>}
     */
    async execute(fn, options = {}) {
        const key = options.key || 'default';
        const maxRetries = options.maxRetries || this.maxRetries;
        const retryableErrors = options.retryableErrors || [];
        
        // Check circuit breaker
        if (this.isCircuitOpen(key)) {
            throw new Error(`Circuit breaker open for key: ${key}`);
        }

        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await fn();
                
                // Success - reset failure count
                this.recordSuccess(key);
                return result;
                
            } catch (error) {
                lastError = error;
                
                // Check if error is retryable
                const isRetryable = retryableErrors.length === 0 || 
                    retryableErrors.some(errType => error.message.includes(errType));
                
                if (!isRetryable || attempt === maxRetries) {
                    this.recordFailure(key);
                    throw error;
                }
                
                // Calculate delay with exponential backoff
                const delay = this.calculateDelay(attempt);
                logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms for key: ${key}`, {
                    error: error.message,
                });
                
                await this.sleep(delay);
            }
        }
        
        this.recordFailure(key);
        throw lastError;
    }

    /**
     * Calculate exponential backoff delay
     */
    calculateDelay(attempt) {
        const delay = Math.min(
            this.baseDelay * Math.pow(this.exponentialFactor, attempt),
            this.maxDelay
        );
        
        // Add jitter (±20%)
        const jitter = delay * 0.2 * (Math.random() * 2 - 1);
        return Math.round(delay + jitter);
    }

    /**
     * Check if circuit is open for key
     */
    isCircuitOpen(key) {
        const resetTime = this.openCircuits.get(key);
        if (!resetTime) return false;
        
        if (Date.now() >= resetTime) {
            // Circuit breaker reset time reached
            this.openCircuits.delete(key);
            this.failures.set(key, 0);
            logger.info(`Circuit breaker reset for key: ${key}`);
            return false;
        }
        
        return true;
    }

    /**
     * Record successful execution
     */
    recordSuccess(key) {
        this.failures.set(key, 0);
        this.openCircuits.delete(key);
    }

    /**
     * Record failed execution
     */
    recordFailure(key) {
        const count = (this.failures.get(key) || 0) + 1;
        this.failures.set(key, count);
        
        if (count >= this.circuitBreakerThreshold) {
            const resetTime = Date.now() + this.circuitBreakerResetTime;
            this.openCircuits.set(key, resetTime);
            logger.error(`Circuit breaker opened for key: ${key} (failures: ${count})`);
        }
    }

    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Reset circuit breaker for key
     */
    reset(key) {
        this.failures.set(key, 0);
        this.openCircuits.delete(key);
        logger.info(`Circuit breaker manually reset for key: ${key}`);
    }

    /**
     * Get circuit breaker status
     */
    getStatus(key) {
        return {
            failures: this.failures.get(key) || 0,
            isOpen: this.isCircuitOpen(key),
            resetTime: this.openCircuits.get(key) || null,
        };
    }
}

module.exports = RetryStrategy;
