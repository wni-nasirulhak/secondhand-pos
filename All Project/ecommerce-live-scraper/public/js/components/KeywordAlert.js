// Component สำหรับ Keyword Alerts
export class KeywordAlert {
    constructor(container, storage, callbacks = {}) {
        this.container = container;
        this.storage = storage;
        this.callbacks = callbacks;
        this.keywords = this.loadKeywords();
        this.alerts = [];
        this.vipUsers = [];
        this.vipOnlyNotify = false;
        this.render();
        this.attachEvents();
    }

    loadKeywords() {
        return this.storage.get('keywords', []);
    }

    saveKeywords() {
        this.storage.set('keywords', this.keywords);
    }

    render() {
        this.container.innerHTML = `
            <div class="keyword-alert stack-y gap-md">
                <div class="keyword-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">🔔 แจ้งเตือนคำสำคัญ (V2)</h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button id="btn-request-notif" class="btn btn-secondary btn-small" style="font-size: 11px; display: none; background: rgba(37, 244, 238, 0.1); border-color: #25f4ee; color: #25f4ee;">
                            🔓 เปิดแจ้งเตือน Desktop
                        </button>
                        <label class="toggle-switch">
                            <input type="checkbox" id="keyword-enabled" ${this.keywords.length > 0 ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="alert-config-card" style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <div class="keyword-input-group" style="display: flex; gap: 10px; margin-bottom: 12px;">
                        <input 
                            type="text" 
                            id="keyword-input" 
                            placeholder="พิมพ์คำสำคัญ (เช่น ราคา, พร้อมส่ง, CF)"
                            autocomplete="off"
                            style="flex: 1; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 14px;"
                        />
                        <button id="btn-add-keyword" class="btn btn-primary" style="padding: 10px 20px;">➕ เพิ่ม</button>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center;">
                        <select id="alert-sound-select" style="padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; cursor: pointer;">
                            <option value="success">🎵 Success Tone (Default)</option>
                            <option value="alert">🚨 Urgent Alert</option>
                            <option value="digital">👾 Digital Chime</option>
                            <option value="bell">🔔 Crystal Bell</option>
                            <option value="none">🚫 ปิดเสียง</option>
                        </select>
                        <button id="btn-test-sound" class="btn btn-secondary" style="padding: 10px 15px; background: var(--bg-primary); border: 1px solid var(--border-color);">🔊 ทดสอบ</button>
                    </div>
                </div>

                <div id="keyword-list" class="keyword-list" style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 50px; padding: 12px; background: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color); margin-bottom: 15px;">
                    ${this.keywords.length === 0 ? `
                        <div class="empty-keywords" style="width: 100%; text-align: center; color: var(--text-secondary); font-size: 13px; padding: 10px;">
                            <span style="font-size: 24px; display: block; margin-bottom: 5px;">🔕</span>
                            ยังไม่มีคำสำคัญที่ติดตาม...
                        </div>
                    ` : this.keywords.map((keyword, index) => `
                        <div class="keyword-item" data-index="${index}" style="background: var(--accent-primary); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 8px; animation: fadeIn 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <span class="keyword-text" style="font-weight: 600;">${this.escapeHtml(keyword)}</span>
                            <button class="btn-remove-keyword" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; line-height: 1;">×</button>
                        </div>
                    `).join('')}
                </div>

                <div class="keyword-stats" style="padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: var(--text-secondary); font-size: 12px;">📊 ติดตาม ${this.keywords.length} คำสำคัญ | 🔔 แจ้งเตือน ${this.alerts.length} ครั้ง</small>
                    <button id="btn-clear-alerts" class="btn btn-secondary btn-small" style="font-size: 11px; padding: 5px 10px; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary);">🗑️ ล้างประวัติ</button>
                </div>

                <!-- Alert History -->
                <div class="alert-history" id="alert-history" style="display: none; margin-top: 15px; border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; background: var(--bg-secondary);">
                    <h4 style="margin: 0 0 12px 0; font-size: 14px; color: var(--accent-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">📜 รายการแจ้งเตือนล่าสุด</h4>
                    <div id="alert-list" class="alert-list stack-y gap-sm" style="max-height: 200px; overflow-y: auto; padding-right: 5px;"></div>
                </div>
            </div>
        `;

        this.checkNotificationPermission();
    }

