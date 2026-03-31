// Webhook Manager Component
export class WebhookManager {
    constructor(container, storage = null, api = null) {
        this.container = container;
        this.storage = storage;
        this.api = api;
        this.webhooks = this.loadWebhooks();
        this.render();
    }

    loadWebhooks() {
        if (!this.storage) return [];
        return this.storage.get('webhooks') || [];
    }

    saveWebhooks() {
        if (this.storage) {
            this.storage.set('webhooks', this.webhooks);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="webhook-manager">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">🔗</span>
                            Webhook Integration
                        </h3>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: var(--text-secondary);">
                            ส่งคอมเมนต์ไปยัง Discord, Slack, Telegram หรือ Custom Webhook
                        </p>
                    </div>
                    <button id="btn-add-webhook" class="btn btn-small" style="background: #00d97e;">
                        ➕ เพิ่ม Webhook
                    </button>
                </div>

                <!-- Webhook Platforms Guide -->
                <div style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 20px;
                ">
                    <h4 style="margin-bottom: 12px;">💡 แพลตฟอร์มที่รองรับ</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="padding: 10px; background: var(--bg-input); border-radius: 8px;">
                            <strong style="color: #5865F2;">💬 Discord</strong>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-secondary);">
                                Server Settings → Integrations → Webhooks
                            </p>
                        </div>
                        <div style="padding: 10px; background: var(--bg-input); border-radius: 8px;">
                            <strong style="color: #4A154B;">📢 Slack</strong>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-secondary);">
                                Apps → Incoming Webhooks → Add to Slack
                            </p>
                        </div>
                        <div style="padding: 10px; background: var(--bg-input); border-radius: 8px;">
                            <strong style="color: #0088cc;">✈️ Telegram</strong>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-secondary);">
                                สร้าง Bot ผ่าน @BotFather → ใช้ Bot Token
                            </p>
                        </div>
                        <div style="padding: 10px; background: var(--bg-input); border-radius: 8px;">
                            <strong style="color: #25f4ee;">🔧 Custom</strong>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-secondary);">
                                ใส่ Webhook URL ของคุณเอง (POST JSON)
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Webhook List -->
                <div id="webhook-list"></div>

                <!-- Add Webhook Modal (Hidden by default) -->
                <div id="webhook-modal" style="display: none;"></div>
            </div>
        `;

        this.attachEvents();
        this.updateWebhookList();
    }

    attachEvents() {
        const btnAdd = this.container.querySelector('#btn-add-webhook');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.showAddWebhookModal());
        }
    }

    showAddWebhookModal() {
        const modal = this.container.querySelector('#webhook-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            ">
                <div style="
                    background: var(--bg-primary);
                    border-radius: 16px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 0;
                ">
                    <!-- Header -->
                    <div style="
                        padding: 20px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        position: sticky;
                        top: 0;
                        background: var(--bg-primary);
                        z-index: 1;
                    ">
                        <h3 style="margin: 0;">➕ เพิ่ม Webhook ใหม่</h3>
                        <button id="close-modal" style="
                            background: transparent;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: var(--text-secondary);
                        ">×</button>
                    </div>

                    <!-- Form -->
                    <div style="padding: 20px;">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                                📛 ชื่อ Webhook
                            </label>
                            <input 
                                type="text" 
                                id="webhook-name" 
                                placeholder="เช่น Discord Notifications"
                                style="
                                    width: 100%;
                                    padding: 10px;
                                    background: var(--bg-input);
                                    border: 1px solid var(--border-color);
                                    border-radius: 8px;
                                    color: var(--text-primary);
                                "
                            />
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                                🔧 Platform
                            </label>
                            <select id="webhook-platform" style="
                                width: 100%;
                                padding: 10px;
                                background: var(--bg-input);
                                border: 1px solid var(--border-color);
                                border-radius: 8px;
                                color: var(--text-primary);
                            ">
                                <option value="discord">💬 Discord</option>
                                <option value="slack">📢 Slack</option>
                                <option value="telegram">✈️ Telegram</option>
                                <option value="custom">🔧 Custom (POST JSON)</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                                🔗 Webhook URL
                            </label>
                            <textarea 
                                id="webhook-url" 
                                placeholder="https://discord.com/api/webhooks/..."
                                style="
                                    width: 100%;
                                    height: 80px;
                                    padding: 10px;
                                    background: var(--bg-input);
                                    border: 1px solid var(--border-color);
                                    border-radius: 8px;
                                    color: var(--text-primary);
                                    font-family: monospace;
                                    font-size: 13px;
                                    resize: vertical;
                                "
                            ></textarea>
                            <small id="webhook-url-hint" style="display: block; margin-top: 5px; color: var(--text-secondary);">
                                ใส่ Discord Webhook URL
                            </small>
                        </div>

                        <!-- Telegram specific -->
                        <div id="telegram-fields" style="display: none; margin-bottom: 20px;">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                                    🤖 Bot Token
                                </label>
                                <input 
                                    type="text" 
                                    id="telegram-token" 
                                    placeholder="123456:ABC-DEF..."
                                    style="
                                        width: 100%;
                                        padding: 10px;
                                        background: var(--bg-input);
                                        border: 1px solid var(--border-color);
                                        border-radius: 8px;
                                        color: var(--text-primary);
                                        font-family: monospace;
                                    "
                                />
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                                    💬 Chat ID
                                </label>
                                <input 
                                    type="text" 
                                    id="telegram-chatid" 
                                    placeholder="-1001234567890"
                                    style="
                                        width: 100%;
                                        padding: 10px;
                                        background: var(--bg-input);
                                        border: 1px solid var(--border-color);
                                        border-radius: 8px;
                                        color: var(--text-primary);
                                        font-family: monospace;
                                    "
                                />
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="webhook-enabled" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span style="font-weight: 600;">✅ เปิดใช้งาน</span>
                            </label>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                                🔔 ส่งเมื่อไหร่
                            </label>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" class="webhook-trigger" value="all" checked style="width: 16px; height: 16px; cursor: pointer;">
                                    <span>💬 คอมเมนต์ทั้งหมด</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" class="webhook-trigger" value="questions" style="width: 16px; height: 16px; cursor: pointer;">
                                    <span>❓ เฉพาะคำถาม</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" class="webhook-trigger" value="keywords" style="width: 16px; height: 16px; cursor: pointer;">
                                    <span>🔑 มีคำสำคัญ (ตาม Keyword Alert)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="
                        padding: 20px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        gap: 10px;
                        justify-content: flex-end;
                        position: sticky;
                        bottom: 0;
                        background: var(--bg-primary);
                    ">
                        <button id="btn-test-webhook" class="btn btn-small" style="background: #fdcb6e;">
                            🧪 ทดสอบ
                        </button>
                        <button id="btn-cancel-webhook" class="btn btn-small" style="background: var(--bg-input); border: 1px solid var(--border-color);">
                            ยกเลิก
                        </button>
                        <button id="btn-save-webhook" class="btn btn-small" style="background: #00d97e;">
                            💾 บันทึก
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';

        // Attach modal events
        this.attachModalEvents();
    }

    attachModalEvents() {
        const modal = this.container.querySelector('#webhook-modal');
        if (!modal) return;

        // Close button
        const closeBtn = modal.querySelector('#close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Cancel button
        const cancelBtn = modal.querySelector('#btn-cancel-webhook');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Platform change
        const platformSelect = modal.querySelector('#webhook-platform');
        if (platformSelect) {
            platformSelect.addEventListener('change', (e) => {
                this.updatePlatformFields(e.target.value);
            });
        }

        // Test button
        const testBtn = modal.querySelector('#btn-test-webhook');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testWebhook());
        }

        // Save button
        const saveBtn = modal.querySelector('#btn-save-webhook');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveNewWebhook());
        }

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    updatePlatformFields(platform) {
        const modal = this.container.querySelector('#webhook-modal');
        if (!modal) return;

        const urlInput = modal.querySelector('#webhook-url');
        const urlHint = modal.querySelector('#webhook-url-hint');
        const telegramFields = modal.querySelector('#telegram-fields');

        if (platform === 'discord') {
            urlInput.placeholder = 'https://discord.com/api/webhooks/...';
            urlHint.textContent = 'ใส่ Discord Webhook URL';
            telegramFields.style.display = 'none';
        } else if (platform === 'slack') {
            urlInput.placeholder = 'https://hooks.slack.com/services/...';
            urlHint.textContent = 'ใส่ Slack Webhook URL';
            telegramFields.style.display = 'none';
        } else if (platform === 'telegram') {
            urlInput.style.display = 'none';
            urlHint.style.display = 'none';
            telegramFields.style.display = 'block';
        } else if (platform === 'custom') {
            urlInput.placeholder = 'https://your-server.com/webhook';
            urlHint.textContent = 'ใส่ URL ที่รับ POST JSON';
            telegramFields.style.display = 'none';
        }
    }

    async testWebhook() {
        const modal = this.container.querySelector('#webhook-modal');
        if (!modal) return;

        const config = this.getWebhookConfig(modal);
        if (!config) return;

        const testBtn = modal.querySelector('#btn-test-webhook');
        testBtn.disabled = true;
        testBtn.textContent = '⏳ กำลังทดสอบ...';

        try {
            const response = await fetch('/api/webhook/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    webhook: config,
                    testMessage: {
                        username: 'TestUser',
                        comment: 'นี่คือข้อความทดสอบ webhook! 🚀',
                        timestamp: new Date().toISOString()
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('✅ ทดสอบสำเร็จ! ตรวจสอบที่ปลายทาง', 'success');
            } else {
                throw new Error(result.error || 'ทดสอบล้มเหลว');
            }
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = '🧪 ทดสอบ';
        }
    }

    getWebhookConfig(modal) {
        const name = modal.querySelector('#webhook-name').value.trim();
        const platform = modal.querySelector('#webhook-platform').value;
        const url = modal.querySelector('#webhook-url').value.trim();
        const enabled = modal.querySelector('#webhook-enabled').checked;

        const triggers = Array.from(modal.querySelectorAll('.webhook-trigger:checked'))
            .map(cb => cb.value);

        if (!name) {
            this.showNotification('❌ กรุณาใส่ชื่อ Webhook', 'error');
            return null;
        }

        let config = {
            id: Date.now(),
            name,
            platform,
            enabled,
            triggers
        };

        if (platform === 'telegram') {
            const token = modal.querySelector('#telegram-token').value.trim();
            const chatId = modal.querySelector('#telegram-chatid').value.trim();

            if (!token || !chatId) {
                this.showNotification('❌ กรุณาใส่ Bot Token และ Chat ID', 'error');
                return null;
            }

            config.token = token;
            config.chatId = chatId;
        } else {
            if (!url) {
                this.showNotification('❌ กรุณาใส่ Webhook URL', 'error');
                return null;
            }
            config.url = url;
        }

        return config;
    }

    saveNewWebhook() {
        const modal = this.container.querySelector('#webhook-modal');
        if (!modal) return;

        const config = this.getWebhookConfig(modal);
        if (!config) return;

        this.webhooks.push(config);
        this.saveWebhooks();
        this.updateWebhookList();
        this.closeModal();

        this.showNotification('✅ บันทึก Webhook สำเร็จ!', 'success');
    }

    closeModal() {
        const modal = this.container.querySelector('#webhook-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.innerHTML = '';
        }
    }

    updateWebhookList() {
        const listEl = this.container.querySelector('#webhook-list');
        if (!listEl) return;

        if (this.webhooks.length === 0) {
            listEl.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 60px 20px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    color: var(--text-secondary);
                ">
                    <div style="font-size: 64px; margin-bottom: 15px;">🔗</div>
                    <h3 style="margin-bottom: 10px; color: var(--text-primary);">ยังไม่มี Webhook</h3>
                    <p>คลิกปุ่ม "➕ เพิ่ม Webhook" เพื่อเริ่มต้น</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = this.webhooks.map(webhook => {
            const platformIcons = {
                discord: '💬',
                slack: '📢',
                telegram: '✈️',
                custom: '🔧'
            };

            const platformColors = {
                discord: '#5865F2',
                slack: '#4A154B',
                telegram: '#0088cc',
                custom: '#25f4ee'
            };

            const icon = platformIcons[webhook.platform] || '🔗';
            const color = platformColors[webhook.platform] || '#25f4ee';

            return `
                <div class="webhook-card" style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-left: 4px solid ${color};
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    transition: all 0.3s;
                    ${webhook.enabled ? '' : 'opacity: 0.6;'}
                " onmouseover="this.style.borderColor='${color}'" onmouseout="this.style.borderColor='var(--border-color)'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <span style="font-size: 24px;">${icon}</span>
                                <h4 style="margin: 0; color: var(--text-primary);">${this.escapeHtml(webhook.name)}</h4>
                                ${webhook.enabled ? 
                                    '<span style="background: #00d97e20; color: #00d97e; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">✅ เปิดใช้งาน</span>' :
                                    '<span style="background: #f46a6a20; color: #f46a6a; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">⏸️ ปิด</span>'
                                }
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); font-family: monospace;">
                                ${webhook.platform === 'telegram' ? 
                                    `Chat ID: ${webhook.chatId}` :
                                    webhook.url.substring(0, 50) + '...'
                                }
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button 
                                class="btn-toggle-webhook" 
                                data-id="${webhook.id}"
                                style="
                                    padding: 6px 12px;
                                    background: ${webhook.enabled ? '#f46a6a' : '#00d97e'};
                                    border: none;
                                    border-radius: 6px;
                                    color: white;
                                    cursor: pointer;
                                    font-size: 12px;
                                "
                                title="${webhook.enabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}"
                            >
                                ${webhook.enabled ? '⏸️' : '▶️'}
                            </button>
                            <button 
                                class="btn-delete-webhook" 
                                data-id="${webhook.id}"
                                style="
                                    padding: 6px 12px;
                                    background: #f46a6a;
                                    border: none;
                                    border-radius: 6px;
                                    color: white;
                                    cursor: pointer;
                                    font-size: 12px;
                                "
                                title="ลบ"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>

                    <div style="
                        padding: 10px;
                        background: var(--bg-input);
                        border-radius: 8px;
                        font-size: 13px;
                    ">
                        <strong>🔔 ส่งเมื่อ:</strong>
                        <div style="margin-top: 5px; display: flex; gap: 8px; flex-wrap: wrap;">
                            ${webhook.triggers.map(t => {
                                const labels = {
                                    all: '💬 ทั้งหมด',
                                    questions: '❓ คำถาม',
                                    keywords: '🔑 คำสำคัญ'
                                };
                                return `<span style="background: ${color}20; color: ${color}; padding: 3px 10px; border-radius: 12px; font-size: 12px;">${labels[t]}</span>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach events
        listEl.querySelectorAll('.btn-toggle-webhook').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.toggleWebhook(id);
            });
        });

        listEl.querySelectorAll('.btn-delete-webhook').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.deleteWebhook(id);
            });
        });
    }

    toggleWebhook(id) {
        const webhook = this.webhooks.find(w => w.id === id);
        if (webhook) {
            webhook.enabled = !webhook.enabled;
            this.saveWebhooks();
            this.updateWebhookList();
            this.showNotification(
                webhook.enabled ? '▶️ เปิดใช้งาน Webhook' : '⏸️ ปิดใช้งาน Webhook',
                'info'
            );
        }
    }

    deleteWebhook(id) {
        const webhook = this.webhooks.find(w => w.id === id);
        if (!webhook) return;

        if (!confirm(`ต้องการลบ "${webhook.name}"?`)) return;

        this.webhooks = this.webhooks.filter(w => w.id !== id);
        this.saveWebhooks();
        this.updateWebhookList();
        this.showNotification('🗑️ ลบ Webhook แล้ว', 'info');
    }

    getEnabledWebhooks() {
        return this.webhooks.filter(w => w.enabled);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#00d97e' : type === 'error' ? '#f46a6a' : '#25f4ee'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
