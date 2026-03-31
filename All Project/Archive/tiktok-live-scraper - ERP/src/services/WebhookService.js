/**
 * WebhookService - Send webhooks to various platforms
 */

const https = require('https');
const http = require('http');
const logger = require('../utils/logger').module('WebhookService');

class WebhookService {
    /**
     * Send webhook to configured platform
     */
    static async send(webhook, data) {
        try {
            const { platform } = webhook;
            
            switch (platform) {
                case 'discord':
                    return await this.sendDiscord(webhook, data);
                case 'slack':
                    return await this.sendSlack(webhook, data);
                case 'telegram':
                    return await this.sendTelegram(webhook, data);
                case 'custom':
                    return await this.sendCustom(webhook, data);
                default:
                    throw new Error(`Unknown webhook platform: ${platform}`);
            }
        } catch (error) {
            logger.error('Webhook send error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send Discord webhook
     */
    static async sendDiscord(webhook, data) {
        const payload = {
            embeds: [{
                title: '💬 TikTok Live Comment',
                description: data.comment || data.text,
                color: 0xfe2c55,
                fields: [
                    { name: '👤 Username', value: data.username || data.author || 'Unknown', inline: true },
                    { name: '⏰ Time', value: new Date(data.timestamp || Date.now()).toLocaleString('th-TH'), inline: true }
                ],
                footer: { text: 'EcomScraper Hub' },
                timestamp: new Date().toISOString()
            }]
        };

        return this._postJSON(webhook.url, payload);
    }

    /**
     * Send Slack webhook
     */
    static async sendSlack(webhook, data) {
        const payload = {
            text: '💬 TikTok Live Comment',
            blocks: [
                {
                    type: 'header',
                    text: { type: 'plain_text', text: '💬 TikTok Live Comment' }
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Username:*\n${data.username || data.author || 'Unknown'}` },
                        { type: 'mrkdwn', text: `*Time:*\n${new Date(data.timestamp || Date.now()).toLocaleString('th-TH')}` }
                    ]
                },
                {
                    type: 'section',
                    text: { type: 'mrkdwn', text: data.comment || data.text || '' }
                }
            ]
        };

        return this._postJSON(webhook.url, payload);
    }

    /**
     * Send Telegram message
     */
    static async sendTelegram(webhook, data) {
        const payload = {
            chat_id: webhook.chatId,
            text: `💬 *TikTok Live Comment*\n\n👤 *User:* ${data.username || data.author || 'Unknown'}\n⏰ *Time:* ${new Date(data.timestamp || Date.now()).toLocaleString('th-TH')}\n\n💬 *Message:*\n${data.comment || data.text || ''}`,
            parse_mode: 'Markdown'
        };

        const url = `https://api.telegram.org/bot${webhook.token}/sendMessage`;
        return this._postJSON(url, payload);
    }

    /**
     * Send custom webhook
     */
    static async sendCustom(webhook, data) {
        return this._postJSON(webhook.url, data);
    }

    /**
     * Helper: POST JSON request
     */
    static _postJSON(urlString, payload) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(payload);
            const url = new URL(urlString);
            const isHttps = url.protocol === 'https:';
            
            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            };

            const requestLib = isHttps ? https : http;
            const req = requestLib.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ success: true, status: res.statusCode });
                    } else {
                        resolve({ success: false, error: `HTTP ${res.statusCode}`, response: responseData });
                    }
                });
            });

            req.on('error', (error) => {
                logger.error('Webhook request error:', error);
                reject(error);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Webhook timeout'));
            });

            req.write(postData);
            req.end();
        });
    }
}

module.exports = WebhookService;
