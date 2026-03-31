// Component สำหรับฟอร์มตั้งค่า (ใช้ Accordion)
import { Accordion } from './Accordion.js';
import { ReplyTemplates } from './ReplyTemplates.js';

export class ConfigForm {
    constructor(container, recentURLsManager = null, api = null, storage = null) {
        this.container = container;
        this.recentURLsManager = recentURLsManager;
        this.api = api;
        this.storage = storage;
        this.accordion = null;
        this.replyTemplates = null;
        this.render();
    }

    render() {
        const recentUrls = this.recentURLsManager ? this.recentURLsManager.getAll() : [];
        
        this.container.innerHTML = `
            <div class="config-form">
                <h2 style="margin-bottom: 20px;">⚙️ การตั้งค่า</h2>
                <div id="config-accordion"></div>
            </div>
        `;

        // Create accordion
        const accordionContainer = this.container.querySelector('#config-accordion');
        this.accordion = new Accordion(accordionContainer, {
            defaultOpen: ['section-0'], // เปิด Basic Settings ตั้งแต่แรก
            storage: this.storage,
            storageKey: 'config_accordion_state'
        });

        // ============ Basic Settings ============
        this.accordion.addSection('การตั้งค่าพื้นฐาน', (contentDiv) => {
            contentDiv.innerHTML = `
                <div class="form-group">
                    <label>
                        <span class="label-icon">📱</span>
                        เลือกแพลตฟอร์ม (Platform)
                    </label>
                        <style>
                            .platform-badge {
                                cursor: pointer;
                                padding: 8px 16px;
                                border-radius: 12px;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                font-size: 13px;
                                transition: all 0.3s ease;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                color: var(--text-secondary);
                            }
                            .platform-badge:hover {
                                background: rgba(255, 255, 255, 0.1);
                                transform: translateY(-2px);
                            }
                            .platform-badge.active {
                                background: linear-gradient(135deg, #6c5ce7, #a29bfe);
                                border-color: transparent;
                                color: white;
                                box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
                            }
                        </style>
                        <div class="platform-badge active" data-platform="tiktok"><i class="fab fa-tiktok"></i> TikTok</div>
                        <div class="platform-badge" data-platform="shopee"><i class="fas fa-shopping-bag"></i> Shopee</div>
                        <div class="platform-badge" data-platform="lazada"><i class="fas fa-heart"></i> Lazada</div>
                        <div class="platform-badge" data-platform="facebook"><i class="fab fa-facebook"></i> Facebook</div>
                        <div class="platform-badge" data-platform="instagram"><i class="fab fa-instagram"></i> Instagram</div>
                        <div class="platform-badge" data-platform="youtube"><i class="fab fa-youtube"></i> YouTube</div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="tiktok-url">
                        <span class="label-icon">🔗</span>
                        Live Stream URL
                    </label>
                    <div class="url-input-wrapper">
                        <input 
                            type="text" 
                            id="tiktok-url" 
                            placeholder="วางลิงก์ Live ที่นี่ (TikTok, Shopee, Lazada, FB, IG, YT)"
                            value=""
                            list="recent-urls"
                            style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);"
                        />
                        ${recentUrls.length > 0 ? `
                            <datalist id="recent-urls">
                                ${recentUrls.map(url => `<option value="${this.escapeHtml(url)}">`).join('')}
                            </datalist>
                        ` : ''}
                    </div>
                    <small style="color: var(--text-secondary);">ระบบจะตรวจจับแพลตฟอร์มอัตโนมัติจาก URL ที่วาง</small>
                </div>

                <div class="form-group">
                    <label for="host-username">
                        <span class="label-icon">🏠</span>
                        Host Username (ชื่อคุณ)
                    </label>
                    <input 
                        type="text" 
                        id="host-username" 
                        placeholder="เช่น @rizannTry"
                        style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);"
                    />
                    <small style="color: var(--text-secondary);">ใส่ชื่อ @username ของคุณเพื่อไม่ให้ AI ตอบข้อความตัวเอง</small>
                </div>

                <div class="form-group">
                    <label for="duration">
                        <span class="label-icon">⏱️</span>
                        ระยะเวลา (นาที)
                    </label>
                    <input 
                        type="number" 
                        id="duration" 
                        min="1" 
                        max="180" 
                        value="10"
                        style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);"
                    />
                    <small style="color: var(--text-secondary);">ระยะเวลาที่ต้องการดึงคอมเมนต์ (1-180 นาที)</small>
                </div>

                <div class="form-group">
                    <label for="interval">
                        <span class="label-icon">🔄</span>
                        ความถี่ในการดึง (วินาที)
                    </label>
                    <input 
                        type="number" 
                        id="interval" 
                        min="1" 
                        max="10" 
                        value="3"
                        style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);"
                    />
                    <small style="color: var(--text-secondary);">ควรตั้ง 3-5 วินาที เพื่อไม่ให้โหลด TikTok มาก</small>
                </div>

                <div class="form-group">
                    <label for="work-mode">
                        <span class="label-icon">🚀</span>
                        โหมดการทำงาน (Mode)
                    </label>
                    <div class="mode-toggle-wrapper" style="display: flex; gap: 15px; margin-top: 10px;">
                        <label class="mode-option" style="flex: 1; cursor: pointer;">
                            <input type="radio" name="work-mode" value="read" checked style="display: none;">
                            <div class="mode-card" style="padding: 15px 10px; border: 2px solid var(--border-color); border-radius: 12px; text-align: center; transition: all 0.3s; background: var(--glass);">
                                <div style="font-size: 24px; margin-bottom: 5px;">📖</div>
                                <div style="font-weight: 700;">อ่านอย่างเดียว</div>
                                <small style="display: block; opacity: 0.7;">(Read Only)</small>
                            </div>
                        </label>
                        <label class="mode-option" style="flex: 1; cursor: pointer;">
                            <input type="radio" name="work-mode" value="respond" style="display: none;">
                            <div class="mode-card" style="padding: 15px 10px; border: 2px solid var(--border-color); border-radius: 12px; text-align: center; transition: all 0.3s; background: var(--glass);">
                                <div style="font-size: 24px; margin-bottom: 5px;">💬</div>
                                <div style="font-weight: 700;">อ่าน + ตอบกลับ</div>
                                <small style="display: block; opacity: 0.7;">(Read + Reply)</small>
                            </div>
                        </label>
                    </div>
                    <small style="color: var(--text-secondary);">📌 เลือก "อ่าน+ตอบกลับ" หากต้องการใช้ระบบ AI ตอบแชทอัตโนมัติ</small>
                </div>
            `;

            this.setupModeToggle(contentDiv);
        }, '🎯', { defaultOpen: true });

        // ============ Authentication ============
        this.accordion.addSection('การยืนยันตัวตน', (contentDiv) => {
            contentDiv.innerHTML = `
                <div class="form-group">
                    <label for="auth-mode">
                        <span class="label-icon">🔐</span>
                        โหมด Authentication
                    </label>
                    <select id="auth-mode" style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                        <option value="none">ไม่ใช้ (Incognito)</option>
                        <option value="storage" selected>StorageState (แนะนำ!) - ใช้คุกกี้ที่บันทึกไว้</option>
                        <option value="persistent">Persistent Context - เก็บ session</option>
                        <option value="chrome">Chrome Profile - ใช้ Chrome ที่ login ไว้</option>
                    </select>
                    <small style="color: var(--text-secondary);">
                        • StorageState = ใช้คุกกี้จากปุ่ม "นำเข้าคุกกี้" ด้านล่าง<br>
                        • Persistent = เก็บ session ไว้ใช้ซ้ำ<br>
                        • Chrome Profile = ใช้ Chrome ที่ login ไว้แล้ว
                    </small>
                </div>

                <div class="form-group" id="cookie-import-group" style="display: none; background: var(--bg-secondary); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <label>
                        <span class="label-icon">🍪</span>
                        จัดการคุกกี้ (Manual Cookie Import)
                    </label>

                    <div class="cookie-platform-selector" style="display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap;">
                        <div class="platform-badge-mini active" data-cookie-platform="tiktok" style="padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); cursor: pointer; font-size: 11px; border: 1px solid var(--border-color);">TikTok</div>
                        <div class="platform-badge-mini" data-cookie-platform="shopee" style="padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); cursor: pointer; font-size: 11px; border: 1px solid var(--border-color);">Shopee</div>
                        <div class="platform-badge-mini" data-cookie-platform="lazada" style="padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); cursor: pointer; font-size: 11px; border: 1px solid var(--border-color);">Lazada</div>
                        <div class="platform-badge-mini" data-cookie-platform="facebook" style="padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); cursor: pointer; font-size: 11px; border: 1px solid var(--border-color);">Facebook</div>
                        <div class="platform-badge-mini" data-cookie-platform="instagram" style="padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); cursor: pointer; font-size: 11px; border: 1px solid var(--border-color);">Instagram</div>
                        <div class="platform-badge-mini" data-cookie-platform="youtube" style="padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); cursor: pointer; font-size: 11px; border: 1px solid var(--border-color);">YouTube</div>
                    </div>

                    <style>
                        .platform-badge-mini.active {
                            background: var(--accent-primary) !important;
                            border-color: var(--accent-primary) !important;
                            color: white !important;
                        }
                    </style>

                    <div id="cookie-status" style="margin: 10px 0; padding: 10px; border-radius: 8px; display: none; font-size: 12px;">
                        <!-- Status will be inserted here -->
                    </div>

                    <div id="cookie-detection-alert" style="display: none; background: rgba(108, 92, 231, 0.15); border: 1px solid rgba(138, 75, 175, 0.3); padding: 12px; border-radius: 10px; margin-bottom: 12px; font-size: 13px; color: #d088ff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px); animation: slideTitleIn 0.3s ease;">
                        ✨ ตรวจพบว่าเป็นของ <strong id="detected-platform-name" style="color: #fff; text-decoration: underline;">...</strong> (ระบบสลับแพลตฟอร์มให้อัตโนมัติ)
                    </div>

                    <textarea 
                        id="cookie-json" 
                        placeholder='วาง JSON คุกกี้ที่นี่... (แนะนำ: EditThisCookie JSON)'
                        style="width: 100%; height: 80px; margin-top: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); padding: 10px; font-family: monospace; font-size: 11px;"
                    ></textarea>
                    <button type="button" id="btn-import-cookies" class="btn btn-small" style="width: 100%; margin-top: 10px; background: #6c5ce7; color: white;">
                        📥 นำเข้าคุกกี้ (บันทึกสำหรับ <span id="current-import-platform">tiktok</span>)
                    </button>
                    <small style="display: block; margin-top: 8px; color: var(--text-secondary); font-size: 11px;">
                        💡 ก๊อปปี้ JSON จาก EditThisCookie มาวางแล้วกดปุ่มนำเข้า
                    </small>
                </div>

                <div class="form-group" id="chrome-path-group" style="display: none; background: var(--bg-secondary); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <label for="chrome-profile-select">
                        <span class="label-icon">📂</span>
                        เลือก Chrome Profile
                    </label>
                    <button type="button" id="btn-load-profiles" class="btn btn-small btn-primary" style="margin-bottom: 10px;">
                        🔍 โหลดรายการ Profile
                    </button>
                    <select id="chrome-profile-select" style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); display: none; margin-bottom: 10px;">
                        <option value="">-- เลือก Profile --</option>
                    </select>
                    <input 
                        type="text" 
                        id="chrome-path" 
                        placeholder="หรือใส่ path เอง: C:\\Users\\...\\User Data\\Profile 5"
                        style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);"
                    />
                    <small style="color: var(--text-secondary);">
                        💡 คลิก "โหลดรายการ Profile" แล้วเลือก profile ที่ login TikTok ไว้
                        <br>
                        หรือใส่ path เต็มเอง (ต้องมี <code>\Profile X</code> ท้าย path)
                    </small>
                </div>
            `;

            this.setupAuthMode(contentDiv);
        }, '🔐');

        // ============ Reply Settings ============
        this.accordion.addSection('การตอบกลับอัตโนมัติ', (contentDiv) => {
            contentDiv.innerHTML = `<div id="reply-templates-container"></div>`;
            
            // Initialize ReplyTemplates
            const templatesContainer = contentDiv.querySelector('#reply-templates-container');
            this.replyTemplates = new ReplyTemplates(templatesContainer, this.storage, this.api);

            // Add cooldown settings after templates
            setTimeout(() => {
                const cooldownHTML = `
                    <div style="margin-top: 20px; background: var(--bg-secondary); padding: 15px; border-radius: 8px;">
                        <strong style="font-size: 16px;">⏰ การจัดการการตอบ</strong>
                        
                        <div class="form-group" style="margin-top: 15px;">
                            <label for="reply-cooldown">
                                <span class="label-icon">⏰</span>
                                Cooldown ระหว่างตอบ (นาที)
                            </label>
                            <input 
                                type="number" 
                                id="reply-cooldown" 
                                min="0" 
                                max="60" 
                                value="5"
                                style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);"
                            />
                            <small style="color: var(--text-secondary);">ตั้ง 0 = ตอบได้ครั้งเดียว, 1-60 = ตอบซ้ำได้หลังจากผ่านเวลา</small>
                        </div>

                        <div style="margin-top: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="reply-on-question" checked style="width: 18px; height: 18px; cursor: pointer;"/>
                                <span>
                                    <span class="label-icon">❓</span>
                                    <strong>ตอบคำถามทันที (ข้าม cooldown)</strong>
                                </span>
                            </label>
                            <small style="display: block; margin-top: 5px; margin-left: 28px; color: var(--text-secondary);">
                                ถ้าคอมเมนต์เป็นคำถาม (มี ?, ไหม, อะไร ฯลฯ) จะตอบทันทีแม้ยัง cooldown
                            </small>
                        </div>
                    </div>
                `;
                templatesContainer.insertAdjacentHTML('beforeend', cooldownHTML);
            }, 100);
        }, '💬');

        // ============ Advanced Settings ============
        this.accordion.addSection('ตั้งค่าขั้นสูง', (contentDiv) => {
            contentDiv.innerHTML = `
                <div class="form-group">
                    <label for="browser-engine">
                        <span class="label-icon">🌐</span>
                        Browser Engine
                    </label>
                    <select id="browser-engine" style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                        <option value="chromium">Chromium / Google Chrome</option>
                        <option value="firefox">Firefox (แนะนำสำหรับกรณี Chrome โดนบล็อก)</option>
                    </select>
                    <small style="color: var(--text-secondary);">เลือก browser ที่ต้องการใช้ทำงาน</small>
                </div>

                <div class="form-group checkbox-group">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="headless" style="width: 18px; height: 18px; cursor: pointer;"/>
                        <span>
                            <span class="label-icon">👻</span>
                            Headless Mode (ไม่แสดง browser)
                        </span>
                    </label>
                </div>

                <div class="form-group checkbox-group">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="stealth-mode" checked style="width: 18px; height: 18px; cursor: pointer;"/>
                        <span>
                            <span class="label-icon">🥷</span>
                            Stealth Mode (ป้องกัน bot detection)
                        </span>
                    </label>
                    <small style="display: block; margin-top: 5px; margin-left: 28px; color: var(--text-secondary);">
                        ใช้เทคนิค anti-detection เพื่อหลีกเลี่ยงการถูกบล็อก
                    </small>
                </div>
            `;
        }, '⚙️');

        // Render accordion
        this.accordion.render();

        // Attach additional events
        this.attachEvents();
    }

