
const BaseLiveScraper = require('./base_plugin');

/**
 * TikTokPlugin - Logic migrated from scraper_wrapper.js
 * DO NOT EDIT selectors or extraction logic as per user requirement.
 */
class TikTokPlugin extends BaseLiveScraper {
    constructor(page, config) {
        super(page, config, 'TikTok');
    }

    /**
     * Identical extraction logic from original scraper_wrapper.js
     */
    async extractComments() {
        const page = this.page;
        const selectors = this.selectors;
        const extractionFn = (sel) => {
            const results = [];
            // ✅ DYNAMIC SELECTORS (Centralized)
            const messageContainers = document.querySelectorAll(sel.chat_message_container);
            
            messageContainers.forEach(container => {
                try {
                    const usernameEl = container.querySelector(sel.username);
                    if (!usernameEl) return;
                    
                    const username = usernameEl.innerText.trim();
                    let parent = usernameEl.parentElement;
                    while (parent && parent !== container) {
                        if (parent.className.includes('flex') && parent.className.includes('break-words')) {
                            break;
                        }
                        parent = parent.parentElement;
                    }
                    if (!parent) parent = container;
                    
                    const fullText = parent.innerText.trim();
                    const lines = fullText.split('\n');
                    let messageText = '';
                    let foundUsername = false;
                    
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line === username) {
                            foundUsername = true;
                            messageText = lines.slice(i + 1).join(' ').trim();
                            break;
                        }
                    }
                    
                    if (!foundUsername || !messageText) {
                        const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);
                        let foundUserNode = false;
                        let textParts = [];
                        while (walker.nextNode()) {
                            const text = walker.currentNode.textContent.trim();
                            if (text === username) {
                                foundUserNode = true;
                                continue;
                            }
                            if (foundUserNode && text && text.length > 0) textParts.push(text);
                        }
                        messageText = textParts.join(' ').trim();
                    }
                    
                    if (messageText && messageText.length > 0) {
                        if (messageText.includes('เข้าร่วมแล้ว') || messageText.includes('joined')) return;
                        if (messageText.match(/ส่ง .+ × \d+/)) return;
                        if (/^\d+$/.test(messageText)) return;
                        if (/^\d{1,2}:\d{2}$/.test(messageText)) return;
                        
                        if (messageText.length < 1000) {
                            results.push({ username: username || 'User', comment: messageText });
                        }
                    }
                } catch (e) {}
            });
            return results;
        };

        const allComments = [];
        try {
            const mainComments = await page.evaluate(extractionFn, selectors);
            allComments.push(...mainComments);
            const frames = page.frames();
            for (const frame of frames) {
                if (frame === page.mainFrame()) continue;
                try {
                    const frameComments = await frame.evaluate(extractionFn, selectors);
                    allComments.push(...frameComments);
                } catch (e) {}
            }
        } catch (e) {
            console.error(`❌ TikTok Extraction Error: ${e.message}`);
        }
        return allComments;
    }

    /**
     * Identical reply logic from original scraper_wrapper.js
     */
    async sendReply(message) {
        const page = this.page;
        try {
            const inputField = await page.$(this.selectors.input_field);
            if (!inputField) {
                console.error('❌ TikTok Input field not found');
                return false;
            }
            await inputField.click();
            await page.waitForTimeout(300);

            await page.evaluate(({ text, sel }) => {
                const input = document.querySelector(sel.input_field);
                if (input) {
                    input.innerText = text;
                    input.textContent = text;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, { text: message, sel: this.selectors });

            await page.waitForTimeout(500);
            await page.waitForSelector(`${this.selectors.send_button}.visible`, { timeout: 2000 });

            const sendButton = await page.$(this.selectors.send_button);
            if (!sendButton) return false;

            await sendButton.click();
            await page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.error(`❌ TikTok failed to send comment: ${error.message}`);
            return false;
        }
    }

    async navigate() {
        // Navigation is handled by the main wrapper for now to keep it standard
        // but it can be platform specific if needed.
    }
}

module.exports = TikTokPlugin;
