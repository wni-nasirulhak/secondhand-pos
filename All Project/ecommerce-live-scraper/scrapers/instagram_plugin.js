
const BaseLiveScraper = require('./base_plugin');

/**
 * InstagramPlugin - Scraper for Instagram Live (Web)
 * Targeted at the desktop web view of IG Live streams.
 */
class InstagramPlugin extends BaseLiveScraper {
    constructor(page, config) {
        super(page, config);
        this.name = 'Instagram';
    }

    async extractComments() {
        const page = this.page;
        const extractionFn = () => {
            const results = [];
            // Instagram web chat usually has a class like _a9zs for each message block
            const messageItems = document.querySelectorAll('div[class*="_a9zs"]');
            
            messageItems.forEach(item => {
                try {
                    // Instagram uses spans with specific layout classes
                    const usernameEl = item.querySelector('span[class*="_a9zc"]');
                    const textEl = item.querySelector('span[class*="_a9ze"]');
                    
                    if (usernameEl && textEl) {
                        const username = usernameEl.innerText.trim();
                        const comment = textEl.innerText.trim();
                        if (username && comment) {
                            results.push({ username, comment });
                        }
                    }
                } catch (e) {}
            });
            return results;
        };

        try {
            return await page.evaluate(extractionFn);
        } catch (e) {
            console.error(`❌ Instagram Extraction Error: ${e.message}`);
            return [];
        }
    }

    async sendReply(message) {
        const page = this.page;
        try {
            // Instagram web input typically has an aria-label with "comment"
            const inputSelector = 'textarea[aria-label*="comment" i]';
            
            await page.waitForSelector(inputSelector, { timeout: 10000 });
            await page.fill(inputSelector, message);
            await page.waitForTimeout(500);
            
            // Press Post button or Enter
            const submitBtn = await page.$('button[type="submit"]');
            if (submitBtn) {
                await submitBtn.click();
            } else {
                await page.keyboard.press('Enter');
            }
            
            await page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.error(`❌ Instagram failed to send comment: ${error.message}`);
            return false;
        }
    }
}

module.exports = InstagramPlugin;
