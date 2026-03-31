/**
 * Helper utilities
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate UUID
 */
function generateId() {
    return uuidv4();
}

/**
 * Format date to ISO string
 */
function formatDate(date = new Date()) {
    return date.toISOString();
}

/**
 * Format date to human-readable string
 */
function formatDateHuman(date = new Date()) {
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * Parse URL and extract components
 */
function parseUrl(url) {
    try {
        const urlObj = new URL(url);
        return {
            protocol: urlObj.protocol,
            hostname: urlObj.hostname,
            pathname: urlObj.pathname,
            search: urlObj.search,
            hash: urlObj.hash,
            params: Object.fromEntries(urlObj.searchParams),
        };
    } catch (error) {
        return null;
    }
}

/**
 * Sanitize string (remove special characters, trim)
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random element from array
 */
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Chunk array into smaller arrays
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
function isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
}

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delayMs - Initial delay in ms
 */
async function retryAsync(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries) {
                const delay = delayMs * Math.pow(2, i);
                await sleep(delay);
            }
        }
    }
    throw lastError;
}

module.exports = {
    generateId,
    formatDate,
    formatDateHuman,
    parseUrl,
    sanitizeString,
    sleep,
    randomInt,
    randomElement,
    chunkArray,
    deepClone,
    isEmpty,
    retryAsync,
};
