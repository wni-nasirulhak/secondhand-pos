/**
 * Input validation utilities
 */

const Joi = require('joi');

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate TikTok URL
 */
function isTikTokUrl(url) {
    if (!isValidUrl(url)) return false;
    const hostname = new URL(url).hostname;
    return hostname.includes('tiktok.com');
}

/**
 * Validate Shopee URL
 */
function isShopeeUrl(url) {
    if (!isValidUrl(url)) return false;
    const hostname = new URL(url).hostname;
    return hostname.includes('shopee.co.th') || hostname.includes('shopee.com');
}

/**
 * Validate Lazada URL
 */
function isLazadaUrl(url) {
    if (!isValidUrl(url)) return false;
    const hostname = new URL(url).hostname;
    return hostname.includes('lazada.co.th') || hostname.includes('lazada.com');
}

/**
 * Detect platform from URL
 */
function detectPlatform(url) {
    if (!isValidUrl(url)) return null;
    
    if (isTikTokUrl(url)) return 'tiktok';
    if (isShopeeUrl(url)) return 'shopee';
    if (isLazadaUrl(url)) return 'lazada';
    
    return null;
}

/**
 * Joi schemas for common validations
 */
const schemas = {
    url: Joi.string().uri().required(),
    platform: Joi.string().valid('tiktok', 'shopee', 'lazada').required(),
    
    scrapeRequest: Joi.object({
        url: Joi.string().uri().required(),
        platform: Joi.string().valid('tiktok', 'shopee', 'lazada'),
        options: Joi.object().optional(),
    }),
    
    jobConfig: Joi.object({
        type: Joi.string().valid('product', 'shop', 'search', 'review', 'live', 'category').required(),
        platform: Joi.string().valid('tiktok', 'shopee', 'lazada').required(),
        targetUrl: Joi.string().uri().optional(),
        searchQuery: Joi.string().optional(),
        options: Joi.object().optional(),
    }),
};

/**
 * Validate data against schema
 */
function validate(data, schema) {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new Error(`Validation error: ${error.message}`);
    }
    return value;
}

module.exports = {
    isValidUrl,
    isTikTokUrl,
    isShopeeUrl,
    isLazadaUrl,
    detectPlatform,
    schemas,
    validate,
};
