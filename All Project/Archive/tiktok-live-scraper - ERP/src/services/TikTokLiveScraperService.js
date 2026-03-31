/**
 * TikTok Live Scraper Service
 * Manages TikTok Live scraping process (legacy compatibility)
 */

const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger').module('TikTokLiveScraper');
const EventBus = require('../core/EventBus');

class TikTokLiveScraperService {
    constructor() {
        this.process = null;
        this.isRunning = false;
        this.currentConfig = null;
    }

    /**
     * Start TikTok Live scraper
     */
    start(config) {
        if (this.isRunning) {
            throw new Error('Scraper is already running');
        }

        const {
            url, duration, interval, headless, authMode, stealth,
            chromePath, browser, mode, replyCooldown, replyOnQuestion,
            replyTemplates, blacklist, whitelist, viplist, webhooks,
            aiWebhookUrl, hostUsername
        } = config;

        // Build command args
        const args = [
            path.join(__dirname, '../../scripts/scraper_wrapper.js'),
            '--url', url,
            '--duration', duration.toString(),
            '--interval', interval.toString(),
            '--browser', browser || 'chromium',
            '--mode', mode || 'read'
        ];

        if (headless) args.push('--headless');
        if (stealth) args.push('--stealth');
        if (chromePath) args.push('--chrome-profile', chromePath);
        if (replyCooldown) args.push('--reply-cooldown', replyCooldown.toString());
        if (replyOnQuestion) args.push('--reply-on-question');
        if (hostUsername) args.push('--host-username', hostUsername);

        // User lists
        if (blacklist && blacklist.length > 0) {
            args.push('--blacklist', JSON.stringify(blacklist));
        }
        if (whitelist && whitelist.length > 0) {
            args.push('--whitelist', JSON.stringify(whitelist));
        }
        if (viplist && viplist.length > 0) {
            args.push('--viplist', JSON.stringify(viplist));
        }

        // Reply templates
        if (replyTemplates && replyTemplates.length > 0) {
            args.push('--reply-templates', JSON.stringify(replyTemplates));
        }

        // Webhooks
        if (webhooks && webhooks.length > 0) {
            args.push('--webhooks', JSON.stringify(webhooks));
        }

        // AI Webhook
        if (aiWebhookUrl) {
            args.push('--ai-webhook-url', aiWebhookUrl);
        }

        // Auth mode
        if (authMode === 'persistent') {
            args.push('--persistent');
        }

        logger.info('Starting TikTok Live scraper...', { url, duration, interval });

        // Spawn process
        this.process = spawn('node', args, {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        this.isRunning = true;
        this.currentConfig = config;

        // Handle stdout
        this.process.stdout.on('data', (data) => {
            const output = data.toString().trim();
            logger.debug('[Scraper]', output);

            // Parse comment events (if JSON)
            try {
                const parsed = JSON.parse(output);
                if (parsed.type === 'comment') {
                    EventBus.emitCommentScraped(parsed.data);
                }
            } catch {
                // Not JSON, just log
            }
        });

        // Handle stderr
        this.process.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error) {
                logger.error('[Scraper]', error);
            }
        });

        // Handle process exit
        this.process.on('close', (code) => {
            logger.info(`Scraper process exited with code ${code}`);
            this.isRunning = false;
            this.process = null;
        });

        this.process.on('error', (err) => {
            logger.error('Scraper process error:', err);
            this.isRunning = false;
            this.process = null;
        });

        return { success: true };
    }

    /**
     * Stop scraper
     */
    stop() {
        if (!this.isRunning || !this.process) {
            throw new Error('Scraper is not running');
        }

        logger.info('Stopping TikTok Live scraper...');

        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec(`taskkill /pid ${this.process.pid} /T /F`, () => {});
        } else {
            this.process.kill('SIGTERM');
        }

        this.isRunning = false;
        this.process = null;

        return { success: true };
    }

    /**
     * Get status
     */
    getStatus() {
        return {
            running: this.isRunning,
            config: this.currentConfig,
            uptime: this.process ? process.uptime() : 0
        };
    }
}

// Singleton
const scraperService = new TikTokLiveScraperService();

module.exports = scraperService;
