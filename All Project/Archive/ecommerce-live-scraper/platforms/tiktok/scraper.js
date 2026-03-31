const PlatformScraper = require('../platform-interface');
const path = require('path');

class TikTokScraper extends PlatformScraper {
  constructor(config) {
    const selectors = require('./selectors.json');
    super({
      name: 'TikTok',
      url: config.url,
      selectors
    });
  }

  async authenticate() {
    // TikTok authentication handled by storage state
    console.log('🔐 TikTok: Using storage state authentication');
  }

  async extractComments(page) {
    return await page.evaluate((selectors) => {
      const comments = [];
      
      // Try multiple selectors
      const selectorList = selectors.commentContainer.split(', ');
      let elements = [];
      
      for (const selector of selectorList) {
        elements = document.querySelectorAll(selector);
        if (elements.length > 0) break;
      }

      const usernameSelectorList = selectors.username.split(', ');
      const textSelectorList = selectors.commentText.split(', ');

      elements.forEach((element) => {
        try {
          let username = '';
          let commentText = '';

          // Try to find username
          for (const selector of usernameSelectorList) {
            const el = element.querySelector(selector);
            if (el && el.textContent.trim()) {
              username = el.textContent.trim();
              break;
            }
          }

          // Try to find comment text
          for (const selector of textSelectorList) {
            const el = element.querySelector(selector);
            if (el && el.textContent.trim()) {
              commentText = el.textContent.trim();
              break;
            }
          }

          if (username && commentText) {
            comments.push({
              platform: 'tiktok',
              username,
              comment: commentText,
              timestamp: new Date().toISOString()
            });
          }
        } catch (e) {
          // Skip problematic elements
        }
      });

      return comments;
    }, this.selectors);
  }

  async postComment(page, text) {
    try {
      const selectorList = this.selectors.commentInput.split(', ');
      let inputSelector = null;

      // Find working input selector
      for (const selector of selectorList) {
        const exists = await page.locator(selector).count();
        if (exists > 0) {
          inputSelector = selector;
          break;
        }
      }

      if (!inputSelector) {
        throw new Error('Comment input not found');
      }

      await page.fill(inputSelector, text);
      await page.click(this.selectors.sendButton);
      await this.sleep(1000);
      
      console.log(`✅ Posted comment: ${text}`);
    } catch (error) {
      console.error('❌ Failed to post comment:', error.message);
    }
  }
}

module.exports = TikTokScraper;
