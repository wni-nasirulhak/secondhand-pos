/**
 * Auth/Cookie Management Routes
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const logger = require('../../utils/logger').module('AuthRoutes');

/**
 * GET /api/auth/check-cookies
 * Check if cookies exist and are valid
 */
router.get('/check-cookies', async (req, res) => {
    try {
        const storageStatePath = path.join(__dirname, '../../../storage-states/tiktok.json');
        
        logger.debug('Checking cookies at:', storageStatePath);
        
        if (!fsSync.existsSync(storageStatePath)) {
            logger.debug('Cookie file not found');
            return res.json({ exists: false });
        }
        
        const storageState = JSON.parse(await fs.readFile(storageStatePath, 'utf-8'));
        const cookies = storageState.cookies || [];
        
        logger.debug(`Found ${cookies.length} cookies`);
        
        if (cookies.length === 0) {
            return res.json({ exists: false });
        }
        
        // Check cookie validity
        const now = Date.now() / 1000;
        let validCount = 0;
        let oldestExpiry = Infinity;
        
        cookies.forEach(cookie => {
            const expires = cookie.expires || -1;
            if (expires === -1 || expires > now) {
                validCount++;
                if (expires !== -1 && expires < oldestExpiry) {
                    oldestExpiry = expires;
                }
            }
        });
        
        const isValid = validCount > 0 && validCount / cookies.length > 0.5;
        
        let expiryDate = null;
        if (oldestExpiry !== Infinity) {
            expiryDate = new Date(oldestExpiry * 1000).toLocaleString('th-TH');
        }
        
        res.json({
            exists: true,
            valid: isValid,
            cookieCount: cookies.length,
            validCount: validCount,
            expiryDate: expiryDate
        });
    } catch (error) {
        logger.error('Error checking cookies:', error);
        res.json({ exists: false, error: error.message });
    }
});

/**
 * POST /api/auth/import-cookies
 * Import cookies from JSON
 */
router.post('/import-cookies', async (req, res) => {
    try {
        const { cookiesJson } = req.body;
        if (!cookiesJson) {
            return res.json({ success: false, error: 'กรุณาใส่ JSON คุกกี้' });
        }

        let cookies;
        try {
            cookies = JSON.parse(cookiesJson);
        } catch (e) {
            return res.json({ success: false, error: 'รูปแบบ JSON ไม่ถูกต้อง' });
        }

        // Handle EditThisCookie format
        if (!Array.isArray(cookies) && cookies.cookies) {
            cookies = cookies.cookies;
        }

        if (!Array.isArray(cookies)) {
            return res.json({ success: false, error: 'คุกกี้ต้องเป็น Array ของ Object' });
        }

        // Normalize cookies for Playwright
        const normalizedCookies = cookies.map(c => {
            let sameSite = (c.sameSite || 'Lax').toLowerCase();
            if (sameSite === 'no_restriction' || sameSite === 'none') {
                sameSite = 'None';
            } else if (sameSite === 'strict') {
                sameSite = 'Strict';
            } else {
                sameSite = 'Lax';
            }
            return {
                name: c.name,
                value: c.value,
                domain: c.domain || '.tiktok.com',
                path: c.path || '/',
                expires: c.expirationDate || c.expires || -1,
                httpOnly: c.httpOnly || false,
                secure: c.secure || false,
                sameSite: sameSite
            };
        });

        const storageState = {
            cookies: normalizedCookies,
            origins: []
        };

        // Save to both locations
        const STATE_FILE_1 = path.join(__dirname, '../../../user-data/tiktok_state.json');
        const STATE_FILE_2 = path.join(__dirname, '../../../storage-states/tiktok.json');
        
        // Ensure directories exist
        [STATE_FILE_1, STATE_FILE_2].forEach(file => {
            const dir = path.dirname(file);
            if (!fsSync.existsSync(dir)) {
                fsSync.mkdirSync(dir, { recursive: true });
            }
        });

        // Save both files
        await Promise.all([
            fs.writeFile(STATE_FILE_1, JSON.stringify(storageState, null, 2), 'utf8'),
            fs.writeFile(STATE_FILE_2, JSON.stringify(storageState, null, 2), 'utf8')
        ]);

        res.json({ 
            success: true, 
            message: 'บันทึกคุกกี้สำเร็จ! ตอนนี้คุณสามารถใช้โหมด StorageState ได้แล้ว' 
        });

    } catch (error) {
        logger.error('Error importing cookies:', error);
        res.json({ success: false, error: error.message });
    }
});

/**
 * GET /api/auth/find-chrome-path
 * Find Chrome user data path
 */
router.get('/find-chrome-path', (req, res) => {
    try {
        const os = require('os');
        const username = os.userInfo().username;
        let chromePath = '';

        if (process.platform === 'win32') {
            chromePath = `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data`;
        } else if (process.platform === 'darwin') {
            chromePath = `/Users/${username}/Library/Application Support/Google/Chrome`;
        } else {
            chromePath = `/home/${username}/.config/google-chrome`;
        }

        const exists = fsSync.existsSync(chromePath);

        // Find all profiles
        const profiles = [];
        if (exists) {
            try {
                const items = fsSync.readdirSync(chromePath);
                
                if (items.includes('Default')) {
                    const defaultPath = path.join(chromePath, 'Default');
                    profiles.push({
                        name: 'Default',
                        path: defaultPath,
                        fullPath: defaultPath
                    });
                }

                items.forEach(item => {
                    if (item.startsWith('Profile ')) {
                        const profilePath = path.join(chromePath, item);
                        profiles.push({
                            name: item,
                            path: profilePath,
                            fullPath: profilePath
                        });
                    }
                });
            } catch (err) {
                logger.error('Error reading profiles:', err);
            }
        }

        res.json({
            success: true,
            path: chromePath,
            exists: exists,
            platform: process.platform,
            username: username,
            profiles: profiles
        });
    } catch (error) {
        logger.error('Error finding Chrome path:', error);
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;
