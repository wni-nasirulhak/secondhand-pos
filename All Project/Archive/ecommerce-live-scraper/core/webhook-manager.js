// Webhook Manager - Send notifications to Discord, Slack, Telegram, etc.
const https = require('https');
const http = require('http');

class WebhookManager {
  constructor(webhooks = []) {
    this.webhooks = webhooks;
  }

  async send(comment) {
    const results = [];
    
    for (const webhook of this.webhooks) {
      if (!webhook.enabled) continue;
      
      try {
        const result = await this.sendToWebhook(webhook, comment);
        results.push({ webhook: webhook.platform, success: result.success });
      } catch (error) {
        console.error(`[Webhook] Error sending to ${webhook.platform}:`, error.message);
        results.push({ webhook: webhook.platform, success: false, error: error.message });
      }
    }
    
    return results;
  }

  async sendToWebhook(webhook, comment) {
    switch (webhook.platform) {
      case 'discord':
        return await this.sendDiscord(webhook, comment);
      case 'slack':
        return await this.sendSlack(webhook, comment);
      case 'telegram':
        return await this.sendTelegram(webhook, comment);
      case 'custom':
        return await this.sendCustom(webhook, comment);
      default:
        throw new Error(`Unknown webhook platform: ${webhook.platform}`);
    }
  }

  async sendDiscord(webhook, comment) {
    const payload = {
      embeds: [{
        title: `💬 ${comment.platform.toUpperCase()} Live Comment`,
        description: comment.comment,
        color: this.getPlatformColor(comment.platform),
        fields: [
          { name: '👤 Username', value: comment.username, inline: true },
          { name: '⏰ Time', value: new Date(comment.timestamp).toLocaleString('th-TH'), inline: true }
        ],
        footer: { text: `E-commerce Live Scraper • ${comment.platform}` },
        timestamp: new Date().toISOString()
      }]
    };

    return await this.makeRequest(webhook.url, 'POST', payload);
  }

  async sendSlack(webhook, comment) {
    const payload = {
      text: `💬 ${comment.platform.toUpperCase()} Live Comment`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `💬 ${comment.platform.toUpperCase()} Live Comment` }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Username:*\n${comment.username}` },
            { type: 'mrkdwn', text: `*Time:*\n${new Date(comment.timestamp).toLocaleString('th-TH')}` }
          ]
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: comment.comment }
        }
      ]
    };

    return await this.makeRequest(webhook.url, 'POST', payload);
  }

  async sendTelegram(webhook, comment) {
    const text = `💬 *${comment.platform.toUpperCase()} Live Comment*\n\n` +
                 `👤 *User:* ${comment.username}\n` +
                 `⏰ *Time:* ${new Date(comment.timestamp).toLocaleString('th-TH')}\n\n` +
                 `💬 *Message:*\n${comment.comment}`;

    const payload = {
      chat_id: webhook.chatId,
      text: text,
      parse_mode: 'Markdown'
    };

    const url = `https://api.telegram.org/bot${webhook.token}/sendMessage`;
    return await this.makeRequest(url, 'POST', payload);
  }

  async sendCustom(webhook, comment) {
    return await this.makeRequest(webhook.url, 'POST', comment);
  }

  async makeRequest(url, method, body) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const postData = JSON.stringify(body);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const lib = isHttps ? https : http;
      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}` });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  getPlatformColor(platform) {
    const colors = {
      tiktok: 0xfe2c55,    // TikTok pink
      shopee: 0xee4d2d,    // Shopee orange
      lazada: 0x0f146d,    // Lazada blue
      default: 0x3b82f6    // Default blue
    };
    return colors[platform] || colors.default;
  }

  updateWebhooks(webhooks) {
    this.webhooks = webhooks;
  }
}

module.exports = WebhookManager;
