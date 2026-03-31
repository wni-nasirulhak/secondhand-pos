// Component สำหรับ Keyword Alerts
export class KeywordAlert {
    constructor(container, storage, callbacks = {}) {
        this.container = container;
        this.storage = storage;
        this.callbacks = callbacks;
        this.keywords = this.loadKeywords();
        this.alerts = [];
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
            <div class="keyword-alert">
                <div class="keyword-header">
                    <h3>🔔 แจ้งเตือนคำสำคัญ</h3>
                    <label class="toggle-switch">
                        <input type="checkbox" id="keyword-enabled" ${this.keywords.length > 0 ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="keyword-input-group">
                    <input 
                        type="text" 
                        id="keyword-input" 
                        placeholder="พิมพ์คำสำคัญ แล้วกด Enter"
                        autocomplete="off"
                    />
                    <button id="btn-add-keyword" class="btn btn-primary">
                        <span class="btn-icon">➕</span>
                        เพิ่ม
                    </button>
                </div>

                <div id="keyword-list" class="keyword-list">
                    ${this.keywords.length === 0 ? `
                        <div class="empty-keywords">
                            <span class="empty-icon">🔕</span>
                            <p>ยังไม่มีคำสำคัญที่ต้องการแจ้งเตือน</p>
                            <small>เพิ่มคำสำคัญเพื่อรับการแจ้งเตือนเมื่อมีคอมเมนต์ที่ตรงกัน</small>
                        </div>
                    ` : this.keywords.map((keyword, index) => `
                        <div class="keyword-item" data-index="${index}">
                            <span class="keyword-text">${this.escapeHtml(keyword)}</span>
                            <button class="btn-remove-keyword" title="ลบ">
                                <span>✖️</span>
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="keyword-stats">
                    <small>📊 ติดตาม ${this.keywords.length} คำสำคัญ | 🔔 แจ้งเตือนแล้ว ${this.alerts.length} ครั้ง</small>
                </div>

                <!-- Alert History -->
                <div class="alert-history" id="alert-history" style="display: none;">
                    <h4>📜 ประวัติการแจ้งเตือน</h4>
                    <div id="alert-list" class="alert-list"></div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        const input = this.container.querySelector('#keyword-input');
        const btnAdd = this.container.querySelector('#btn-add-keyword');
        const keywordList = this.container.querySelector('#keyword-list');
        const enabledToggle = this.container.querySelector('#keyword-enabled');

        // เพิ่มคำสำคัญ
        btnAdd?.addEventListener('click', () => this.handleAddKeyword());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddKeyword();
            }
        });

        // ลบคำสำคัญ (Event delegation)
        keywordList?.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.btn-remove-keyword');
            if (removeBtn) {
                const item = removeBtn.closest('.keyword-item');
                const index = parseInt(item.dataset.index);
                this.handleRemoveKeyword(index);
            }
        });

        // Toggle เปิด/ปิด
        enabledToggle?.addEventListener('change', (e) => {
            if (this.callbacks.onToggle) {
                this.callbacks.onToggle(e.target.checked);
            }
        });
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

    checkComment(comment) {
        const enabled = this.container.querySelector('#keyword-enabled')?.checked;
        if (!enabled || this.keywords.length === 0) {
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

        // เล่นเสียง (ถ้ามี)
        this.playAlertSound();

        // อัปเดตประวัติ
        this.updateAlertHistory();
    }

    playAlertSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzJ+zPDTfjAGIHLD79yMPwoXZLnq7KVSEgxMpODuumEcBjiS1/LMe ');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // ไม่สามารถเล่นเสียงได้ (บางเบราว์เซอร์ต้องมี user interaction ก่อน)
            });
        } catch (error) {
            // Ignore sound errors
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
