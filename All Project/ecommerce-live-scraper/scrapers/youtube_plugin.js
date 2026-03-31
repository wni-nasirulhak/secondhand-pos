
const BaseLiveScraper = require('./base_plugin');

/**
 * YouTubePlugin - Scraper for YouTube Live
 * Switches context to iframe#chatframe for extraction and interaction.
 */
class YouTubePlugin extends BaseLiveScraper {
    constructor(page, config) {
        super(page, config);
        this.name = 'YouTube';
    }

    async extractComments() {
        const page = this.page;
        try {
            // Find the chat frame
            const chatFrame = page.frames().find(f => f.url().includes('live_chat')) || page.mainFrame();
            
            const extractionFn = () => {
                const results = [];
                // YouTube uses custom elements for chat
                const messages = document.querySelectorAll('yt-live-chat-text-message-renderer');
                
                messages.forEach(msg => {
                    try {
                        const usernameEl = msg.querySelector('#author-name');
                        const textEl = msg.querySelector('#message');
                        
                        if (usernameEl && textEl) {
                            results.push({
                                username: usernameEl.innerText.trim(),
                                comment: textEl.innerText.trim()
                            });
                        }
                    } catch (e) {}
                });
                return results;
            };

            return await chatFrame.evaluate(extractionFn);
        } catch (e) {
            console.error(`❌ YouTube Extraction Error: ${e.message}`);
            return [];
        }
    }

    async sendReply(message) {
        const page = this.page;
        try {
            const chatFrame = page.frames().find(f => f.url().includes('live_chat')) || page.mainFrame();
            
            // YouTube chat input is a contenteditable div
            const inputSelector = '#input.yt-live-chat-text-input-field-renderer';
            const sendBtnSelector = '#send-button yt-icon-button';
            
            const inputEl = await chatFrame.waitForSelector(inputSelector, { timeout: 10000 });
            await inputEl.click();
            await page.keyboard.type(message);
            await page.waitForTimeout(500);
            
            const sendBtn = await chatFrame.$(sendBtnSelector);
            if (sendBtn) {
                await sendBtn.click();
            } else {
                await page.keyboard.press('Enter');
            }
            
            await page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.error(`❌ YouTube failed to send comment: ${error.message}`);
            return false;
        }
    }
}

module.exports = YouTubePlugin;
