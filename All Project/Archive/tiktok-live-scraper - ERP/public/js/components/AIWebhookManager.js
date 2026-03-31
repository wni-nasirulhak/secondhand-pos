// AI Webhook Manager Component
// จัดการ AI Reply Webhook - simulator + real AI integration

export class AIWebhookManager {
    constructor(container, storage = null, api = null) {
        this.container = container;
        this.storage = storage;
        this.api = api;
        this.isRunning = false;
        this.pollInterval = null;
        this.config = this.loadConfig();
        this.render();
        this.checkStatus();
    }

    loadConfig() {
        if (!this.storage) return this.defaultConfig();
        return this.storage.get('ai_webhook_config') || this.defaultConfig();
    }

    defaultConfig() {
        return {
            enabled: false,
            url: 'http://localhost:3099/webhook',
            aiMode: 'mock',
            apiKey: '',
            systemPrompt: `คุณคือ AI ผู้ช่วยตอบคอมเมนต์ใน TikTok Live สด
ตอบเป็นภาษาไทย สั้น กระชับ เป็นมิตร ไม่เกิน 60 ตัวอักษร
ขึ้นต้นด้วย @username เสมอ`,
            replyDelay: 300
        };
    }

    saveConfig() {
        if (this.storage) {
            this.storage.set('ai_webhook_config', this.config);
        }
    }

    getAIWebhookUrl() {
        if (!this.config.enabled) return null;
        return this.config.url;
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-webhook-manager" style="
                background: linear-gradient(135deg, rgba(129, 78, 255, 0.08) 0%, rgba(37, 244, 238, 0.05) 100%);
                border: 1px solid rgba(129, 78, 255, 0.3);
                border-radius: 16px;
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(129, 78, 255, 0.2) 0%, rgba(37, 244, 238, 0.1) 100%);
                    border-bottom: 1px solid rgba(129, 78, 255, 0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">🤖</span>
                            AI Reply Webhook
                            <span id="ai-status-badge" style="
                                font-size: 11px;
                                padding: 2px 10px;
                                border-radius: 20px;
                                font-weight: 600;
                                background: #333;
                                color: #888;
                            ">⬤ ปิดอยู่</span>
                        </h3>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-secondary);">
                            ส่งคอมเมนต์ไปให้ AI ตอบ แล้วนำคำตอบมา post ใน TikTok Live อัตโนมัติ
                        </p>
                    </div>
                    
                    <!-- Master Toggle -->
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;" title="เปิด/ปิด AI Reply Webhook">
                        <span style="font-size: 13px; color: var(--text-secondary);">เปิดใช้งาน</span>
                        <div id="ai-webhook-toggle" style="
                            position: relative;
                            width: 52px;
                            height: 28px;
                            background: ${this.config.enabled ? '#814eff' : '#333'};
                            border-radius: 14px;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="
                                position: absolute;
                                top: 4px;
                                left: ${this.config.enabled ? '28px' : '4px'};
                                width: 20px;
                                height: 20px;
                                background: white;
                                border-radius: 50%;
                                transition: all 0.3s;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            "></div>
                        </div>
                    </label>
                </div>

                <!-- Content -->
                <div style="padding: 20px;">
                    
                    <!-- Flow Diagram -->
                    <div style="
                        background: var(--bg-secondary);
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        flex-wrap: wrap;
                        font-size: 13px;
                    ">
                        <div style="text-align: center; padding: 8px 12px; background: rgba(37, 244, 238, 0.1); border-radius: 8px; border: 1px solid rgba(37,244,238,0.3);">
                            💬 TikTok<br><small style="color: var(--text-secondary);">คอมเมนต์ใหม่</small>
                        </div>
                        <span style="color: var(--text-secondary);">→</span>
                        <div style="text-align: center; padding: 8px 12px; background: rgba(254, 44, 85, 0.1); border-radius: 8px; border: 1px solid rgba(254,44,85,0.3);">
                            🕷️ Scraper<br><small style="color: var(--text-secondary);">ดึงคอมเมนต์</small>
                        </div>
                        <span style="color: var(--text-secondary);">→</span>
                        <div style="text-align: center; padding: 8px 12px; background: rgba(129, 78, 255, 0.15); border-radius: 8px; border: 1px solid rgba(129,78,255,0.4);">
                            🤖 AI Webhook<br><small style="color: var(--text-secondary);">ประมวลผล + ตอบ</small>
                        </div>
                        <span style="color: var(--text-secondary);">→</span>
                        <div style="text-align: center; padding: 8px 12px; background: rgba(0, 217, 126, 0.1); border-radius: 8px; border: 1px solid rgba(0,217,126,0.3);">
                            💬 TikTok<br><small style="color: var(--text-secondary);">ส่งคำตอบ</small>
                        </div>
                    </div>

