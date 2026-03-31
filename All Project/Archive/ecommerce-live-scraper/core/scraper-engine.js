const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const WebhookManager = require('./webhook-manager');
const AIReplyEngine = require('./ai-reply-engine');
const UserFilter = require('./user-filter');
const StatsTracker = require('./stats-tracker');

class ScraperEngine {
  constructor(platform, config) {
    this.platform = platform; // Platform scraper instance (TikTok/Shopee/Lazada)
    this.config = config;
    this.comments = new Map(); // Dedupe by key
    this.browser = null;
    this.isRunning = false;
    
    // Initialize managers
    this.webhookManager = new WebhookManager(config.webhooks || []);
    this.aiReplyEngine = new AIReplyEngine(config.reply || {});
    this.userFilter = new UserFilter(config.filters || {});
    this.statsTracker = new StatsTracker();
  }

  async start() {
    console.log(`🚀 Starting ${this.platform.name} scraper...`);
    console.log(`⚙️  Config:`, {
      url: this.config.url,
      duration: `${this.config.duration}s`,
      interval: `${this.config.interval}s`,
      mode: this.config.mode
    });

    try {
      // Launch browser
      const browserOptions = {
        headless: this.config.headless || false,
        channel: 'chrome'
      };

      this.browser = await chromium.launch(browserOptions);

      // Initialize platform
      const initOptions = {};
      if (this.config.storageStatePath) {
        initOptions.storageStatePath = this.config.storageStatePath;
      }

      await this.platform.init(this.browser, initOptions);

      // Authenticate
      await this.platform.authenticate();

      // Navigate to live
      await this.platform.navigateToLive(this.config.url);

      // Wait for page to stabilize
      await this.platform.sleep(3000);

      console.log('✅ Ready to scrape!');

      // Start statistics tracker
      this.statsTracker.start();

      // Start scraping loop
      this.isRunning = true;
      const startTime = Date.now();
      let round = 0;

      while ((Date.now() - startTime) / 1000 < this.config.duration && this.isRunning) {
        round++;
        console.log(`\n🔄 Round ${round} - Scraping...`);
        
        await this.scrapeOnce();
        
        if (this.isRunning) {
          await this.platform.sleep(this.config.interval * 1000);
        }
      }

      console.log('\n✅ Scraping completed!');
      console.log(`📊 Total unique comments: ${this.comments.size}`);

      // Save comments
      await this.saveComments();

      // Cleanup
      await this.stop();

    } catch (error) {
      console.error('❌ Scraper error:', error.message);
      await this.stop();
      throw error;
    }
  }

  async scrapeOnce() {
    try {
      const newComments = await this.platform.extractComments(this.platform.page);
      
      console.log(`📝 Found ${newComments.length} comments on page`);

      let newCount = 0;
      for (const comment of newComments) {
        const key = `${comment.username}:${comment.comment}`;
        
        if (!this.comments.has(key)) {
          // Check user filter
          if (this.userFilter.shouldFilter(comment.username)) {
            console.log(`🚫 Filtered out: ${comment.username}`);
            continue;
          }
          
          this.comments.set(key, comment);
          newCount++;
          
          // Update statistics
          this.statsTracker.addComment(comment);
          
          // Send to webhooks
          if (this.config.webhooks && this.config.webhooks.length > 0) {
            await this.webhookManager.send(comment);
          }
          
          // AI auto-reply
          if (this.config.mode === 'respond' && this.aiReplyEngine.enabled) {
            const reply = await this.aiReplyEngine.generateReply(comment);
            if (reply) {
              await this.platform.postComment(this.platform.page, reply);
              console.log(`🤖 Auto-replied to ${comment.username}: ${reply}`);
            }
          }
          
          // Output to console (for server to capture)
          console.log('NEW_COMMENT:', JSON.stringify(comment));
        }
      }

      if (newCount > 0) {
        console.log(`✨ ${newCount} new comments added`);
      }

    } catch (error) {
      console.error('Error extracting comments:', error.message);
    }
  }

  async saveComments() {
    if (this.comments.size === 0) {
      console.log('⚠️  No comments to save');
      return;
    }

    try {
      const platformName = this.platform.name.toLowerCase();
      const dataDir = path.join(__dirname, '..', 'data', 'comments', platformName);
      
      // Ensure directory exists
      await fs.mkdir(dataDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `comments_${timestamp}.json`;
      const filepath = path.join(dataDir, filename);

      const commentsArray = Array.from(this.comments.values());
      await fs.writeFile(filepath, JSON.stringify(commentsArray, null, 2), 'utf8');
      
      console.log(`💾 Saved ${commentsArray.length} comments to ${filename}`);
    } catch (error) {
      console.error('❌ Error saving comments:', error.message);
    }
  }

  async stop() {
    console.log('\n🛑 Stopping scraper...');
    this.isRunning = false;

    try {
      if (this.platform) {
        await this.platform.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      console.error('Error during cleanup:', error.message);
    }
  }

  getComments() {
    return Array.from(this.comments.values());
  }

  getStats() {
    return this.statsTracker.getStats();
  }

  updateWebhooks(webhooks) {
    this.webhookManager.updateWebhooks(webhooks);
  }

  updateFilters(filters) {
    this.userFilter.updateLists(filters);
  }

  updateAIConfig(config) {
    this.aiReplyEngine.updateConfig(config);
  }
}

module.exports = ScraperEngine;
