
const BaseLiveScraper = require('./base_plugin');

/**
 * ShopeePlugin - Scraper for Shopee Live
 */
class ShopeePlugin extends BaseLiveScraper {
    constructor(page, config) {
        super(page, config, 'Shopee');
    }

    async extractComments() {
        const page = this.page;
        const selectors = this.selectors;
        const extractionFn = (sel) => {
            const results = [];
            // Selectors based on research
            const messageContainers = document.querySelectorAll(sel.chat_message_container);
            
            messageContainers.forEach(container => {
                try {
                    // Skip system messages
                    if (container.classList.contains('shopee-live-chat-panel__item-system-msg')) return;

                    const usernameEl = container.querySelector(sel.username);
                    const commentEl = container.querySelector(sel.comment_text);
                    
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
            return await page.evaluate(extractionFn, selectors);
        } catch (e) {
            console.error(`❌ Shopee Extraction Error: ${e.message}`);
            return [];
        }
    }

    async sendReply(message) {
        const page = this.page;
        try {
            const inputSelector = this.selectors.input_field;
            const sendBtnSelector = this.selectors.send_button;

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
