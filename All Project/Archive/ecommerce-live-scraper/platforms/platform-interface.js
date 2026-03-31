// Base class for all platform scrapers
class PlatformScraper {
  constructor(config) {
    this.name = config.name;
    this.url = config.url;
    this.selectors = config.selectors || {};
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  // Abstract methods (must be implemented by subclasses)
  async authenticate() {
    throw new Error(`authenticate() not implemented in ${this.name}`);
  }

  async extractComments(page) {
    throw new Error(`extractComments() not implemented in ${this.name}`);
  }

  async postComment(page, text) {
    throw new Error(`postComment() not implemented in ${this.name}`);
  }

  // Common methods (can be overridden)
  async init(browser, options = {}) {
    this.browser = browser;
    
    const contextOptions = {};
    
    // Load storage state if provided
    if (options.storageStatePath) {
      const fs = require('fs');
      if (fs.existsSync(options.storageStatePath)) {
        try {
          // Read and sanitize storage state
          const rawState = fs.readFileSync(options.storageStatePath, 'utf8');
          const storageState = JSON.parse(rawState);
          
          // Sanitize cookies: ensure sameSite is valid
          if (storageState.cookies) {
            storageState.cookies = storageState.cookies.map(cookie => {
              // Fix invalid sameSite values
              if (!cookie.sameSite || !['Strict', 'Lax', 'None'].includes(cookie.sameSite)) {
                cookie.sameSite = 'Lax'; // Default to Lax (most compatible)
              }
              
              // If sameSite is None, ensure Secure is true
              if (cookie.sameSite === 'None') {
                cookie.secure = true;
              }
              
              return cookie;
            });
          }
          
          contextOptions.storageState = storageState;
          console.log(`✅ Loaded storage state for ${this.name} (${storageState.cookies?.length || 0} cookies)`);
        } catch (error) {
          console.error(`❌ Failed to load storage state: ${error.message}`);
          console.log('⚠️ Continuing without storage state...');
        }
      }
    }
    
    this.context = await browser.newContext(contextOptions);
    this.page = await this.context.newPage();
    
    return this.page;
  }

  async navigateToLive(url) {
    console.log(`🔗 Navigating to ${this.name} live: ${url}`);
    await this.page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    // Wait for page to settle
    await this.page.waitForLoadState('networkidle', { timeout: 30000 })
      .catch(() => console.log('⚠️ Network not idle, continuing...'));
    
    console.log(`✅ ${this.name} live loaded`);
  }

  async close() {
    if (this.context) {
      await this.context.close();
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper: Save storage state (for future sessions)
  async saveStorageState(path) {
    if (this.context) {
      await this.context.storageState({ path });
      console.log(`💾 Saved ${this.name} storage state to ${path}`);
    }
  }
}

module.exports = PlatformScraper;