    setupModeToggle(container) {
        const modeOptions = container.querySelectorAll('.mode-option');
        const updateModeStyles = () => {
            modeOptions.forEach(opt => {
                const input = opt.querySelector('input');
                const card = opt.querySelector('.mode-card');
                if (input.checked) {
                    card.style.background = 'var(--accent-primary)';
                    card.style.borderColor = 'var(--accent-primary)';
                    card.style.color = 'white';
                } else {
                    card.style.background = 'transparent';
                    card.style.borderColor = 'var(--border-color)';
                    card.style.color = 'var(--text-secondary)';
                }
            });
        };

        modeOptions.forEach(opt => {
            opt.addEventListener('change', updateModeStyles);
        });
        updateModeStyles();
    }

    setupAuthMode(container) {
        const authModeSelect = container.querySelector('#auth-mode');
        const cookieImportGroup = container.querySelector('#cookie-import-group');
        const chromePathGroup = container.querySelector('#chrome-path-group');

        if (authModeSelect) {
            authModeSelect.addEventListener('change', (e) => {
                const mode = e.target.value;
                if (cookieImportGroup) {
                    cookieImportGroup.style.display = mode === 'storage' ? 'block' : 'none';
                    if (mode === 'storage') {
                        this.checkCookieStatus();
                    }
                }
                if (chromePathGroup) {
                    chromePathGroup.style.display = mode === 'chrome' ? 'block' : 'none';
                }
            });

            // Initial check
            if (authModeSelect.value === 'storage' && cookieImportGroup) {
                cookieImportGroup.style.display = 'block';
                this.checkCookieStatus();
            }
        }
    }

