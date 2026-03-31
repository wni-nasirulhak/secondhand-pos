/**
 * Data Management Routes (Comments, Downloads, Histories)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const logger = require('../../utils/logger').module('DataRoutes');

// Legacy: In-memory comments (for backward compatibility with TikTok Live)
let legacyComments = [];

/**
 * GET /api/data/comments
 * Get recent comments (legacy TikTok Live)
 */
router.get('/comments', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const limitedComments = legacyComments.slice(-limit).reverse();

    res.json({
        success: true,
        comments: limitedComments,
        total: legacyComments.length
    });
});

/**
 * GET /api/data/download
 * Download comments as JSON or CSV
 */
router.get('/download', (req, res) => {
    const format = req.query.format || 'json';

    try {
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=comments_${Date.now()}.json`);
            res.send(JSON.stringify(legacyComments, null, 2));
        } else if (format === 'csv') {
            const csv = convertToCSV(legacyComments);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=comments_${Date.now()}.csv`);
            res.send('\ufeff' + csv); // BOM for UTF-8
        } else {
            res.status(400).json({ error: 'Invalid format. Use json or csv.' });
        }
    } catch (error) {
        logger.error('Error downloading:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/data/comment-histories
 * List comment history files
 */
router.get('/comment-histories', async (req, res) => {
    try {
        const dataDir = path.join(__dirname, '../../../data/comments');
        
        if (!fsSync.existsSync(dataDir)) {
            return res.json({ success: true, histories: [] });
        }

        const files = await fs.readdir(dataDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        const histories = await Promise.all(jsonFiles.map(async (filename) => {
            const filePath = path.join(dataDir, filename);
            const stats = await fs.stat(filePath);
            
            let count = 0;
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);
                count = Array.isArray(data) ? data.length : 0;
            } catch (e) {
                logger.error(`Error reading ${filename}:`, e);
            }

            const match = filename.match(/comments_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.json/);
            let date = 'Unknown';
            let time = 'Unknown';
            
            if (match) {
                date = match[1];
                time = match[2].replace(/-/g, ':');
            }

            return {
                filename,
                date,
                time,
                count,
                size: stats.size,
                created: stats.birthtime
            };
        }));

        histories.sort((a, b) => new Date(b.created) - new Date(a.created));

        res.json({ success: true, histories });
    } catch (error) {
        logger.error('Error listing histories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/data/comment-histories/:filename
 * View specific history file
 */
router.get('/comment-histories/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../../data/comments', filename);

        if (!fsSync.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'ไม่พบไฟล์' });
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const comments = JSON.parse(content);

        res.json({ success: true, comments });
    } catch (error) {
        logger.error('Error reading history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/data/comment-histories/:filename/download
 * Download history file
 */
router.get('/comment-histories/:filename/download', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../../data/comments', filename);

        if (!fsSync.existsSync(filePath)) {
            return res.status(404).send('ไม่พบไฟล์');
        }

        res.download(filePath, filename);
    } catch (error) {
        logger.error('Error downloading history:', error);
        res.status(500).send('เกิดข้อผิดพลาด');
    }
});

/**
 * DELETE /api/data/comment-histories/:filename
 * Delete history file
 */
router.delete('/comment-histories/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../../data/comments', filename);

        if (!fsSync.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'ไม่พบไฟล์' });
        }

        await fs.unlink(filePath);
        res.json({ success: true, message: 'ลบสำเร็จ' });
    } catch (error) {
        logger.error('Error deleting history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Helper: Convert comments to CSV
 */
function convertToCSV(comments) {
    if (comments.length === 0) return '';

    const headers = ['Timestamp', 'Username', 'Comment'];
    const rows = comments.map(c => [
        new Date(c.timestamp).toLocaleString('th-TH'),
        c.username || '',
        (c.comment || '').replace(/"/g, '""') // Escape quotes
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
}

// Export for use in TikTok Live scraper
module.exports = router;
module.exports.legacyComments = legacyComments;
module.exports.addComment = (comment) => {
    legacyComments.push(comment);
};
module.exports.clearComments = () => {
    legacyComments = [];
};
