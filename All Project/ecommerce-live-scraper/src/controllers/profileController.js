const fs = require('fs').promises;
const path = require('path');

const PROFILE_DIR = path.join(process.cwd(), 'user-profiles');

/**
 * List all saved profiles
 */
async function listProfiles(req, res) {
    try {
        await fs.mkdir(PROFILE_DIR, { recursive: true });
        const files = await fs.readdir(PROFILE_DIR, { withFileTypes: true });
        const profiles = files
            .filter(f => f.isDirectory())
            .map(f => ({
                name: f.name,
                path: path.join(PROFILE_DIR, f.name),
                created: new Date() // Placeholder for now
            }));
        res.json({ success: true, profiles });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

/**
 * Save a new profile (rename from a temporary path or just record it)
 */
async function saveProfile(req, res) {
    const { name, currentPath } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Profile name required' });
    
    try {
        const targetPath = path.join(PROFILE_DIR, name);
        if (currentPath && (await fs.stat(currentPath)).isDirectory()) {
            // If currentPath is provided, we copy/move it to the profiles dir
            // For now, let's assume we create its mapping
            await fs.mkdir(targetPath, { recursive: true });
        } else {
            await fs.mkdir(targetPath, { recursive: true });
        }
        res.json({ success: true, message: `Profile '${name}' saved`, path: targetPath });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

/**
 * Delete a profile
 */
async function deleteProfile(req, res) {
    const { name } = req.params;
    try {
        const targetPath = path.join(PROFILE_DIR, name);
        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec(`rmdir /s /q "${targetPath}"`);
        } else {
            await fs.rm(targetPath, { recursive: true, force: true });
        }
        res.json({ success: true, message: `Profile '${name}' deleted` });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

module.exports = {
    listProfiles,
    saveProfile,
    deleteProfile
};