                    <!-- Webhook URL + Simulator Controls -->
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr auto;
                        gap: 10px;
                        margin-bottom: 20px;
                        align-items: end;
                    ">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">
                                🔗 Webhook URL (ปลายทาง AI)
                            </label>
                            <input 
                                type="text"
                                id="ai-webhook-url"
                                value="${this.config.url}"
                                placeholder="http://localhost:3001/webhook"
                                style="
                                    width: 100%;
                                    padding: 10px 14px;
                                    background: var(--bg-input);
                                    border: 1px solid rgba(129, 78, 255, 0.3);
                                    border-radius: 8px;
                                    color: var(--text-primary);
                                    font-family: monospace;
                                    font-size: 13px;
                                "
                            />
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <button id="btn-launch-simulator" style="
                                padding: 10px 16px;
                                background: linear-gradient(135deg, #814eff, #25f4ee);
                                border: none;
                                border-radius: 8px;
                                color: white;
                                font-weight: 700;
                                cursor: pointer;
                                white-space: nowrap;
                                font-size: 13px;
                                transition: all 0.3s;
                            ">🚀 Launch Simulator</button>
                            <button id="btn-stop-simulator" style="
                                padding: 8px 16px;
                                background: #f46a6a;
                                border: none;
                                border-radius: 8px;
                                color: white;
                                font-weight: 600;
                                cursor: pointer;
                                font-size: 12px;
                                display: none;
                            ">⏹️ Stop</button>
                        </div>
                    </div>

                    <!-- Simulator Config (collapsible) -->
                    <div style="
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        margin-bottom: 20px;
                        overflow: hidden;
                    ">
                        <div id="sim-config-header" style="
                            padding: 12px 16px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            cursor: pointer;
                            user-select: none;
                        ">
                            <strong style="font-size: 14px;">⚙️ ตั้งค่า AI Simulator</strong>
                            <span id="sim-config-arrow" style="transition: transform 0.3s;">▼</span>
                        </div>
                        <div id="sim-config-content" style="padding: 16px; border-top: 1px solid var(--border-color);">
                            
                            <!-- AI Mode -->
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px;">
                                    🧠 AI Mode
                                </label>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                                    ${['mock', 'openai', 'gemini'].map(mode => `
                                        <label style="cursor: pointer;">
                                            <input type="radio" name="ai-mode" value="${mode}" ${this.config.aiMode === mode ? 'checked' : ''} style="display: none;">
                                            <div class="ai-mode-card" data-mode="${mode}" style="
                                                padding: 10px;
                                                border: 2px solid ${this.config.aiMode === mode ? 'var(--accent-primary)' : 'var(--border-color)'};
                                                border-radius: 8px;
                                                text-align: center;
                                                font-size: 13px;
                                                transition: all 0.3s;
                                                background: ${this.config.aiMode === mode ? 'rgba(129,78,255,0.1)' : 'transparent'};
                                            ">
                                                ${mode === 'mock' ? '🎭 Mock AI' : mode === 'openai' ? '🟢 OpenAI' : '🔷 Gemini'}
                                                <br><small style="color: var(--text-secondary); font-size: 11px;">${mode === 'mock' ? 'ไม่ต้องใช้ API key' : mode === 'openai' ? 'GPT-4o-mini' : 'Gemini Flash'}</small>
                                            </div>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- API Key -->
                            <div id="api-key-group" style="margin-bottom: 15px; ${this.config.aiMode === 'mock' ? 'display:none;' : ''}">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px;">
                                    🔑 API Key
                                </label>
                                <input 
                                    type="password"
                                    id="ai-api-key"
                                    value="${this.config.apiKey}"
                                    placeholder="${this.config.aiMode === 'openai' ? 'sk-...' : 'AIza...'}"
                                    style="
                                        width: 100%;
                                        padding: 10px;
                                        background: var(--bg-input);
                                        border: 1px solid var(--border-color);
                                        border-radius: 8px;
                                        color: var(--text-primary);
                                        font-family: monospace;
                                        font-size: 13px;
                                    "
                                />
                            </div>

                            <!-- Reply Delay -->
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px;">
                                    ⏱️ Delay ก่อนตอบ (ms) — จำลอง AI processing
                                </label>
                                <input 
                                    type="range"
                                    id="reply-delay-slider"
                                    min="0"
                                    max="3000"
                                    step="100"
                                    value="${this.config.replyDelay}"
                                    style="width: 100%; cursor: pointer;"
                                />
                                <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                    <span>0ms (ทันที)</span>
                                    <strong id="delay-value" style="color: var(--accent-primary);">${this.config.replyDelay}ms</strong>
                                    <span>3000ms (3 วิ)</span>
                                </div>
                            </div>

                            <!-- System Prompt -->
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px;">
                                    📝 System Prompt (สำหรับ OpenAI/Gemini)
                                </label>
                                <textarea
                                    id="system-prompt"
                                    style="
                                        width: 100%;
                                        height: 80px;
                                        padding: 10px;
                                        background: var(--bg-input);
                                        border: 1px solid var(--border-color);
                                        border-radius: 8px;
                                        color: var(--text-primary);
                                        font-size: 13px;
                                        resize: vertical;
                                        font-family: inherit;
                                    "
                                    placeholder="ตัวอย่าง: คุณคือ AI ตอบคอมเมนต์ TikTok Live ภาษาไทย สั้น เป็นมิตร..."
                                >${this.config.systemPrompt}</textarea>
                            </div>

                            <button id="btn-apply-config" style="
                                margin-top: 12px;
                                padding: 8px 20px;
                                background: rgba(129, 78, 255, 0.8);
                                border: none;
                                border-radius: 8px;
                                color: white;
                                font-weight: 600;
                                cursor: pointer;
                                font-size: 13px;
                            ">💾 บันทึกและอัปเดต Simulator</button>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div id="ai-webhook-stats" style="
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 20px;
                    ">
                        <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-secondary);">รับทั้งหมด</div>
                            <div style="font-size: 24px; font-weight: bold;" id="stat-processed">0</div>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-secondary);">ตอบแล้ว</div>
                            <div style="font-size: 24px; font-weight: bold; color: #00d97e;" id="stat-replied">0</div>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-secondary);">ข้าม</div>
                            <div style="font-size: 24px; font-weight: bold; color: #fdcb6e;" id="stat-skipped">0</div>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-secondary);">อัตราตอบ</div>
                            <div style="font-size: 24px; font-weight: bold; color: #25f4ee;" id="stat-rate">0%</div>
                        </div>
                    </div>

                    <!-- Live Log -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong style="font-size: 14px; display: flex; align-items: center; gap: 8px;">
                                📋 Live Log
                                <span id="log-live-indicator" style="
                                    display: inline-block;
                                    width: 8px;
                                    height: 8px;
                                    background: #333;
                                    border-radius: 50%;
                                    transition: background 0.3s;
                                "></span>
                            </strong>
                            <button id="btn-clear-logs" style="
                                padding: 5px 12px;
                                background: transparent;
                                border: 1px solid var(--border-color);
                                border-radius: 6px;
                                color: var(--text-secondary);
                                cursor: pointer;
                                font-size: 12px;
                            ">🗑️ ล้าง</button>
                        </div>
                        
                        <div id="ai-log-container" style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 12px;
                            height: 300px;
                            overflow-y: auto;
                            padding: 12px;
                            font-family: monospace;
                            font-size: 12px;
                        ">
                            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                                <div style="font-size: 40px; margin-bottom: 10px;">🤖</div>
                                <p>รอ Launch Simulator แล้ว Start Scraper<br>
                                <small>log จะแสดงที่นี่ real-time</small></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
        this.updateToggleUI();
    }

    attachEvents() {
        // Master toggle
        const toggle = this.container.querySelector('#ai-webhook-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleEnabled());
        }

        // URL input
        const urlInput = this.container.querySelector('#ai-webhook-url');
        if (urlInput) {
            urlInput.addEventListener('change', e => {
                this.config.url = e.target.value.trim();
                this.saveConfig();
            });
        }

        // Launch simulator
        const btnLaunch = this.container.querySelector('#btn-launch-simulator');
        if (btnLaunch) {
            btnLaunch.addEventListener('click', () => this.launchSimulator());
        }

        // Stop simulator
        const btnStop = this.container.querySelector('#btn-stop-simulator');
        if (btnStop) {
            btnStop.addEventListener('click', () => this.stopSimulator());
        }

        // AI Mode radios
        this.container.querySelectorAll('input[name="ai-mode"]').forEach(radio => {
            radio.addEventListener('change', e => {
                this.config.aiMode = e.target.value;
                this.saveConfig();
                this.updateAIModeUI();
            });
        });

        // Reply delay slider
        const slider = this.container.querySelector('#reply-delay-slider');
        const delayVal = this.container.querySelector('#delay-value');
        if (slider && delayVal) {
            slider.addEventListener('input', e => {
                this.config.replyDelay = parseInt(e.target.value);
                delayVal.textContent = `${this.config.replyDelay}ms`;
            });
            slider.addEventListener('change', () => this.saveConfig());
        }

        // API key
        const apiKeyInput = this.container.querySelector('#ai-api-key');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('change', e => {
                this.config.apiKey = e.target.value.trim();
                this.saveConfig();
            });
        }

        // System prompt
        const promptInput = this.container.querySelector('#system-prompt');
        if (promptInput) {
            promptInput.addEventListener('change', e => {
                this.config.systemPrompt = e.target.value;
                this.saveConfig();
            });
        }

        // Apply config button
        const btnApply = this.container.querySelector('#btn-apply-config');
        if (btnApply) {
            btnApply.addEventListener('click', () => this.applyConfig());
        }

        // Clear logs
        const btnClear = this.container.querySelector('#btn-clear-logs');
        if (btnClear) {
            btnClear.addEventListener('click', () => this.clearLogs());
        }

        // Collapsible sim config
        const configHeader = this.container.querySelector('#sim-config-header');
        const configContent = this.container.querySelector('#sim-config-content');
        const configArrow = this.container.querySelector('#sim-config-arrow');
        if (configHeader && configContent) {
            configHeader.addEventListener('click', () => {
                const isOpen = configContent.style.display !== 'none';
                configContent.style.display = isOpen ? 'none' : 'block';
                if (configArrow) configArrow.style.transform = isOpen ? 'rotate(-90deg)' : '';
            });
        }
    }

    toggleEnabled() {
        this.config.enabled = !this.config.enabled;
        this.saveConfig();
        this.updateToggleUI();
    }

    updateToggleUI() {
        const toggle = this.container.querySelector('#ai-webhook-toggle');
        if (!toggle) return;

        const thumb = toggle.querySelector('div');
        if (this.config.enabled) {
            toggle.style.background = '#814eff';
            if (thumb) thumb.style.left = '28px';
        } else {
            toggle.style.background = '#333';
            if (thumb) thumb.style.left = '4px';
        }

        const badge = this.container.querySelector('#ai-status-badge');
        if (badge) {
            if (this.config.enabled && this.isRunning) {
                badge.textContent = '⬤ กำลังทำงาน';
                badge.style.background = 'rgba(0, 217, 126, 0.2)';
                badge.style.color = '#00d97e';
            } else if (this.config.enabled) {
                badge.textContent = '⬤ เปิดอยู่ (simulator ปิด)';
                badge.style.background = 'rgba(253, 203, 110, 0.2)';
                badge.style.color = '#fdcb6e';
            } else {
                badge.textContent = '⬤ ปิดอยู่';
                badge.style.background = '#333';
                badge.style.color = '#888';
            }
        }
    }

    updateAIModeUI() {
        const apiKeyGroup = this.container.querySelector('#api-key-group');
        if (apiKeyGroup) {
            apiKeyGroup.style.display = this.config.aiMode === 'mock' ? 'none' : 'block';
        }

        // Update cards style
        this.container.querySelectorAll('.ai-mode-card').forEach(card => {
            const mode = card.dataset.mode;
            const isSelected = mode === this.config.aiMode;
            card.style.border = `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`;
            card.style.background = isSelected ? 'rgba(129,78,255,0.1)' : 'transparent';
        });
    }

    async launchSimulator() {
        const btnLaunch = this.container.querySelector('#btn-launch-simulator');
        const btnStop = this.container.querySelector('#btn-stop-simulator');

        if (btnLaunch) {
            btnLaunch.disabled = true;
            btnLaunch.textContent = '⏳ กำลังเปิด...';
        }

        try {
            const response = await fetch('/api/ai-webhook/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiMode: this.config.aiMode,
                    apiKey: this.config.apiKey,
                    systemPrompt: this.config.systemPrompt,
                    replyDelay: this.config.replyDelay
                })
            });

            const result = await response.json();

            if (result.success) {
                this.isRunning = true;
                if (btnLaunch) btnLaunch.style.display = 'none';
                if (btnStop) btnStop.style.display = 'block';
                this.showNotification(`🚀 AI Simulator เปิดที่ port ${result.port}!`, 'success');
                this.addLogEntry(null, {
                    type: 'system',
                    message: `✅ AI Webhook Simulator started at ${result.url}`,
                    aiMode: this.config.aiMode
                });
                this.startPollingLogs();
                this.updateToggleUI();
            } else {
                throw new Error(result.error || 'ไม่สามารถเปิด simulator ได้');
            }
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
            if (btnLaunch) {
                btnLaunch.disabled = false;
                btnLaunch.textContent = '🚀 Launch Simulator';
            }
        }
    }

    async stopSimulator() {
        try {
            await fetch('/api/ai-webhook/stop', { method: 'POST' });
            this.isRunning = false;
            this.stopPollingLogs();

            const btnLaunch = this.container.querySelector('#btn-launch-simulator');
            const btnStop = this.container.querySelector('#btn-stop-simulator');
            if (btnLaunch) { btnLaunch.style.display = 'block'; btnLaunch.disabled = false; btnLaunch.textContent = '🚀 Launch Simulator'; }
            if (btnStop) btnStop.style.display = 'none';

            this.addLogEntry(null, { type: 'system', message: '⏹️ AI Webhook Simulator stopped' });
            this.updateToggleUI();
            this.showNotification('⏹️ Simulator หยุดแล้ว', 'info');
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        }
    }

    async applyConfig() {
        try {
            const config = {
                aiMode: this.config.aiMode,
                apiKey: this.config.apiKey,
                systemPrompt: this.config.systemPrompt,
                replyDelay: this.config.replyDelay
            };

            const response = await fetch('/api/ai-webhook/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            const result = await response.json();
            if (result.success) {
                this.saveConfig();
                this.showNotification('✅ บันทึกการตั้งค่าแล้ว', 'success');
                this.addLogEntry(null, {
                    type: 'system',
                    message: `⚙️ Config updated: mode=${config.aiMode} | delay=${config.replyDelay}ms`
                });
            } else {
                this.saveConfig(); // Save locally even if server not running
                this.showNotification('💾 บันทึก config ในเครื่องแล้ว (Simulator ยังไม่ได้เปิด)', 'info');
            }
        } catch (e) {
            this.saveConfig();
            this.showNotification('💾 บันทึก config ในเครื่องแล้ว', 'info');
        }
    }

    async clearLogs() {
        try {
            await fetch('/api/ai-webhook/logs', { method: 'DELETE' });
        } catch (e) {}

        const logContainer = this.container.querySelector('#ai-log-container');
        if (logContainer) {
            logContainer.innerHTML = `
                <div style="text-align:center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 32px; margin-bottom: 8px;">🤖</div>
                    <p>Log ถูกล้างแล้ว</p>
                </div>
            `;
        }

        // Reset stats
        ['stat-processed', 'stat-replied', 'stat-skipped'].forEach(id => {
            const el = this.container.querySelector(`#${id}`);
            if (el) el.textContent = '0';
        });
        const rateEl = this.container.querySelector('#stat-rate');
        if (rateEl) rateEl.textContent = '0%';
    }

