
const BaseLiveScraper = require('./base_plugin');

/**
 * ShopeePlugin - Scraper for Shopee Live
 */
class ShopeePlugin extends BaseLiveScraper {
    constructor(page, config) {
        super(page, config);
        this.name = 'Shopee';
    }

    async extractComments() {
        const page = this.page;
        const extractionFn = () => {
            const results = [];
            // Selectors based on research
            const messageContainers = document.querySelectorAll('.shopee-live-chat-panel__item');
            
            messageContainers.forEach(container => {
                try {
                    // Skip system messages
                    if (container.classList.contains('shopee-live-chat-panel__item-system-msg')) return;

                    const usernameEl = container.querySelector('.shopee-live-chat-panel__item-nickname');
                    const commentEl = container.querySelector('.shopee-live-chat-panel__item-text');
                    
                    if (usernameEl && commentEl) {
                        const username = usernameEl.innerText.trim();
                        const comment = commentEl.innerText.trim();
                        
                        // Basic cleanup for Shopee (sometimes nickname has colon)
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
            console.error(`❌ Shopee Extraction Error: ${e.message}`);
            return [];
        }
    }

    async sendReply(message) {
        const page = this.page;
        try {
            const inputSelector = '.shopee-live-chat-input__textarea';
            const sendBtnSelector = '.shopee-live-chat-input__send-btn';

            await page.waitForSelector(inputSelector, { timeout: 5000 });
            await page.click(inputSelector);
            await page.fill(inputSelector, message);
            await page.waitForTimeout(500);
            
            await page.click(sendBtnSelector);
            await page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.error(`❌ Shopee failed to send comment: ${error.message}`);
            return false;
        }
    }
}

module.exports = ShopeePlugin;
