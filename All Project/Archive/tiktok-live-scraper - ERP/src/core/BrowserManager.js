/**
 * BrowserManager - Playwright browser lifecycle management
 */

const playwright = require('playwright');
const fs = require('fs');
const logger = require('../utils/logger').module('BrowserManager');
const appConfig = require('../config/app.config');

class BrowserManager {
    constructor() {
        this.browser = null;
        this.contexts = new Map(); // jobId -> context
    }

    /**
     * Launch browser
     */
    async launch(options = {}) {
        if (this.browser) {
            logger.info('Browser already running');
            return this.browser;
        }

        const launchOptions = {
            headless: options.headless !== undefined ? options.headless : appConfig.browser.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ],
        };

        // Chrome profile support
        if (options.chromeProfilePath) {
            launchOptions.channel = 'chrome';
            launchOptions.args.push(`--user-data-dir=${options.chromeProfilePath}`);
        }

        logger.info('Launching browser...', { headless: launchOptions.headless });
        this.browser = await playwright.chromium.launch(launchOptions);
        logger.info('Browser launched successfully');

        return this.browser;
    }

    /**
     * Create new browser context (isolated session)
     */
    async createContext(jobId, options = {}) {
        if (!this.browser) {
            await this.launch();
        }

        const contextOptions = {
            viewport: options.viewport || { width: 1920, height: 1080 },
            userAgent: options.userAgent || this.getDefaultUserAgent(),
            locale: 'th-TH',
            timezoneId: 'Asia/Bangkok',
            ...options.extraOptions,
        };

        // Load storage state if provided
        if (options.storageStatePath && fs.existsSync(options.storageStatePath)) {
            contextOptions.storageState = options.storageStatePath;
            logger.info(`Loading storage state from: ${options.storageStatePath}`);
        }

        // Proxy support
        if (options.proxy) {
            contextOptions.proxy = options.proxy;
        }

        const context = await this.browser.newContext(contextOptions);
        
        // Store context
        this.contexts.set(jobId, context);
        
        logger.info(`Browser context created for job: ${jobId}`);
        return context;
    }

    /**
     * Get context for job
     */
    getContext(jobId) {
        return this.contexts.get(jobId);
    }

    /**
     * Close context for job
     */
    async closeContext(jobId) {
        const context = this.contexts.get(jobId);
        if (!context) {
            logger.warn(`No context found for job: ${jobId}`);
            return;
        }

        try {
            await context.close();
            this.contexts.delete(jobId);
            logger.info(`Context closed for job: ${jobId}`);
        } catch (error) {
            logger.error(`Error closing context for job ${jobId}:`, error);
        }
    }

    /**
     * Save storage state (cookies, localStorage)
     */
    async saveStorageState(jobId, filePath) {
        const context = this.contexts.get(jobId);
        if (!context) {
            throw new Error(`No context found for job: ${jobId}`);
        }

        await context.storageState({ path: filePath });
        logger.info(`Storage state saved to: ${filePath}`);
    }

    /**
     * Close browser and all contexts
     */
    async close() {
        // Close all contexts
        for (const [jobId, context] of this.contexts.entries()) {
            try {
                await context.close();
                logger.info(`Context closed for job: ${jobId}`);
            } catch (error) {
                logger.error(`Error closing context ${jobId}:`, error);
            }
        }
        this.contexts.clear();

        // Close browser
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            logger.info('Browser closed');
        }
    }

    /**
     * Get default User-Agent
     */
    getDefaultUserAgent() {
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    /**
     * Get browser status
     */
    getStatus() {
        return {
            browserRunning: this.browser !== null,
            activeContexts: this.contexts.size,
            contexts: Array.from(this.contexts.keys()),
        };
    }
}

// Singleton instance
const browserManager = new BrowserManager();

module.exports = browserManager;
