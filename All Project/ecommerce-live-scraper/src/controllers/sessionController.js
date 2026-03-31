const sessionService = require('../services/sessionService');
const { generateSessionId } = require('../utils/helpers');
const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');
const { sendWebhook } = require('../services/webhookService');

function isQuestion(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    const thaiQuestions = ['ไหม', 'หรือ', 'อะไร', 'ทำไม', 'เมื่อไหร่', 'ที่ไหน', 'ยังไง', 'คือ', 'มั้ย', 'หรอ', 'เหรอ', 'ไร'];
    const englishQuestions = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should'];
    if (lower.includes('?')) return true;
    if (thaiQuestions.some(word => lower.includes(word))) return true;
    const words = lower.trim().split(/\s+/);
    if (words.length > 0 && englishQuestions.includes(words[0])) return true;
    return false;
}

function containsKeywords(text, keywords) {
    if (!text || !keywords || keywords.length === 0) return false;
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k.toLowerCase().trim()));
}

function isVip(username, viplist) {
    if (!username || !viplist) return false;
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    
    let vipArray = [];
    if (typeof viplist === 'string') {
        vipArray = viplist.split(',').map(v => v.trim().toLowerCase().replace(/^@/, ''));
    } else if (Array.isArray(viplist)) {
        vipArray = viplist.map(v => v.trim().toLowerCase().replace(/^@/, ''));
    }
    
    return vipArray.includes(cleanUser);
}

async function startScraper(req, res) {
    try {
        let { url, duration, interval, headless, authMode, stealth, chromePath, browser, mode, replyCooldown, replyOnQuestion, replyTemplates, blacklist, whitelist, viplist, webhooks, aiWebhookUrl, hostUsername } = req.body;
        
        const sessionId = generateSessionId();
        const session = sessionService.createSession(sessionId, url, { url, duration, interval, headless, authMode, stealth, chromePath, browser, mode, replyCooldown, replyOnQuestion, replyTemplates, blacklist, whitelist, viplist, webhooks, aiWebhookUrl, hostUsername });
        
        let wrapperPath = path.join(process.cwd(), 'scripts', 'unified_wrapper.js');
        const lowUrl = url.toLowerCase();
        
        const args = [
            wrapperPath,
            '--url', url, '--duration', duration, '--interval', interval,
            '--browser', browser || 'chromium', '--mode', mode || 'read'
        ];
        if (headless === true || headless === 'true') args.push('--headless');
        if (stealth === 'enabled' || stealth === true) args.push('--stealth');
        if (authMode === 'chrome' && chromePath) { args.push('--chrome-profile'); args.push(chromePath); }

        const scraperProcess = spawn('node', args, { stdio: ['ignore', 'pipe', 'pipe'] });
        session.process = scraperProcess;
        session.status = 'running';

        const rl = readline.createInterface({ input: scraperProcess.stdout, terminal: false });
        rl.on('line', (line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
            let commentData = null;
            if (trimmedLine.startsWith('COMMENT:')) {
                try { commentData = JSON.parse(trimmedLine.substring(8)); } catch (e) {}
            }
            if (commentData && commentData.username && commentData.comment) {
                // Enrich data
                commentData.isQuestion = isQuestion(commentData.comment);
                commentData.isVip = isVip(commentData.username, viplist);
                
                // Get keywords from storage if needed or just use what we have in keywords
                // For now, keywords are passed in keywordAlert config but let's see where they are
                const keywordsArr = (session.config.keywords || []);
                commentData.hasKeywords = containsKeywords(commentData.comment, keywordsArr) || containsKeywords(commentData.username, keywordsArr);

                sessionService.addCommentToSession(sessionId, commentData);

                // Webhook Filtering Logic
                if (webhooks && webhooks.length > 0 && !commentData.isInternal) {
                    webhooks.forEach(wh => {
                        if (!wh.enabled) return;
                        
                        const triggers = wh.triggers || ['all'];
                        let shouldSend = false;

                        if (triggers.includes('all')) shouldSend = true;
                        if (!shouldSend && triggers.includes('questions') && commentData.isQuestion) shouldSend = true;
                        if (!shouldSend && triggers.includes('keywords') && commentData.hasKeywords) shouldSend = true;
                        if (!shouldSend && triggers.includes('vip') && commentData.isVip) shouldSend = true;

                        if (shouldSend) {
                            sendWebhook(wh, commentData).catch(e => {
                                console.error(`❌ Webhook [${wh.name}] Error:`, e.message);
                                // Future: Add to error history
                            });
                        }
                    });
                }
            }
        });

        res.json({ success: true, message: 'Scraper session started', sessionId, config: session.config });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

async function stopScraper(req, res) {
    const { sessionId } = req.body;
    if (sessionId) {
        sessionService.stopSession(sessionId);
        res.json({ success: true, message: `Session ${sessionId} stopped` });
    } else {
        sessionService.getAllSessions().forEach(s => sessionService.stopSession(s.id));
        res.json({ success: true, message: 'All sessions stopped' });
    }
}

async function listSessions(req, res) {
    const list = sessionService.getAllSessions().map(s => ({
        id: s.id, url: s.url, status: s.status, startTime: s.startTime,
        commentsCount: s.comments.length, config: s.config
    }));
    res.json({ success: true, sessions: list });
}

async function getComments(req, res) {
    const { sessionId } = req.query;
    const limit = parseInt(req.query.limit) || 100;
    const session = sessionId ? sessionService.getSession(sessionId) : sessionService.getAllSessions().pop();
    if (!session) return res.json({ success: true, comments: [], total: 0 });
    const limitedComments = session.comments.slice(-limit).reverse();
    res.json({ success: true, comments: limitedComments, total: session.comments.length, sessionId: session.id });
}

module.exports = {
    startScraper,
    stopScraper,
    listSessions,
    getComments
};
