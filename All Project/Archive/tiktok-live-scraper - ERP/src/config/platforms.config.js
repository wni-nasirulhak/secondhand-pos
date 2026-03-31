/**
 * Platform-Specific Configuration
 */

module.exports = {
    tiktok: {
        enabled: true,
        displayName: 'TikTok Shop',
        icon: '🎵',
        baseUrl: 'https://www.tiktok.com',
        storageStatePath: process.env.TIKTOK_STORAGE_STATE_PATH || './data/tiktok_storage_state.json',
        chromeProfilePath: process.env.TIKTOK_CHROME_PROFILE_PATH || '',
        rateLimit: {
            requestsPerMinute: 30,
            pageLoadDelay: [3000, 8000],
            sessionMaxPages: 100,
        },
        supportedFeatures: ['live', 'product', 'shop', 'search'],
    },
    
    shopee: {
        enabled: true,
        displayName: 'Shopee',
        icon: '🛒',
        baseUrl: 'https://shopee.co.th',
        storageStatePath: process.env.SHOPEE_STORAGE_STATE_PATH || './data/shopee_storage_state.json',
        rateLimit: {
            requestsPerMinute: 40,
            pageLoadDelay: [2000, 5000],
            sessionMaxPages: 200,
        },
        supportedFeatures: ['product', 'shop', 'search', 'review', 'flash_sale'],
    },
    
    lazada: {
        enabled: true,
        displayName: 'Lazada',
        icon: '🏪',
        baseUrl: 'https://www.lazada.co.th',
        storageStatePath: process.env.LAZADA_STORAGE_STATE_PATH || './data/lazada_storage_state.json',
        rateLimit: {
            requestsPerMinute: 20,
            pageLoadDelay: [3000, 10000],
            sessionMaxPages: 80,
        },
        supportedFeatures: ['product', 'shop', 'search', 'review', 'campaign'],
    },
};
