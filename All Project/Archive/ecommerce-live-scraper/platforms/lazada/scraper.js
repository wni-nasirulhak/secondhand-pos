const PlatformScraper = require('../platform-interface');

class LazadaScraper extends PlatformScraper {
  constructor(config) {
    const selectors = require('./selectors.json');
    super({
      name: 'Lazada',
      url: config.url,
      selectors
    });
  }

  async authenticate() {
    console.log('🔐 Lazada: Using storage state authentication');
  }

  async extractComments(page) {
    return await page.evaluate((selectors) => {
      const comments = [];
      
      const selectorList = selectors.commentContainer.split(', ');
      let elements = [];
      
      for (const selector of selectorList) {
        elements = document.querySelectorAll(selector);
        if (elements.length > 0) break;
      }

      const usernameSelectorList = selectors.username.split(', ');
      const textSelectorList = selectors.commentText.split(', ');
      const timestampSelectorList = selectors.timestamp.split(', ');

      elements.forEach((element) => {
        try {
          let username = '';
          let commentText = '';
          let timestamp = '';

          for (const selector of usernameSelectorList) {
            const el = element.querySelector(selector);
            if (el && el.textContent.trim()) {
              username = el.textContent.trim();
              break;
            }
          }

          for (const selector of textSelectorList) {
            const el = element.querySelector(selector);
            if (el && el.textContent.trim()) {
              commentText = el.textContent.trim();
              break;
            }
          }

          for (const selector of timestampSelectorList) {
            const el = element.querySelector(selector);
            if (el && el.textContent.trim()) {
              timestamp = el.textContent.trim();
              break;
            }
          }

          if (username && commentText) {
            comments.push({
              platform: 'lazada',
              username,
              comment: commentText,
              timestamp: timestamp || new Date().toISOString()
            });
          }
        } catch (e) {}
      });

      return comments;
    }, this.selectors);
  }

  async postComment(page, text) {
    try {
      const selectorList = this.selectors.commentInput.split(', ');
      let inputSelector = null;

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
      
      console.log(`✅ Posted Lazada comment: ${text}`);
    } catch (error) {
      console.error('❌ Failed to post Lazada comment:', error.message);
    }
  }
}

module.exports = LazadaScraper;
