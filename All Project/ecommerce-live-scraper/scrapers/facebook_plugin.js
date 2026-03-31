
const BaseLiveScraper = require('./base_plugin');

/**
 * FacebookPlugin - Scraper for Facebook Live
 * Uses ARIA roles and labels for stable selection in Atomic CSS environments.
 */
class FacebookPlugin extends BaseLiveScraper {
    constructor(page, config) {
        super(page, config);
        this.name = 'Facebook';
    }

    async extractComments() {
        const page = this.page;
        const extractionFn = () => {
            const results = [];
            // Facebook uses role="article" for individual chat messages
            const articles = document.querySelectorAll('div[role="article"]');
            
            articles.forEach(article => {
                try {
                    // Username is usually the first span with specific formatting
                    const usernameEl = article.querySelector('span[class*="x193iq5w"], span font');
                    const textEl = article.querySelector('div[dir="auto"]');
                    
                    if (usernameEl && textEl) {
                        const username = usernameEl.innerText.trim();
                        const comment = textEl.innerText.trim();
                        
                        // Clean up username (remove colon if present)
                        const cleanUsername = username.replace(/:$/, '').trim();
                        
                        if (cleanUsername && comment) {
                            results.push({ username: cleanUsername, comment: comment });
                        }
                    }
                } catch (e) {}
            });
            return results;
        };

        try {
            return await page.evaluate(extractionFn);
        } catch (e) {
            console.error(`❌ Facebook Extraction Error: ${e.message}`);
            return [];
        }
    }

    async sendReply(message) {
        const page = this.page;
        try {
            // Facebook uses a role="textbox" with an aria-label containing "comment"
            const inputSelector = 'div[role="textbox"][aria-label*="comment" i]';
            
            await page.waitForSelector(inputSelector, { timeout: 10000 });
            await page.click(inputSelector);
            await page.fill(inputSelector, message);
            await page.waitForTimeout(500);
            
            // Press Enter to send
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.error(`❌ Facebook failed to send comment: ${error.message}`);
            return false;
        }
    }
}

module.exports = FacebookPlugin;
