// Main application
import { API } from './utils/api.js';
import { Storage, PresetManager as PresetManagerUtil, RecentURLsManager } from './utils/storage.js';
import { ConfigForm } from './components/ConfigFormNew.js';
import { ControlPanel } from './components/ControlPanel.js';
import { CommentList } from './components/CommentList.js';
import { StatusBar } from './components/StatusBar.js';
import { PresetManager } from './components/PresetManager.js';
import { KeywordAlert } from './components/KeywordAlert.js';
import { CommentHistory } from './components/CommentHistory.js';
import { StatsDashboard } from './components/StatsDashboard.js';
import { UserListManager } from './components/UserListManager.js';
import { ErrorHandler } from './components/ErrorHandler.js';
import { WebhookManager } from './components/WebhookManager.js';
import { AIWebhookManager } from './components/AIWebhookManager.js';
import { SessionManager } from './components/SessionManager.js';
import { MockRulesEditor } from './components/MockRulesEditor.js';

class App {
    constructor() {
        this.api = new API();
        this.storage = new Storage();
        this.presetManager = new PresetManagerUtil(this.storage);
        this.recentURLsManager = new RecentURLsManager(this.storage);
        this.pollInterval = null;
        this.statusInterval = null;
        this.activeSessionId = null;
        this.init();
    }

    init() {
        // สร้าง components
        this.configForm = new ConfigForm(
            document.getElementById('config-container'),
            this.recentURLsManager,
            this.api,
            this.storage
        );

        // โหลด config ล่าสุด
        this.loadLastConfig();

        // Auto-save config
        this.configForm.onConfigChange = (config) => {
            this.storage.set('last_config', config);
        };

        this.statusBar = new StatusBar(
            document.getElementById('status-container')
        );

        this.controlPanel = new ControlPanel(
            document.getElementById('control-container'),
            {
                onStart: () => this.handleStart(),
                onStop: () => this.handleStop(),
                onDownload: (format) => this.handleDownload(format),
                onClear: () => this.handleClear()
            }
        );

        this.commentList = new CommentList(
            document.getElementById('comments-container')
        );

        // Preset Manager
        this.presetManagerComponent = new PresetManager(
            document.getElementById('preset-container'),
            this.presetManager,
            {
                onSave: (name) => this.handleSavePreset(name),
                onLoad: (config) => this.handleLoadPreset(config),
                onDelete: (id) => this.handleDeletePreset(id)
            }
        );

        // Keyword Alert
        this.keywordAlert = new KeywordAlert(
            document.getElementById('keyword-container'),
            this.storage,
            {
                onAdd: (keyword) => this.showNotification(`➕ เพิ่มคำสำคัญ: "${keyword}"`, 'success'),
                onRemove: (keyword) => this.showNotification(`➖ ลบคำสำคัญ: "${keyword}"`, 'info'),
                onToggle: (enabled) => {
                    this.showNotification(
                        enabled ? '🔔 เปิดการแจ้งเตือนแล้ว' : '🔕 ปิดการแจ้งเตือนแล้ว',
                        'info'
                    );
                },
                onAlert: (alert) => this.handleKeywordAlert(alert)
            }
        );

        // Comment History
        this.commentHistory = new CommentHistory(
            document.getElementById('history-container'),
            this.api
        );

        // Stats Dashboard (Phase 2)
        this.statsDashboard = new StatsDashboard(
            document.getElementById('stats-container')
        );

        // User List Manager (Phase 2)
        this.userListManager = new UserListManager(
            document.getElementById('users-container'),
            this.storage
        );

        // Error Handler (Phase 2)
        this.errorHandler = new ErrorHandler(
            document.getElementById('errors-container')
        );

        // Webhook Manager (Phase 3)
        this.webhookManager = new WebhookManager(
            document.getElementById('webhook-container'),
            this.storage,
            this.api
        );

        // AI Webhook Manager (Phase 3 - AI Reply)
        const aiWebhookContainer = document.getElementById('ai-webhook-container');
        if (aiWebhookContainer) {
            this.aiWebhookManager = new AIWebhookManager(
                aiWebhookContainer,
                this.storage,
                this.api
            );
        }

        // Session Manager (Phase 3)
        this.sessionManager = new SessionManager(
            document.getElementById('session-container'),
            this.api,
            {
                onSwitch: (sessionId) => this.handleSwitchSession(sessionId),
                onStop: (sessionId) => this.handleStop(sessionId),
                onDelete: (sessionId) => this.handleDeleteSession(sessionId)
            }
        );

        // Mock Rules Editor (Phase 3)
        const mockRulesContainer = document.getElementById('mock-rules-container');
        if (mockRulesContainer) {
            this.mockRulesEditor = new MockRulesEditor(
                mockRulesContainer,
                this.api
            );
        }

        // โหลดสถานะเริ่มต้น
        this.checkStatus();
        this.startStatusPolling();
    }

