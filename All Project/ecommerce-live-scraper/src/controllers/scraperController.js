const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

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

module.exports = {
    checkCookies,
    importCookies
};
