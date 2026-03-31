const https = require('https');
const http = require('http');

async function sendWebhook(webhook, data, retries = 3) {
    let lastError = null;
    
    // Add VIP flag to data for formatting (Internal)
    const isVip = data.isVip || false;
    
    for (let i = 0; i < retries; i++) {
        try {
            const { platform } = webhook;
            let result;
            
            if (platform === 'discord') result = await sendDiscordWebhook(webhook, data);
            else if (platform === 'slack') result = await sendSlackWebhook(webhook, data);
            else if (platform === 'telegram') result = await sendTelegramMessage(webhook, data);
            else if (platform === 'custom') result = await sendCustomWebhook(webhook, data);
            else result = { success: false, error: 'Unknown platform' };

            if (result.success) return result;
            lastError = result.error;
            
            // Wait before retry (exponential backoff: 1s, 2s, 4s...)
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        } catch (error) {
            lastError = error.message;
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }
    
    return { success: false, error: `Failed after ${retries} attempts: ${lastError}` };
}

async function sendDiscordWebhook(webhook, data) {
    return new Promise((resolve, reject) => {
        const payload = {
            embeds: [{
                title: data.isVip ? '👑 VIP Live Comment' : '💬 Live Comment',
                description: data.comment,
                color: data.isVip ? 0xf1c40f : 0xfe2c55,
                fields: [
                    { name: data.isVip ? '👤 VIP Username' : '👤 Username', value: data.username, inline: true },
                    { name: '⏰ Time', value: new Date(data.timestamp).toLocaleString('th-TH'), inline: true }
                ],
                footer: { text: 'Ecom Scraper Hub' },
                timestamp: new Date().toISOString()
            }]
        };
        const postData = JSON.stringify(payload);
        const url = new URL(webhook.url);
        const req = https.request({
            hostname: url.hostname, port: 443, path: url.pathname, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, res => resolve(res.statusCode >= 200 && res.statusCode < 300 ? { success: true } : { success: false, error: `Discord returned ${res.statusCode}` }));
        req.on('error', reject); req.write(postData); req.end();
    });
}

async function sendSlackWebhook(webhook, data) {
    return new Promise((resolve, reject) => {
        const payload = {
            text: data.isVip ? '👑 VIP Live Comment' : '💬 Live Comment',
            blocks: [
                { type: 'header', text: { type: 'plain_text', text: data.isVip ? '👑 VIP Live Comment' : '💬 Live Comment' } },
                { type: 'section', fields: [
                    { type: 'mrkdwn', text: `*${data.isVip ? 'VIP User' : 'Username'}:*\n${data.username}` },
                    { type: 'mrkdwn', text: `*Time:*\n${new Date(data.timestamp).toLocaleString('th-TH')}` }
                ]},
                { type: 'section', text: { type: 'mrkdwn', text: data.comment } }
            ]
        };
        const postData = JSON.stringify(payload);
        const url = new URL(webhook.url);
        const req = https.request({
            hostname: url.hostname, port: 443, path: url.pathname, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, res => resolve(res.statusCode === 200 ? { success: true } : { success: false, error: `Slack returned ${res.statusCode}` }));
        req.on('error', reject); req.write(postData); req.end();
    });
}

async function sendTelegramMessage(webhook, data) {
    return new Promise((resolve, reject) => {
        const payload = {
            chat_id: webhook.chatId,
            text: `${data.isVip ? '👑 *VIP Live Comment*' : '💬 *Live Comment*'}\n\n👤 *User:* ${data.username}${data.isVip ? ' ⭐' : ''}\n⏰ *Time:* ${new Date(data.timestamp).toLocaleString('th-TH')}\n\n💬 *Message:*\n${data.comment}`,
            parse_mode: 'Markdown'
        };
        const postData = JSON.stringify(payload);
        const req = https.request({
            hostname: 'api.telegram.org', port: 443,
            path: `/bot${webhook.token}/sendMessage`, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, res => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                const response = JSON.parse(responseData);
                resolve(response.ok ? { success: true } : { success: false, error: response.description || 'Telegram error' });
            });
        });
        req.on('error', reject); req.write(postData); req.end();
    });
}

async function sendCustomWebhook(webhook, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const url = new URL(webhook.url);
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;
        const req = lib.request({
            hostname: url.hostname, port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
        }, res => resolve(res.statusCode >= 200 && res.statusCode < 300 ? { success: true } : { success: false, error: `Custom webhook returned ${res.statusCode}` }));
        req.on('error', reject); req.write(postData); req.end();
    });
}

module.exports = { sendWebhook };
