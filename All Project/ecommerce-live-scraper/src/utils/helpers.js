const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = ['Timestamp', 'Username', 'Comment'];
    const rows = data.map(item => [
        item.timestamp,
        item.username,
        `"${(item.comment || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Ensures the legacy scraper_wrapper.js exists (for backward compatibility).
 * Modern scraping uses unified_wrapper.js instead.
 */
function ensureWrapperScript(wrapperPath, content) {
    try {
        if (!fs.existsSync(path.dirname(wrapperPath))) {
            fs.mkdirSync(path.dirname(wrapperPath), { recursive: true });
        }
        fs.writeFileSync(wrapperPath, content, 'utf8');
    } catch (e) {
        console.error('❌ Error creating wrapper script:', e.message);
    }
}

module.exports = {
    generateSessionId,
    convertToCSV,
    ensureWrapperScript
};