    attachEvents() {
        // Import cookies behavior
        const btnImportCookies = this.container.querySelector('#btn-import-cookies');
        const cookieJsonArea = this.container.querySelector('#cookie-json');
        const cookieBadges = this.container.querySelectorAll('.platform-badge-mini');
        const currentPlatLabel = this.container.querySelector('#current-import-platform');
        const detectionAlert = this.container.querySelector('#cookie-detection-alert');
        const detectedLabel = this.container.querySelector('#detected-platform-name');
        
        this.currentCookiePlatform = 'tiktok';

        // Platform Switch in Cookie Manager
        cookieBadges.forEach(badge => {
            badge.addEventListener('click', () => {
                const platform = badge.dataset.cookiePlatform;
                this.currentCookiePlatform = platform;
                
                cookieBadges.forEach(b => b.classList.toggle('active', b.dataset.cookiePlatform === platform));
                if (currentPlatLabel) currentPlatLabel.textContent = platform;
                
                this.checkCookieStatus(platform);
            });
        });

        // Auto Detection from Clipboard paste
        if (cookieJsonArea) {
            cookieJsonArea.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                if (!val) {
                    if (detectionAlert) detectionAlert.style.display = 'none';
                    return;
                }

                try {
                    let cookies = JSON.parse(val);
                    if (!Array.isArray(cookies) && cookies.cookies) cookies = cookies.cookies;
                    if (!Array.isArray(cookies)) return;

                    const sample = cookies.find(c => c.domain);
                    if (sample) {
                        const domain = sample.domain.toLowerCase();
                        let detected = '';
                        if (domain.includes('tiktok.com')) detected = 'tiktok';
                        else if (domain.includes('shopee')) detected = 'shopee';
                        else if (domain.includes('lazada')) detected = 'lazada';
                        else if (domain.includes('facebook.com')) detected = 'facebook';
                        else if (domain.includes('instagram.com')) detected = 'instagram';
                        else if (domain.includes('youtube.com') || domain.includes('youtu.be')) detected = 'youtube';

                        if (detected && detected !== this.currentCookiePlatform) {
                            this.currentCookiePlatform = detected;
                            cookieBadges.forEach(b => b.classList.toggle('active', b.dataset.cookiePlatform === detected));
                            if (currentPlatLabel) currentPlatLabel.textContent = detected;
                            
                            if (detectionAlert && detectedLabel) {
                                detectedLabel.textContent = detected.toUpperCase();
                                detectionAlert.style.display = 'block';
                            }
                            this.checkCookieStatus(detected);
                        }
                    }
                } catch (e) {}
            });
        }

        if (btnImportCookies) {
            btnImportCookies.addEventListener('click', () => this.handleImportCookies());
        }

        // Load Chrome profiles
        const btnLoadProfiles = this.container.querySelector('#btn-load-profiles');
        if (btnLoadProfiles) {
            btnLoadProfiles.addEventListener('click', () => this.loadChromeProfiles());
        }

        // Profile select change
        const profileSelect = this.container.querySelector('#chrome-profile-select');
        if (profileSelect) {
            profileSelect.addEventListener('change', (e) => {
                const chromePathInput = this.container.querySelector('#chrome-path');
                if (chromePathInput && e.target.value) {
                    chromePathInput.value = e.target.value;
                }
            });
        }

        // Auto-save on change
        const inputs = this.container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.autoSave());
        });

        // Platform detection from URL
        const urlInput = this.container.querySelector('#tiktok-url');
        const badges = this.container.querySelectorAll('.platform-badge');
        
        if (urlInput) {
            urlInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase();
                let detected = '';
                if (val.includes('tiktok.com')) detected = 'tiktok';
                else if (val.includes('shopee')) detected = 'shopee';
                else if (val.includes('lazada')) detected = 'lazada';
                else if (val.includes('facebook.com')) detected = 'facebook';
                else if (val.includes('instagram.com')) detected = 'instagram';
                else if (val.includes('youtube.com') || val.includes('youtu.be')) detected = 'youtube';

                if (detected) {
                    // Update main badges (Basic Settings)
                    badges.forEach(b => {
                        b.classList.toggle('active', b.dataset.platform === detected);
                    });

                    // Sync with Cookie Manager mini badges
                    const cookieBadges = this.container.querySelectorAll('.platform-badge-mini');
                    const currentPlatLabel = this.container.querySelector('#current-import-platform');
                    
                    if (detected !== this.currentCookiePlatform) {
                        this.currentCookiePlatform = detected;
                        cookieBadges.forEach(b => b.classList.toggle('active', b.dataset.cookiePlatform === detected));
                        if (currentPlatLabel) currentPlatLabel.textContent = detected;
                        
                        // Show detection alert in cookie manager if pasted in URL bar
                        const detectionAlert = this.container.querySelector('#cookie-detection-alert');
                        const detectedLabel = this.container.querySelector('#detected-platform-name');
                        if (detectionAlert && detectedLabel) {
                            detectedLabel.textContent = detected.toUpperCase();
                            detectionAlert.style.display = 'block';
                            setTimeout(() => { 
                                const alert = this.container.querySelector('#cookie-detection-alert');
                                if (alert) alert.style.display = 'none'; 
                            }, 5000);
                        }
                        
                        // Update cookie status for newly detected platform
                        this.checkCookieStatus(detected);
                    }
                }
            });

            // Also make main badges interactive
            badges.forEach(b => {
                b.style.cursor = 'pointer';
                b.addEventListener('click', () => {
                    const platform = b.dataset.platform;
                    badges.forEach(badge => badge.classList.toggle('active', badge.dataset.platform === platform));
                    
                    // Sync to cookie manager
                    this.currentCookiePlatform = platform;
                    const cookieBadges = this.container.querySelectorAll('.platform-badge-mini');
                    cookieBadges.forEach(mini => mini.classList.toggle('active', mini.dataset.cookiePlatform === platform));
                    const currentPlatLabel = this.container.querySelector('#current-import-platform');
                    if (currentPlatLabel) currentPlatLabel.textContent = platform;
                    
                    this.checkCookieStatus(platform);
                    
                    // Auto-detect URL from clipboard if empty? or just standard behavior
                });
            });
        }
    }

    async checkCookieStatus(platform = 'tiktok') {
        const statusDiv = this.container.querySelector('#cookie-status');
        if (!statusDiv) return;

        console.log(`[Frontend] Checking cookie status for: ${platform}`);
        try {
            const data = await this.api.checkCookies(platform);
            console.log(`[Frontend] Cookie data received for ${platform}:`, data);

            if (data.exists) {
                if (data.valid) {
                    statusDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">✅</span>
                            <div>
                                <strong style="color: #00d97e;">คุกกี้ ${platform.toUpperCase()} พร้อมใช้!</strong>
                                <br>
                                <small style="color: var(--text-secondary);">มี ${data.cookieCount} คุกกี้ | ${data.expiryDate || ''}</small>
                            </div>
                        </div>
                    `;
                    statusDiv.style.background = 'rgba(0, 217, 126, 0.1)';
                    statusDiv.style.border = '1px solid rgba(0, 217, 126, 0.3)';
                } else {
                    statusDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">⚠️</span>
                            <div>
                                <strong style="color: #f46a6a;">คุกกี้ ${platform.toUpperCase()} หมดอายุ</strong>
                                <br>
                                <small style="color: var(--text-secondary);">กรุณานำเข้าใหม่สำหรับ StorageState</small>
                            </div>
                        </div>
                    `;
                    statusDiv.style.background = 'rgba(244, 106, 106, 0.1)';
                    statusDiv.style.border = '1px solid rgba(244, 106, 106, 0.3)';
                }
            } else {
                statusDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">ℹ️</span>
                        <div>
                            <strong style="color: #25f4ee;">ยังไม่มีคุกกี้ ${platform.toUpperCase()}</strong>
                            <br>
                            <small style="color: var(--text-secondary);">กรุณาวาง JSON เพื่อนำเข้า</small>
                        </div>
                    </div>
                `;
                statusDiv.style.background = 'rgba(37, 244, 238, 0.1)';
                statusDiv.style.border = '1px solid rgba(37, 244, 238, 0.3)';
            }
            statusDiv.style.display = 'block';
        } catch (error) {
            console.error('Error checking cookie status:', error);
            statusDiv.style.display = 'none';
        }
    }

    async handleImportCookies() {
        const textarea = this.container.querySelector('#cookie-json');
        const btn = this.container.querySelector('#btn-import-cookies');
        const detectionAlert = this.container.querySelector('#cookie-detection-alert');
        const platform = this.currentCookiePlatform || 'tiktok';

        if (!textarea || !textarea.value.trim()) {
            this.showNotification('❌ กรุณาใส่ JSON คุกกี้', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = `⏳ กำลังนำเข้า ${platform}...`;

        try {
            const result = await this.api.importCookies(textarea.value.trim(), platform);
            if (result.success) {
                this.showNotification(`✅ นำเข้า ${platform} สำเร็จ!`, 'success');
                textarea.value = '';
                if (detectionAlert) detectionAlert.style.display = 'none';

                btn.textContent = '⏳ ตรวจสอบสถานะ...';
                await new Promise(resolve => setTimeout(resolve, 800));

                await this.checkCookieStatus(platform);
                this.showNotification('🎉 บันทึกและตรวจสอบเสร็จแล้ว!', 'success');
            } else {
                throw new Error(result.error || 'ไม่สามารถนำเข้าคุกกี้ได้');
            }
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = `📥 นำเข้าคุกกี้ (บันทึกสำหรับ ${platform})`;
        }
    }

    async loadChromeProfiles() {
        const btnLoadProfiles = this.container.querySelector('#btn-load-profiles');
        const profileSelect = this.container.querySelector('#chrome-profile-select');

        if (!btnLoadProfiles || !profileSelect) return;

        btnLoadProfiles.disabled = true;
        btnLoadProfiles.textContent = '⏳ กำลังโหลด...';

        try {
            const response = await fetch('/api/find-chrome-path');
            const data = await response.json();

            if (data.success && data.profiles && data.profiles.length > 0) {
                profileSelect.innerHTML = '<option value="">-- เลือก Profile --</option>';
                data.profiles.forEach(profile => {
                    const option = document.createElement('option');
                    option.value = profile.fullPath;
                    option.textContent = `${profile.name} (${profile.path})`;
                    profileSelect.appendChild(option);
                });
                profileSelect.style.display = 'block';
                this.showNotification(`✅ พบ ${data.profiles.length} profiles`, 'success');
            } else {
                throw new Error('ไม่พบ Chrome profiles');
            }
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        } finally {
            btnLoadProfiles.disabled = false;
            btnLoadProfiles.textContent = '🔍 โหลดรายการ Profile';
        }
    }

    getConfig() {
        const urlInput = this.container.querySelector('#tiktok-url');
        const durationInput = this.container.querySelector('#duration');
        const intervalInput = this.container.querySelector('#interval');
        const headlessInput = this.container.querySelector('#headless');
        const authModeInput = this.container.querySelector('#auth-mode');
        const stealthInput = this.container.querySelector('#stealth-mode');
        const chromePathInput = this.container.querySelector('#chrome-path');
        const browserInput = this.container.querySelector('#browser-engine');
        const modeInput = this.container.querySelector('input[name="work-mode"]:checked');
        const replyCooldownInput = this.container.querySelector('#reply-cooldown');
        const replyOnQuestionInput = this.container.querySelector('#reply-on-question');

        let chromePath = chromePathInput ? chromePathInput.value.trim() : '';
        if (chromePath && !chromePath.includes('\\Default') && !chromePath.match(/\\Profile \d+/)) {
            chromePath = chromePath + '\\Default';
            if (chromePathInput) chromePathInput.value = chromePath;
        }

        const config = {
            url: urlInput ? urlInput.value : '',
            duration: durationInput ? parseInt(durationInput.value) * 60 : 600,
            interval: intervalInput ? parseInt(intervalInput.value) : 3,
            browser: browserInput ? browserInput.value : 'chromium',
            mode: modeInput ? modeInput.value : 'read',
            headless: headlessInput ? headlessInput.checked : false,
            authMode: authModeInput ? authModeInput.value : 'none',
            stealth: stealthInput ? stealthInput.checked : true,
            chromePath: chromePath,
            replyCooldown: replyCooldownInput ? parseInt(replyCooldownInput.value) : 5,
            replyOnQuestion: replyOnQuestionInput ? replyOnQuestionInput.checked : true,
            hostUsername: this.container.querySelector('#host-username') ? this.container.querySelector('#host-username').value.trim() : ''
        };

        // Add reply templates if in respond mode
        if (config.mode === 'respond' && this.replyTemplates) {
            config.replyTemplates = this.replyTemplates.getEnabledTemplates().map(t => t.text);
        }

        return config;
    }

    validate() {
        const config = this.getConfig();
        const errors = [];

        const validPlatforms = ['tiktok.com', 'shopee.co.th', 'shopee.tw', 'shopee.vn', 'lazada.co.th', 'lazada.sg', 'facebook.com', 'instagram.com', 'youtube.com', 'youtu.be'];
        const isUrlValid = validPlatforms.some(platform => config.url && config.url.includes(platform));

        if (!isUrlValid) {
            errors.push('กรุณาใส่ URL ที่รองรับ (TikTok, Shopee, Lazada, Facebook, Instagram, YouTube)');
        }

        if (config.duration < 60 || config.duration > 10800) {
            errors.push('ระยะเวลาต้องอยู่ระหว่าง 1-180 นาที');
        }

        if (config.interval < 1 || config.interval > 10) {
            errors.push('ความถี่ต้องอยู่ระหว่าง 1-10 วินาที');
        }

        if (config.mode === 'respond' && (!config.replyTemplates || config.replyTemplates.length === 0)) {
            errors.push('กรุณาเพิ่มข้อความตอบกลับอย่างน้อย 1 ข้อความ');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    setConfig(config) {
        // Set basic fields
        const fields = {
            '#tiktok-url': config.url,
            '#duration': config.duration ? config.duration / 60 : 10,
            '#interval': config.interval || 3,
            '#headless': config.headless || false,
            '#auth-mode': config.authMode || 'storage',
            '#stealth-mode': config.stealth !== false,
            '#chrome-path': config.chromePath || '',
            '#browser-engine': config.browser || 'chromium',
            '#reply-cooldown': config.replyCooldown || 5,
            '#reply-on-question': config.replyOnQuestion !== false,
            '#host-username': config.hostUsername || ''
        };

        Object.entries(fields).forEach(([selector, value]) => {
            const el = this.container.querySelector(selector);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = value;
                } else {
                    el.value = value;
                }
            }
        });

        // Set mode
        if (config.mode) {
            const modeInput = this.container.querySelector(`input[name="work-mode"][value="${config.mode}"]`);
            if (modeInput) {
                modeInput.checked = true;
                modeInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    disable() {
        const inputs = this.container.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => input.disabled = true);
    }

    enable() {
        const inputs = this.container.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => input.disabled = false);
    }

    autoSave() {
        if (this.onConfigChange) {
            this.onConfigChange(this.getConfig());
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
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
