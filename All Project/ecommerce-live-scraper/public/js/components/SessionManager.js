/**
 * SessionManager Component (Phase 3)
 * Manages the list of active/stopped scraping sessions.
 */
export class SessionManager {
    constructor(container, api, options = {}) {
        this.container = container;
        this.api = api;
        this.options = options;
        this.sessions = [];
        this.activeSessionId = null;
        this.onSwitch = options.onSwitch || (() => {});
        this.onStop = options.onStop || (() => {});
        this.onDelete = options.onDelete || (() => {});
        this.render();
    }

    setSessions(sessions) {
        this.sessions = sessions;
        // If no active session, pick the first one
        if (!this.activeSessionId && sessions.length > 0) {
            this.activeSessionId = sessions[sessions.length - 1].id;
            this.onSwitch(this.activeSessionId);
        }
        this.update();
    }

    render() {
        this.container.innerHTML = `
            <div class="session-manager">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 18px;">📱 รายการเซสชัน (Sessions)</h3>
                    <span class="badge" id="session-count">0 Sessions</span>
                </div>
                <div id="session-list" class="session-list-grid" style="display: flex; flex-direction: column; gap: 8px;">
                    <!-- Session items will be inserted here -->
                </div>
            </div>
        `;
    }

    update() {
        const listContainer = this.container.querySelector('#session-list');
        const countBadge = this.container.querySelector('#session-count');
        const wrapper = document.getElementById('session-manager-wrapper');

        if (!listContainer || !countBadge) return;

        countBadge.textContent = `${this.sessions.length} Sessions`;

        // Show/Hide the whole card based on sessions count
        if (this.sessions.length > 0) {
            if (wrapper) wrapper.style.display = 'block';
        } else {
            if (wrapper) wrapper.style.display = 'none';
        }

        if (this.sessions.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary); background: rgba(255,255,255,0.05); border-radius: 8px;">
                    ไม่มีเซสชันที่กำลังทำงาน
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';
        this.sessions.forEach(session => {
            const isActive = session.id === this.activeSessionId;
            const item = document.createElement('div');
            item.className = `session-item ${isActive ? 'active' : ''}`;
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: ${isActive ? 'rgba(108, 92, 231, 0.2)' : 'rgba(255,255,255,0.05)'};
                border: 1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'};
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
            `;

            // Platform Icon
            const platform = this.detectPlatform(session.url);
            const iconClass = this.getPlatformIcon(platform);

            item.innerHTML = `
                <div style="font-size: 20px; width: 30px; text-align: center;">
                    <i class="${iconClass}" style="color: ${isActive ? 'var(--accent-primary)' : 'inherit'}"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${session.url}
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 8px; align-items: center;">
                        <span style="color: ${session.status === 'running' ? '#00d97e' : '#f46a6a'}">
                            ● ${session.status === 'running' ? 'Live' : 'Stopped'}
                        </span>
                        <span>💬 ${session.commentsCount}</span>
                        <span>⏱️ ${this.formatTime(session.startTime)}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 4px;">
                    ${session.status !== 'running' ? `
                        <button class="btn-delete" title="Remove Session" style="
                            background: rgba(255, 255, 255, 0.05);
                            color: var(--text-secondary);
                            border: none;
                            width: 28px;
                            height: 28px;
                            border-radius: 6px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">
                            <i class="fas fa-trash-alt" style="font-size: 10px;"></i>
                        </button>
                    ` : ''}
                    <button class="btn-stop" title="Stop Session" style="
                        background: rgba(244, 106, 106, 0.1);
                        color: #f46a6a;
                        border: none;
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        opacity: ${session.status === 'running' ? 1 : 0.3};
                        pointer-events: ${session.status === 'running' ? 'auto' : 'none'};
                    ">
                        <i class="fas fa-stop" style="font-size: 10px;"></i>
                    </button>
                </div>
            `;

            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-stop')) {
                    this.onStop(session.id);
                } else if (e.target.closest('.btn-delete')) {
                    if (confirm('⚠️ ต้องการลบเซสชันนี้ออกจากรายการหรือไม่?')) {
                        this.onDelete(session.id);
                    }
                } else {
                    this.activeSessionId = session.id;
                    this.onSwitch(session.id);
                    this.update();
                }
            });

            listContainer.appendChild(item);
        });
    }

    detectPlatform(url = '') {
        const low = url.toLowerCase();
        if (low.includes('tiktok')) return 'tiktok';
        if (low.includes('shopee')) return 'shopee';
        if (low.includes('lazada')) return 'lazada';
        if (low.includes('facebook')) return 'facebook';
        if (low.includes('instagram')) return 'instagram';
        if (low.includes('youtube')) return 'youtube';
        return 'live';
    }

    getPlatformIcon(platform) {
        switch (platform) {
            case 'tiktok': return 'fab fa-tiktok';
            case 'shopee': return 'fas fa-shopping-bag';
            case 'lazada': return 'fas fa-heart';
            case 'facebook': return 'fab fa-facebook';
            case 'instagram': return 'fab fa-instagram';
            case 'youtube': return 'fab fa-youtube';
            default: return 'fas fa-bolt';
        }
    }

    formatTime(startTime) {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        return `${Math.floor(diff / 3600)}h`;
    }
}
