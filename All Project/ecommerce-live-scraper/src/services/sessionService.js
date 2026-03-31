const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

const sessions = new Map(); // id -> sessionObject
const DATA_DIR = path.join(process.cwd(), 'data', 'comments');

function getSession(sessionId) {
    return sessions.get(sessionId);
}

function getAllSessions() {
    return Array.from(sessions.values());
}

function createSession(sessionId, url, config) {
    const session = {
        id: sessionId,
        url,
        status: 'starting',
        config,
        comments: [],
        startTime: Date.now(),
        lastActivity: Date.now(),
        lastStatus: 'starting',
        process: null
    };
    sessions.set(sessionId, session);
    return session;
}

function stopSession(sessionId) {
    const session = sessions.get(sessionId);
    if (!session || !session.process) return;
    try {
        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec(`taskkill /pid ${session.process.pid} /T /F`);
        } else {
            session.process.kill('SIGTERM');
        }
    } catch (e) {
        console.error(`Error stopping ${sessionId}:`, e.message);
    }
    session.status = 'stopped';
    saveSessionComments(sessionId);
}

function addCommentToSession(sessionId, comment) {
    const session = sessions.get(sessionId);
    if (!session) return;
    const exists = session.comments.some(c => c.username === comment.username && c.comment === comment.comment);
    if (!exists) {
        session.comments.push({
            timestamp: comment.timestamp || new Date().toISOString(),
            username: comment.username,
            comment: comment.comment,
            isInternal: comment.isInternal || false
        });
        if (session.comments.length > 5000) session.comments.shift();
    }
    session.lastActivity = Date.now();
    session.lastStatus = 'scraping';
}

function updateSessionStatus(sessionId, status) {
    const session = sessions.get(sessionId);
    if (session) {
        session.lastStatus = status;
        session.lastActivity = Date.now();
    }
}

async function saveSessionComments(sessionId) {
    const session = sessions.get(sessionId);
    if (!session || session.comments.length === 0) return;
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const date = new Date().toISOString().split('T')[0];
        const lowUrl = session.config.url.toLowerCase();
        let platformIdx = 'live';
        if (lowUrl.includes('tiktok')) platformIdx = 'tiktok';
        else if (lowUrl.includes('shopee')) platformIdx = 'shopee';
        else if (lowUrl.includes('lazada')) platformIdx = 'lazada';
        
        const filename = `history_${platformIdx}_${sessionId}_${date}.json`;
        const filepath = path.join(DATA_DIR, filename);
        await fs.writeFile(filepath, JSON.stringify(session.comments, null, 2), 'utf8');
    } catch (error) {
        console.error(`❌ Error saving ${sessionId}:`, error.message);
    }
}

module.exports = {
    getSession,
    getAllSessions,
    createSession,
    stopSession,
    addCommentToSession,
    updateSessionStatus,
    saveSessionComments
};