    loadLastConfig() {
        const lastConfig = this.storage.get('last_config');
        if (lastConfig) {
            this.configForm.setConfig(lastConfig);
        }
    }

    handleSavePreset(name) {
        const config = this.configForm.getConfig();
        this.presetManager.save(name, config);
        this.showNotification(`💾 บันทึกการตั้งค่า "${name}" แล้ว`, 'success');
    }

    handleLoadPreset(config) {
        this.configForm.setConfig(config);
        this.showNotification('📂 โหลดการตั้งค่าสำเร็จ!', 'success');
    }

    handleDeletePreset(id) {
        this.showNotification('🗑️ ลบการตั้งค่าแล้ว', 'info');
    }

    handleKeywordAlert(alert) {
        const message = `🔔 พบคำสำคัญ "${alert.keyword}"\n👤 ${alert.comment.username}: ${alert.comment.comment}`;
        this.showNotification(message, 'warning', 5000);
        
        // แสดง browser notification (ถ้าอนุญาต)
        this.showBrowserNotification(alert);
    }

    async showBrowserNotification(alert) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(`🔔 พบคำสำคัญ: ${alert.keyword}`, {
                body: `${alert.comment.username}: ${alert.comment.comment}`,
                icon: '/favicon.ico',
                tag: 'keyword-alert',
                requireInteraction: false
            });
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showBrowserNotification(alert);
            }
        }
    }

    async handleStart() {
        // Validate config
        const validation = this.configForm.validate();
        if (!validation.valid) {
            alert('❌ ' + validation.errors.join('\n'));
            return;
        }

        const config = this.configForm.getConfig();
        
        // Add user lists from UserListManager
        if (this.userListManager) {
            config.blacklist = this.userListManager.blacklist;
            config.whitelist = this.userListManager.whitelist;
            config.viplist = this.userListManager.viplist;
        }
        
        // Add webhooks from WebhookManager
        if (this.webhookManager) {
            config.webhooks = this.webhookManager.getEnabledWebhooks();
        }

        // Add AI Webhook URL from AIWebhookManager
        if (this.aiWebhookManager) {
            const aiUrl = this.aiWebhookManager.getAIWebhookUrl();
            if (aiUrl) {
                config.aiWebhookUrl = aiUrl;
                console.log('🤖 AI Webhook URL set:', aiUrl);
            }
        }

        try {
            // บันทึก URL ลง recent URLs
            this.recentURLsManager.add(config.url);
            
            // บันทึก config ล่าสุด
            this.storage.set('last_config', config);

            // เริ่ม scraper
            const result = await this.api.startScraper(config);
            
            if (result.success) {
                const sessionId = result.sessionId;
                this.activeSessionId = sessionId;
                
                // Refresh sessions and switch UI
                await this.checkStatus();
                
                this.controlPanel.setRunning(true);
                this.statusBar.start();
                this.statusBar.setUrl(config.url);
                
                // ล้าง alerts เก่า
                this.keywordAlert.clearAlerts();
                
                // เริ่ม polling comments
                this.startPolling();
                
                this.showNotification('✅ เริ่มดึงคอมเมนต์แล้ว!', 'success');
            } else {
                throw new Error(result.error || 'ไม่สามารถเริ่มการทำงานได้');
            }
        } catch (error) {
            console.error('Error starting scraper:', error);
            this.statusBar.error(error.message);
            this.showNotification('❌ ' + error.message, 'error');
        }
    }

    async handleStop(sessionId = null) {
        try {
            const sid = sessionId || this.activeSessionId;
            const result = await this.api.stopScraper(sid);
            if (result.success) {
                this.showNotification(`🛑 หยุดเซสชัน ${sid || ''} แล้ว`, 'info');
                await this.checkStatus();
                if (sid === this.activeSessionId) {
                    this.statusBar.setRunning(false);
                    this.controlPanel.setRunning(false);
                }
            } else {
                throw new Error(result.error || 'ไม่สามารถหยุดการทำงานได้');
            }
        } catch (error) {
            console.error('Error stopping scraper:', error);
            this.showNotification('❌ ' + error.message, 'error');
        }
    }

    async handleDeleteSession(sessionId) {
        try {
            const result = await this.api.deleteSession(sessionId);
            if (result.success) {
                this.showNotification('🗑️ ลบเซสชันสำเร็จ', 'info');
                
                // If we deleted the active session, clear the view
                if (sessionId === this.activeSessionId) {
                    this.activeSessionId = null;
                    this.commentList.clear();
                    this.statusBar.setUrl('-');
                    this.statusBar.setRunning(false);
                    this.controlPanel.setRunning(false);
                }
                
                await this.checkStatus();
            } else {
                throw new Error(result.error || 'ไม่สามารถลบเซสชันได้');
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            this.showNotification('❌ ' + error.message, 'error');
        }
    }

    handleSwitchSession(sessionId) {
        this.activeSessionId = sessionId;
        this.commentList.clear();
        this.pollComments();
        
        const session = this.sessionManager.sessions.find(s => s.id === sessionId);
        if (session) {
            this.statusBar.setUrl(session.url);
            this.statusBar.setRunning(session.status === 'running');
            this.statusBar.updateStats(session.commentsCount);
        }
    }

    startStatusPolling() {
        if (this.statusInterval) clearInterval(this.statusInterval);
        this.statusInterval = setInterval(() => this.checkStatus(), 5000);
    }

    handleDownload(format) {
        const comments = this.commentList.getComments();
        
        if (comments.length === 0) {
            this.showNotification('⚠️ ยังไม่มีคอมเมนต์ให้ดาวน์โหลด', 'warning');
            return;
        }

        if (format === 'json') {
            this.downloadJSON(comments);
        } else if (format === 'csv') {
            this.downloadCSV(comments);
        }

        this.showNotification(`💾 ดาวน์โหลด ${format.toUpperCase()} สำเร็จ!`, 'success');
    }

    handleClear() {
        if (confirm('⚠️ ต้องการล้างคอมเมนต์ทั้งหมดหรือไม่?')) {
            this.commentList.clear();
            this.showNotification('🗑️ ล้างคอมเมนต์แล้ว', 'info');
        }
    }

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(() => this.pollComments(), 2000);
        this.pollComments();
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    async pollComments() {
        if (!this.activeSessionId) return;

        try {
            const result = await this.api.getComments(100, this.activeSessionId);
            
            if (result.success && result.comments) {
                // อัปเดตรายการคอมเมนต์สำหรับเซสชันนี้
                this.commentList.setComments(result.comments);
                
                // อัปเดต stats
                this.statusBar.updateStats(result.total);
                
                // อัปเดต stats dashboard
                if (this.statsDashboard) {
                    this.statsDashboard.updateStats(result.comments);
                }

                // ตรวจสอบ keyword alerts
                if (this.keywordAlert) {
                    result.comments.forEach(comment => {
                        this.keywordAlert.checkComment(comment);
                    });
                }
            }
        } catch (error) {
            console.error('Error polling comments:', error);
        }
    }

    async checkStatus() {
        try {
            const result = await this.api.getSessions();
            if (result.success) {
                this.sessionManager.setSessions(result.sessions);
                
                // Keep polling if there are any sessions active
                if (result.sessions.length > 0 && !this.pollInterval) {
                   this.startPolling();
                }

                if (this.activeSessionId) {
                    const active = result.sessions.find(s => s.id === this.activeSessionId);
                    if (active) {
                        this.statusBar.setRunning(active.status === 'running', active.startTime);
                        this.controlPanel.setRunning(active.status === 'running');
                        this.statusBar.setUrl(active.url);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    }

    downloadJSON(comments) {
        const dataStr = JSON.stringify(comments, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tiktok_comments_${this.getTimestamp()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    downloadCSV(comments) {
        const headers = ['Timestamp', 'Username', 'Comment'];
        const rows = comments.map(c => [
            c.timestamp,
            c.username,
            c.comment.replace(/"/g, '""') // Escape quotes
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }); // BOM for UTF-8
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tiktok_comments_${this.getTimestamp()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    }

    showNotification(message, type = 'info', duration = 3000) {
        // สร้าง notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // แสดงข้อความแบบ multiline
        const lines = message.split('\n');
        notification.innerHTML = lines.map(line => `<div>${this.escapeHtml(line)}</div>`).join('');
        
        document.body.appendChild(notification);
        
        // แสดง notification
        setTimeout(() => notification.classList.add('show'), 10);
        
        // ซ่อนและลบ
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// เริ่มแอพ
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