    attachEvents() {
        const input = this.container.querySelector('#keyword-input');
        const btnAdd = this.container.querySelector('#btn-add-keyword');
        const keywordList = this.container.querySelector('#keyword-list');
        const enabledToggle = this.container.querySelector('#keyword-enabled');
        const btnTestSound = this.container.querySelector('#btn-test-sound');
        const btnRequestNotif = this.container.querySelector('#btn-request-notif');
        const btnClearAlerts = this.container.querySelector('#btn-clear-alerts');
        const soundSelect = this.container.querySelector('#alert-sound-select');

        // Restore sound selection
        if (soundSelect) {
            soundSelect.value = this.storage.get('alert_sound', 'success');
            soundSelect.addEventListener('change', (e) => {
                this.storage.set('alert_sound', e.target.value);
            });
        }

        // Test sound
        btnTestSound?.addEventListener('click', () => this.playAlertSound(true));

        // Request notification permission
        btnRequestNotif?.addEventListener('click', () => this.requestNotificationPermission());

        // Clear alerts
        btnClearAlerts?.addEventListener('click', () => {
            if (confirm('ล้างประวัติการแจ้งเตือนทั้งหมด?')) {
                this.clearAlerts();
            }
        });

        // อื่นๆ (Original logic)
        btnAdd?.addEventListener('click', () => this.handleAddKeyword());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddKeyword();
            }
        });

        keywordList?.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.btn-remove-keyword');
            if (removeBtn) {
                const item = removeBtn.closest('.keyword-item');
                const index = parseInt(item.dataset.index);
                this.handleRemoveKeyword(index);
            }
        });

        enabledToggle?.addEventListener('change', (e) => {
            if (this.callbacks.onToggle) {
                this.callbacks.onToggle(e.target.checked);
            }
        });
    }

    checkNotificationPermission() {
        const btn = this.container.querySelector('#btn-request-notif');
        if (!btn) return;

        if (Notification.permission === 'default') {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
    }

    async requestNotificationPermission() {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification('🚀 แจ้งเตือน Keyword เปิดใช้งานแล้ว!', {
                body: 'คุณจะได้รับการแจ้งเตือนเมื่อมีคอมเมนต์ที่ตรงกับคีย์เวิร์ด',
                icon: '/favicon.ico'
            });
        }
        this.checkNotificationPermission();
    }

    handleAddKeyword() {
        const input = this.container.querySelector('#keyword-input');
        const keyword = input.value.trim();

        if (!keyword) {
            return;
        }

        // ตรวจสอบว่าซ้ำหรือไม่
        if (this.keywords.includes(keyword)) {
            alert('⚠️ คำสำคัญนี้มีอยู่แล้ว');
            input.focus();
            return;
        }

        this.keywords.push(keyword);
        this.saveKeywords();
        input.value = '';
        
        this.render();
        this.attachEvents();

        if (this.callbacks.onAdd) {
            this.callbacks.onAdd(keyword);
        }
    }

    handleRemoveKeyword(index) {
        const keyword = this.keywords[index];
        this.keywords.splice(index, 1);
        this.saveKeywords();
        
        this.render();
        this.attachEvents();

        if (this.callbacks.onRemove) {
            this.callbacks.onRemove(keyword);
        }
    }

    setVipUsers(users) {
        if (typeof users === 'string') {
            this.vipUsers = users.split(',').map(u => u.trim().toLowerCase().replace(/^@/, '')).filter(u => u);
        } else if (Array.isArray(users)) {
            this.vipUsers = users.map(u => u.trim().toLowerCase().replace(/^@/, ''));
        }
    }

    setVipOnlyNotify(enabled) {
        this.vipOnlyNotify = !!enabled;
    }

    isVip(username) {
        if (!username || !this.vipUsers || this.vipUsers.length === 0) return false;
        const cleanName = username.trim().toLowerCase().replace(/^@/, '');
        return this.vipUsers.includes(cleanName);
    }

    checkComment(comment) {
        const enabled = this.container.querySelector('#keyword-enabled')?.checked;
        if (!enabled) return false;

        // VIP Override Logic
        const isVipUser = this.isVip(comment.username);
        if (this.vipOnlyNotify && !isVipUser) {
            return false;
        }

        if (this.keywords.length === 0) {
            return false;
        }

        const text = comment.comment.toLowerCase();
        const username = comment.username.toLowerCase();

        for (const keyword of this.keywords) {
            const keywordLower = keyword.toLowerCase();
            if (text.includes(keywordLower) || username.includes(keywordLower)) {
                this.triggerAlert(comment, keyword);
                return true;
            }
        }

        return false;
    }

    triggerAlert(comment, keyword) {
        const alert = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            keyword,
            comment
        };

        this.alerts.push(alert);

        // แสดง notification
        if (this.callbacks.onAlert) {
            this.callbacks.onAlert(alert);
        }

        // Browser Notification
        if (Notification.permission === 'granted') {
            new Notification(`🔔 พบคีย์เวิร์ด: ${keyword}`, {
                body: `@${comment.username}: ${comment.comment}`,
                icon: '/favicon.ico',
                silent: true // We play our own sound
            });
        }

        // เล่นเสียง (ถ้ามี)
        this.playAlertSound();

        // อัปเดตประวัติ
        this.updateAlertHistory();
    }

    playAlertSound(isTest = false) {
        try {
            const soundType = this.storage.get('alert_sound', 'success');
            if (soundType === 'none' && !isTest) return;

            const sounds = {
                success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzJ+zPDTfjAGIHLD79yMPwoXZLnq7KVSEgxMpODuumEcBjiS1/LMe',
                alert: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YT9vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19vT19',
                digital: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YAgAAABvT19vT19vT19vT19vT19vT19vT19vT19vT19',
                bell: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzJ+zPDTfjAGIHLD79yMPwoXZLnq7KVSEgxMpODuumEcBjiS1/LMe'
            };

            const audio = new Audio(sounds[soundType] || sounds.success);
            audio.volume = 0.4;
            audio.play().catch(() => {});
        } catch (error) {
            console.error('Sound error:', error);
        }
    }

    updateAlertHistory() {
        const historyContainer = this.container.querySelector('#alert-history');
        const alertList = this.container.querySelector('#alert-list');

        if (this.alerts.length === 0) {
            historyContainer.style.display = 'none';
            return;
        }

        historyContainer.style.display = 'block';

        // แสดง 10 รายการล่าสุด
        const recentAlerts = this.alerts.slice(-10).reverse();

        alertList.innerHTML = recentAlerts.map(alert => `
            <div class="alert-item">
                <div class="alert-keyword">🔔 "${this.escapeHtml(alert.keyword)}"</div>
                <div class="alert-comment">
                    <span class="alert-username">👤 ${this.escapeHtml(alert.comment.username)}</span>
                    <span class="alert-text">${this.escapeHtml(alert.comment.comment)}</span>
                </div>
                <div class="alert-time">
                    <small>${this.formatTime(alert.timestamp)}</small>
                </div>
            </div>
        `).join('');

        // อัปเดต stats
        const stats = this.container.querySelector('.keyword-stats small');
        if (stats) {
            stats.textContent = `📊 ติดตาม ${this.keywords.length} คำสำคัญ | 🔔 แจ้งเตือนแล้ว ${this.alerts.length} ครั้ง`;
        }
    }

    clearAlerts() {
        this.alerts = [];
        this.updateAlertHistory();
    }

    getKeywords() {
        return this.keywords;
    }

    isEnabled() {
        return this.container.querySelector('#keyword-enabled')?.checked || false;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff} วินาทีที่แล้ว`;
        if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
        
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
