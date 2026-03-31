/**
 * Application Configuration Loader
 * Centralized configuration management
 */

require('dotenv').config();

module.exports = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    
    database: {
        path: process.env.DATABASE_PATH || './data/db/ecom_scraper.sqlite',
    },
    
    browser: {
        headless: process.env.HEADLESS === 'true',
        type: process.env.BROWSER_TYPE || 'chromium',
        timeout: 30000,
    },
    
    proxy: {
        enabled: process.env.PROXY_ENABLED === 'true',
        server: process.env.PROXY_SERVER || '',
        username: process.env.PROXY_USERNAME || '',
        password: process.env.PROXY_PASSWORD || '',
    },
    
    rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    },
    
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './data/logs/app.log',
    },
    
    webhooks: {
        discord: process.env.DISCORD_WEBHOOK_URL || '',
        telegram: {
            botToken: process.env.TELEGRAM_BOT_TOKEN || '',
            chatId: process.env.TELEGRAM_CHAT_ID || '',
        },
    },
    
    ai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.AI_MODEL || 'gpt-4',
    },
};
