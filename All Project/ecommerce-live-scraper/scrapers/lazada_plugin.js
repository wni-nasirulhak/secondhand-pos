
const BaseLiveScraper = require('./base_plugin');

/**
 * LazadaPlugin - Scraper for Lazada Live
 */
class LazadaPlugin extends BaseLiveScraper {
    constructor(page, config) {
        super(page, config, 'Lazada');
    }

    async extractComments() {
        const page = this.page;
        const selectors = this.selectors;
        const extractionFn = (sel) => {
            const results = [];
            // Target individual message items
            // Based on research, Lazada uses sc- prefixes or Ant Design classes
            // We'll use a mix of attribute selectors and children mapping
            const messageItems = document.querySelectorAll(sel.chat_message_container);
            
            messageItems.forEach(item => {
                try {
                    // Lazada structure often has spans inside a div
                    const spans = item.querySelectorAll('span');
                    if (spans.length >= 2) {
                        const username = spans[0].innerText.replace(/:$/, '').trim();
                        const comment = spans[1].innerText.trim();
                        if (username && comment) {
                            results.push({ username, comment });
                        }
                    }
                } catch (e) {}
            });

            // Alternative: check AntD if applicable
            const antMsgs = document.querySelectorAll(sel.username_alt);
            antMsgs.forEach(meta => {
                const username = meta.innerText.trim();
                const content = meta.nextElementSibling?.innerText.trim();
                if (username && content) {
                    results.push({ username, comment: content });
                }
            });

            return results;
        };

        try {
            return await page.evaluate(extractionFn, selectors);
        } catch (e) {
            console.error(`❌ Lazada Extraction Error: ${e.message}`);
            return [];
        }
    }

    async sendReply(message) {
        const page = this.page;
        try {
            // Lazada PC uses Ant Design input
            const inputSelector = this.selectors.input_field;
            const sendBtnSelector = this.selectors.send_button;

            await page.waitForSelector(inputSelector, { timeout: 5000 });
            await page.fill(inputSelector, message);
            await page.waitForTimeout(500);
            
            await page.click(sendBtnSelector);
            await page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.error(`❌ Lazada failed to send comment: ${error.message}`);
            return false;
        }
    }
}

module.exports = LazadaPlugin;
