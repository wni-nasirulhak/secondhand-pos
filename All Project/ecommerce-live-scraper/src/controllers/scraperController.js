const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const exportHelper = require('../utils/exportHelper');
const sessionService = require('../services/sessionService');

async function checkCookies(req, res) {
    try {
        let platform = (req.query.platform || '').toLowerCase().trim();
        if (!platform || platform === 'undefined') platform = 'tiktok';
        
        const storageStatePath = path.join(process.cwd(), 'storage-states', `${platform}.json`);
        if (!fsSync.existsSync(storageStatePath)) {
            return res.json({ exists: false });
        }
        
        const content = await fs.readFile(storageStatePath, 'utf-8');
        const storageState = JSON.parse(content);
        const cookies = storageState.cookies || [];
        
        if (cookies.length === 0) return res.json({ exists: false });
        
        const now = Date.now() / 1000;
        let validCount = 0;
        cookies.forEach(c => { if (!c.expires || c.expires === -1 || c.expires > now) validCount++; });
        
        res.json({
            exists: true,
            valid: validCount > 0,
            cookieCount: cookies.length,
            validCount
        });
    } catch (error) {
        res.json({ exists: false, error: error.message });
    }
}

async function importCookies(req, res) {
    try {
        const { cookiesJson, platform: pName } = req.body;
        const platform = pName || 'tiktok';
        let cookies = JSON.parse(cookiesJson);
        if (!Array.isArray(cookies) && cookies.cookies) cookies = cookies.cookies;

        const storageState = { cookies, origins: [] };
        const STATE_FILE = path.join(process.cwd(), 'storage-states', `${platform}.json`);
        
        if (!fsSync.existsSync(path.dirname(STATE_FILE))) {
            fsSync.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
        }
        await fs.writeFile(STATE_FILE, JSON.stringify(storageState, null, 2), 'utf8');
        
        res.json({ success: true, message: `บันทึกคุกกี้สำหรับ ${platform} สำเร็จ!` });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

async function exportToExcel(req, res) {
    try {
        const { sessionId } = req.params;
        const session = sessionService.getSession(sessionId);
        
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        const buffer = exportHelper.generateExcelBuffer(session.comments);
        if (!buffer) {
            return res.status(500).json({ success: false, error: 'Failed to generate Excel' });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=comments_${sessionId}.xlsx`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function exportHistoryToExcel(req, res) {
    try {
        const { filename } = req.params;
        const DATA_DIR = path.join(process.cwd(), 'data', 'comments');
        const filepath = path.join(DATA_DIR, filename);

        if (!fsSync.existsSync(filepath)) {
            return res.status(404).json({ success: false, error: 'History file not found' });
        }

        const content = await fs.readFile(filepath, 'utf8');
        const comments = JSON.parse(content);

        const buffer = exportHelper.generateExcelBuffer(comments);
        if (!buffer) {
            return res.status(500).json({ success: false, error: 'Failed to generate Excel' });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename.replace('.json', '.xlsx')}`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    checkCookies,
    importCookies,
    exportToExcel,
    exportHistoryToExcel
};
