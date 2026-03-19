const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const logger = require('./utils/logger');
const aiService = require('./utils/ai');

puppeteer.use(StealthPlugin());

class ShopeeLiveBot {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
    this.isRunning = false;
    this.processedMessages = new Set();
  }

  async initialize() {
    logger.info('🔧 Initializing browser...');
    
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1280,800'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set viewport and user agent
    await this.page.setViewport({ width: 1280, height: 800 });
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    logger.info('✅ Browser initialized');
  }

  async login() {
    logger.info('🔐 Logging in to Shopee...');
    
    try {
      await this.page.goto('https://shopee.co.th/buyer/login', {
        waitUntil: 'networkidle2'
      });

      // TODO: Implement actual login flow
      // This depends on Shopee's current login page structure
      logger.warn('⚠️  Manual login required - login automation not implemented yet');
      logger.info('Please log in manually in the browser window...');
      
      // Wait for user to login manually (for now)
      await this.page.waitForNavigation({ timeout: 120000 });
      
      logger.info('✅ Login successful');
    } catch (error) {
      logger.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  async joinLive() {
    logger.info('📺 Joining live stream...');
    
    await this.page.goto(this.config.liveUrl, {
      waitUntil: 'networkidle2'
    });

    // Wait for live chat to load
    await this.page.waitForTimeout(3000);
    
    logger.info('✅ Joined live stream');
  }

  async monitorChat() {
    logger.info('👀 Monitoring chat messages...');
    
    this.isRunning = true;

    while (this.isRunning) {
      try {
        // TODO: Implement actual chat monitoring
        // This selector needs to be updated based on actual Shopee Live DOM structure
        const messages = await this.page.evaluate(() => {
          const chatElements = document.querySelectorAll('.live-chat-message'); // Placeholder selector
          return Array.from(chatElements).map(el => ({
            id: el.dataset.messageId || Math.random().toString(),
            username: el.querySelector('.username')?.textContent || 'Unknown',
            message: el.querySelector('.message-text')?.textContent || '',
            timestamp: Date.now()
          }));
        });

        for (const msg of messages) {
          if (!this.processedMessages.has(msg.id)) {
            await this.handleMessage(msg);
            this.processedMessages.add(msg.id);
          }
        }

        // Clean up old processed messages (keep last 100)
        if (this.processedMessages.size > 100) {
          const toDelete = Array.from(this.processedMessages).slice(0, 50);
          toDelete.forEach(id => this.processedMessages.delete(id));
        }

        await this.page.waitForTimeout(1000); // Check every second

      } catch (error) {
        logger.error('❌ Chat monitoring error:', error.message);
        await this.page.waitForTimeout(2000);
      }
    }
  }

  async handleMessage(msg) {
    logger.info(`💬 New message from ${msg.username}: ${msg.message}`);

    if (!this.config.autoReply) {
      return;
    }

    // Check if message is a question or needs reply
    if (this.shouldReply(msg.message)) {
      const reply = await aiService.generateReply(msg.message);
      await this.sendMessage(reply);
    }
  }

  shouldReply(message) {
    const keywords = [
      'ราคา', 'เท่าไร', 'สี', 'ขนาด', 'size',
      'จัดส่ง', 'ส่งฟรี', 'มีไหม', 'แนะนำ',
      '?', '？', 'ไหม', 'อยาก', 'สนใจ'
    ];

    return keywords.some(keyword => message.includes(keyword));
  }

  async sendMessage(text) {
    try {
      const delay = Math.random() * 
        (this.config.replyDelay.max - this.config.replyDelay.min) + 
        this.config.replyDelay.min;

      logger.debug(`⏳ Waiting ${Math.round(delay)}ms before replying...`);
      await this.page.waitForTimeout(delay);

      // TODO: Implement actual message sending
      // This selector needs to be updated based on actual Shopee Live DOM structure
      const inputSelector = '.chat-input'; // Placeholder selector
      
      await this.page.type(inputSelector, text);
      await this.page.keyboard.press('Enter');

      logger.info(`📤 Sent reply: "${text}"`);

    } catch (error) {
      logger.error('❌ Failed to send message:', error.message);
    }
  }

  async start() {
    logger.info('🎬 Starting bot...');

    await this.login();
    await this.joinLive();
    await this.monitorChat();
  }

  async stop() {
    logger.info('🛑 Stopping bot...');
    this.isRunning = false;

    if (this.browser) {
      await this.browser.close();
    }

    logger.info('✅ Bot stopped');
  }
}

module.exports = ShopeeLiveBot;