    startPollingLogs() {
        this.stopPollingLogs();
        this.pollInterval = setInterval(() => this.fetchAndUpdateLogs(), 1500);
        this.fetchAndUpdateLogs();

        // Animate live indicator
        const indicator = this.container.querySelector('#log-live-indicator');
        if (indicator) indicator.style.background = '#00d97e';
    }

    stopPollingLogs() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        const indicator = this.container.querySelector('#log-live-indicator');
        if (indicator) indicator.style.background = '#333';
    }

    async fetchAndUpdateLogs() {
        try {
            const [logsResp, statusResp] = await Promise.all([
                fetch('/api/ai-webhook/logs?limit=20'),
                fetch('/api/ai-webhook/status')
            ]);

            const logsData = await logsResp.json();
            const statusData = await statusResp.json();

            // Update stats
            if (statusData.running) {
                this.updateStat('stat-processed', statusData.totalProcessed || 0);
                this.updateStat('stat-replied', statusData.totalReplied || 0);
                this.updateStat('stat-skipped', statusData.totalSkipped || 0);
                const rateEl = this.container.querySelector('#stat-rate');
                if (rateEl) rateEl.textContent = (statusData.replyRate || '0') + '%';
            }

            // Render logs
            if (logsData.logs && logsData.logs.length > 0) {
                this.renderLogs(logsData.logs);
            }
        } catch (e) {
            // Silently fail (simulator might be restarting)
        }
    }

    renderLogs(logs) {
        const container = this.container.querySelector('#ai-log-container');
        if (!container) return;

        container.innerHTML = logs.map(log => {
            const time = new Date(log.receivedAt).toLocaleTimeString('th-TH', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            const statusColor = log.skipped ? '#fdcb6e' : (log.error ? '#f46a6a' : '#00d97e');
            const statusIcon = log.skipped ? '⏭️' : (log.error ? '❌' : '✅');

            return `
                <div style="
                    margin-bottom: 12px;
                    padding: 10px;
                    background: var(--bg-input);
                    border-radius: 8px;
                    border-left: 3px solid ${statusColor};
                    animation: fadeIn 0.3s ease;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="color: var(--accent-primary); font-weight: 600;">@${this.escapeHtml(log.username)}</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--text-secondary); font-size: 10px;">${time}</span>
                            <span style="
                                background: ${statusColor}20;
                                color: ${statusColor};
                                padding: 1px 6px;
                                border-radius: 4px;
                                font-size: 10px;
                            ">${log.aiProvider || 'AI'} · ${log.duration || 0}ms</span>
                        </div>
                    </div>
                    <div style="color: var(--text-secondary); margin-bottom: 6px; font-size: 11px;">
                        💬 ${this.escapeHtml(log.comment)}
                    </div>
                    ${log.reply ? `
                        <div style="
                            color: ${statusColor};
                            font-weight: 600;
                            font-size: 12px;
                            padding: 4px 8px;
                            background: ${statusColor}10;
                            border-radius: 4px;
                        ">
                            ${statusIcon} ${this.escapeHtml(log.reply)}
                        </div>
                    ` : `
                        <div style="color: #fdcb6e; font-size: 11px;">⏭️ ข้ามไม่ตอบ</div>
                    `}
                    ${log.error ? `<div style="color: #f46a6a; font-size: 10px; margin-top: 4px;">⚠️ ${this.escapeHtml(log.error)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    addLogEntry(logContainer, entry) {
        const container = logContainer || this.container.querySelector('#ai-log-container');
        if (!container) return;

        const existingEmpty = container.querySelector('div[style*="40px"]');
        if (existingEmpty) {
            container.innerHTML = '';
        }

        const el = document.createElement('div');
        el.style.cssText = `
            padding: 8px 10px;
            margin-bottom: 8px;
            background: rgba(129, 78, 255, 0.1);
            border-left: 3px solid #814eff;
            border-radius: 6px;
            font-size: 11px;
            color: var(--text-secondary);
        `;
        el.textContent = entry.message;
        container.insertBefore(el, container.firstChild);
    }

    updateStat(id, value) {
        const el = this.container.querySelector(`#${id}`);
        if (el && el.textContent !== String(value)) {
            el.style.transform = 'scale(1.2)';
            el.textContent = value;
            setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
        }
    }

    async checkStatus() {
        try {
            const resp = await fetch('/api/ai-webhook/status');
            const data = await resp.json();

            if (data.running) {
                this.isRunning = true;
                const btnLaunch = this.container.querySelector('#btn-launch-simulator');
                const btnStop = this.container.querySelector('#btn-stop-simulator');
                if (btnLaunch) btnLaunch.style.display = 'none';
                if (btnStop) btnStop.style.display = 'block';
                this.startPollingLogs();
                this.updateToggleUI();
            }
        } catch (e) {}
    }

    showNotification(message, type = 'info') {
        const n = document.createElement('div');
        n.textContent = message;
        n.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            padding: 12px 20px; border-radius: 8px; font-weight: 600;
            color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${type === 'success' ? '#00d97e' : type === 'error' ? '#f46a6a' : type === 'info' ? '#25f4ee' : '#814eff'};
        `;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3500);
    }

    escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text || '';
        return d.innerHTML;
    }
}
