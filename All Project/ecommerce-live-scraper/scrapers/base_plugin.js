
/**
 * BaseLiveScraper - Base class for all platform scrapers
 * Contains shared logic for filtering, AI webhooks, and session management.
 */
class BaseLiveScraper {
    constructor(page, config, name) {
        this.page = page;
        this.config = config;
        this.name = name;
        this.selectors = this.loadSelectors();
        this.seenKeys = new Set();
        this.repliedUsers = new Map();
        this.replyHistory = [];
        this.MAX_HISTORY = 5;
        this.lastAIRequestTime = 0;
        this.AI_COOLDOWN_MS = 10000;
        this.shouldStop = false;
        this.webhookSentKeys = new Set();
    }

    loadSelectors() {
        try {
            const path = require('path');
            const fs = require('fs');
            const selectorPath = path.join(__dirname, '..', 'src', 'config', 'selectors.json');
            const allSelectors = JSON.parse(fs.readFileSync(selectorPath, 'utf8'));
            const platform = (this.name || '').toLowerCase();
            return allSelectors[platform] || {};
        } catch (e) {
            console.error(`❌ Error loading selectors for ${this.name}:`, e.message);
            return {};
        }
    }

    async start() {
        console.error(`🚀 Starting ${this.name} scraper...`);
        const start = Date.now();
        const totalSeconds = this.config.duration;

        while ((Date.now() - start) / 1000 < totalSeconds && !this.shouldStop) {
            try {
                const comments = await this.extractComments();
                for (const comment of comments) {
                    await this.handleComment(comment);
                }
                await this.page.waitForTimeout(this.config.interval * 1000);
            } catch (e) {
                console.error(`❌ Error in ${this.name} loop:`, e.message);
                await this.page.waitForTimeout(5000);
            }
        }
    }

    async handleComment(commentData) {
        const { username, comment } = commentData;
        const key = `${username}:${comment}`;
        
        if (this.seenKeys.has(key)) return;
        this.seenKeys.add(key);

        commentData.timestamp = new Date().toISOString();
        console.log(`COMMENT:${JSON.stringify(commentData)}`);

        // 1. Webhooks
        if (this.config.webhooks && this.config.webhooks.length > 0) {
            this.sendToWebhooks(commentData);
        }

        // 2. Host Exclusion
        if (this.isHost(username)) return;

        // 3. Blacklist
        if (this.config.blacklist && this.config.blacklist.includes(username)) return;

        // 4. Respond Mode
        if (this.config.mode === 'respond') {
            await this.processReply(username, comment, commentData);
        }
    }

    isHost(username) {
        if (!this.config.hostUsername) return false;
        const normUser = username.replace(/^@/, '').toLowerCase().trim();
        const normHost = this.config.hostUsername.replace(/^@/, '').toLowerCase().trim();
        return normUser === normHost;
    }

    async processReply(username, comment, commentData) {
        // AI Webhook Mode
        if (this.config.aiWebhookUrl) {
            await this.handleAIReply(username, comment, commentData);
        } else {
            // Template Mode
            await this.handleTemplateReply(username, comment);
        }
    }

    async handleAIReply(username, comment, commentData) {
        const timeSinceLastAI = Date.now() - this.lastAIRequestTime;
        if (timeSinceLastAI < this.AI_COOLDOWN_MS) return;

        console.error(`🤖 [AI Webhook] Asking for: ${username}`);
        this.lastAIRequestTime = Date.now();
        
        try {
            const result = await this.postToAIWebhook(this.config.aiWebhookUrl, commentData);
            if (result && result.reply && !result.skip) {
                // Similarity Check
                const isTooSimilar = this.replyHistory.some(prev => this.getStringSimilarity(prev, result.reply) > 0.70);
                if (isTooSimilar) return;

                const jitter = Math.floor(Math.random() * 2000) + 500;
                await this.page.waitForTimeout(jitter);

                const sent = await this.sendReply(result.reply);
                if (sent) {
                    this.replyHistory.push(result.reply);
                    if (this.replyHistory.length > this.MAX_HISTORY) this.replyHistory.shift();
                }
            }
        } catch (e) {
            console.error(`❌ AI Webhook Error: ${e.message}`);
        }
    }

    async handleTemplateReply(username, comment) {
        // Implementation for template based reply (similar to original)
        // ... (can be detailed as needed)
    }

    getStringSimilarity(s1, s2) {
        if (!s1 || !s2) return 0;
        s1 = s1.toLowerCase().trim();
        s2 = s2.toLowerCase().trim();
        if (s1 === s2) return 1;
        const bigrams1 = new Set();
        for (let i = 0; i < s1.length - 1; i++) bigrams1.add(s1.substring(i, i + 2));
        const bigrams2 = new Set();
        for (let i = 0; i < s2.length - 1; i++) bigrams2.add(s2.substring(i, i + 2));
        let intersection = 0;
        for (const b of bigrams1) if (bigrams2.has(b)) intersection++;
        return (2 * intersection) / (bigrams1.size + bigrams2.size);
    }

    async postToAIWebhook(url, data) {
        // Use standard http/https request
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            const parsed = new URL(url);
            const lib = parsed.protocol === 'https:' ? require('https') : require('http');
            const req = lib.request({
                hostname: parsed.hostname,
                port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
                path: parsed.pathname + parsed.search,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
            }, res => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve(JSON.parse(body)));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }

    sendToWebhooks(data) { /* Similar to original */ }
}

module.exports = BaseLiveScraper;
