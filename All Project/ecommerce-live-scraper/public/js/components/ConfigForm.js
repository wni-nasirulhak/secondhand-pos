// Component สำหรับฟอร์มตั้งค่า
export class ConfigForm {
    constructor(container, recentURLsManager = null, api = null) {
        this.container = container;
        this.recentURLsManager = recentURLsManager;
        this.api = api;
        this.render();
        this.attachEvents();
    }

    render() {
        const recentUrls = this.recentURLsManager ? this.recentURLsManager.getAll() : [];
        
        this.container.innerHTML = `
            <div class="config-form">
                <h2>⚙️ การตั้งค่า</h2>
                
                <div class="form-group">
                    <label>
                        <span class="label-icon">📱</span>
                        เลือกแพลตฟอร์ม
                    </label>
                    <div class="platform-selector" style="display: flex; gap: 10px; margin: 10px 0; flex-wrap: wrap;">
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
                            placeholder="วางลิงก์ Live ที่นี่ (รองรับทุกแพลตฟอร์ม)"
                            value=""
                            list="recent-urls"
                        />
                        ${recentUrls.length > 0 ? `
                            <datalist id="recent-urls">
                                ${recentUrls.map(url => `<option value="${this.escapeHtml(url)}">`).join('')}
                            </datalist>
                        ` : ''}
                    </div>
                    <small>ระบบจะตรวจจับแพลตฟอร์มอัตโนมัติจาก URL ที่คุณวาง</small>
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
                    />
                    <small>ระยะเวลาที่ต้องการดึงคอมเมนต์ (1-180 นาที)</small>
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
                    />
                    <small>ควรตั้ง 3-5 วินาที เพื่อไม่ให้โหลด TikTok มาก</small>
                </div>

                <div class="form-group">
                    <label for="browser-engine">
                        <span class="label-icon">🌐</span>
                        Browser Engine
                    </label>
                    <select id="browser-engine" style="width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                        <option value="chromium">Chromium / Google Chrome</option>
                        <option value="firefox">Firefox (แนะนำสำหรับกรณี Chrome โดนบล็อก)</option>
                    </select>
                    <small>เลือก browser ที่ต้องการใช้ทำงาน</small>
                </div>

                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" id="headless" />
                        <span class="label-icon">👻</span>
                        Headless Mode (ไม่แสดง browser)
                    </label>
                </div>

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
                    <small>
                        • StorageState = ใช้คุกกี้จากปุ่ม "นำเข้าคุกกี้" ด้านล่าง<br>
                        • Persistent = เก็บ session ไว้ใช้ซ้ำ<br>
                        • Chrome Profile = ใช้ Chrome ที่ login ไว้แล้ว
                    </small>
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
                    <small>📌 เลือก "อ่าน+ตอบกลับ" หากต้องการใช้ระบบ AI ตอบแชทอัตโนมัติ</small>
                </div>


                <div class="form-group" id="reply-settings-group" style="display: none; background: var(--bg-secondary); padding: 15px; border-radius: 8px; margin-top: 10px;">
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
                    <small>ตั้ง 0 = ตอบได้ครั้งเดียว, 1-60 = ตอบซ้ำได้หลังจากผ่านเวลา</small>

                    <div style="margin-top: 15px;">
                        <label>
                            <input type="checkbox" id="reply-on-question" checked />
                            <span class="label-icon">❓</span>
                            ตอบคำถามทันที (ข้าม cooldown)
                        </label>
                        <small style="display: block; margin-top: 5px; margin-left: 28px;">
                            ถ้าคอมเมนต์เป็นคำถาม (มี ?, ไหม, อะไร ฯลฯ) จะตอบทันทีแม้ยัง cooldown
                        </small>
                    </div>
                </div>

                <div class="form-group section-divider" id="cookie-import-group" style="display: none; margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                    <label>
                        <span class="label-icon">🍪</span>
                        จัดการคุกกี้ (Manual Cookie Import)
                    </label>
                    
                    <div id="cookie-status" style="margin: 10px 0; padding: 10px; border-radius: 8px; display: none;">
                        <!-- Status will be inserted here -->
                    </div>
                    
                    <textarea 
                        id="cookie-json" 
                        placeholder='วาง JSON คุกกี้ที่นี่... (เช่น [{"name": "sessionid", ...}])'
                        style="width: 100%; height: 80px; margin-top: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); padding: 10px; font-family: monospace; font-size: 12px;"
                    ></textarea>
                    <button type="button" id="btn-import-cookies" class="btn btn-small" style="width: 100%; margin-top: 10px; background: #6c5ce7; color: white;">
                        📥 นำเข้าคุกกี้ (Save to StorageState)
                    </button>
                    <small style="display: block; margin-top: 5px;">
                        💡 ก๊อปปี้ JSON จาก EditThisCookie มาวางแล้วกดปุ่มนำเข้า
                    </small>
                </div>

                <div class="form-group" id="chrome-path-group" style="display: none;">
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
                    />
                    <small>
                        💡 คลิก "โหลดรายการ Profile" แล้วเลือก profile ที่ login TikTok ไว้
                        <br>
                        หรือใส่ path เต็มเอง (ต้องมี <code>\Profile X</code> ท้าย path)
                    </small>
                </div>

                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" id="stealth-mode" checked />
                        <span class="label-icon">🥷</span>
                        Stealth Mode (ป้องกัน bot detection)
                    </label>
                    <small style="display: block; margin-top: 5px; margin-left: 28px;">
                        ใช้เทคนิค anti-detection เพื่อหลีกเลี่ยงการถูกบล็อก
                    </small>
                </div>
            </div>
        `;
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
        
        // ถ้าใส่แค่ User Data (ไม่มี \Default หรือ \Profile X)
        // ให้เพิ่ม \Default ให้อัตโนมัติ
        if (chromePath && !chromePath.includes('\\Default') && !chromePath.match(/\\Profile \d+/)) {
            chromePath = chromePath + '\\Default';
            if (chromePathInput) {
                chromePathInput.value = chromePath;
            }
        }

        const authMode = authModeInput ? authModeInput.value : 'none';

        return {
            url: urlInput ? urlInput.value : '',
            duration: durationInput ? parseInt(durationInput.value) * 60 : 600,
            interval: intervalInput ? parseInt(intervalInput.value) : 3,
            browser: browserInput ? browserInput.value : 'chromium',
            mode: modeInput ? modeInput.value : 'read',
            headless: headlessInput ? headlessInput.checked : false,
            authMode: authMode,
            stealth: stealthInput ? stealthInput.checked : true,
            chromePath: chromePath,
            replyCooldown: replyCooldownInput ? parseInt(replyCooldownInput.value) : 5,
            replyOnQuestion: replyOnQuestionInput ? replyOnQuestionInput.checked : true
        };
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

        return {
            valid: errors.length === 0,
            errors
        };
    }

    attachEvents() {
        // Auto-save on change
        const inputs = this.container.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.autoSave();
            });
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
                    badges.forEach(b => {
                        b.classList.toggle('active', b.dataset.platform === detected);
                    });
                }
            });
        }


        // Toggle Chrome path input & Cookie import based on auth mode
        const authModeSelect = this.container.querySelector('#auth-mode');
        const chromePathGroup = this.container.querySelector('#chrome-path-group');
        const cookieImportGroup = this.container.querySelector('#cookie-import-group');
        
        if (authModeSelect) {
            authModeSelect.addEventListener('change', (e) => {
                const mode = e.target.value;
                if (chromePathGroup) {
                    chromePathGroup.style.display = mode === 'chrome' ? 'block' : 'none';
                }
                if (cookieImportGroup) {
                    cookieImportGroup.style.display = mode === 'storage' ? 'block' : 'none';
                    
                    // Check cookie status when switching to storage mode
                    if (mode === 'storage') {
                        this.checkCookieStatus();
                    }
                }
            });
            
            // Initial check
            if (authModeSelect.value === 'storage' && cookieImportGroup) {
                cookieImportGroup.style.display = 'block';
                this.checkCookieStatus();
            }
        }

        // Load profiles button
        const btnLoadProfiles = this.container.querySelector('#btn-load-profiles');
        if (btnLoadProfiles) {
            btnLoadProfiles.addEventListener('click', () => {
                this.loadChromeProfiles();
            });
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

        // Import Cookies button
        const btnImportCookies = this.container.querySelector('#btn-import-cookies');
        if (btnImportCookies) {
            btnImportCookies.addEventListener('click', () => {
                this.handleImportCookies();
            });
        }

        // Mode toggle styling & show/hide reply settings
        const modeOptions = this.container.querySelectorAll('.mode-option');
        const replySettingsGroup = this.container.querySelector('#reply-settings-group');
        
        const updateModeStyles = () => {
            let respondMode = false;
            modeOptions.forEach(opt => {
                const input = opt.querySelector('input');
                const card = opt.querySelector('.mode-card');
                if (input.checked) {
                    card.style.background = 'var(--accent-primary)';
                    card.style.borderColor = 'var(--accent-primary)';
                    card.style.color = 'white';
                    if (input.value === 'respond') respondMode = true;
                } else {
                    card.style.background = 'transparent';
                    card.style.borderColor = 'var(--border-color)';
                    card.style.color = 'var(--text-secondary)';
                }
            });
            
            // Show/hide reply settings based on mode
            if (replySettingsGroup) {
                replySettingsGroup.style.display = respondMode ? 'block' : 'none';
            }
        };
        
        modeOptions.forEach(opt => {
            opt.addEventListener('change', updateModeStyles);
        });
        updateModeStyles(); // Initial style
    }

    async checkCookieStatus() {
        const statusDiv = this.container.querySelector('#cookie-status');
        if (!statusDiv) {
            console.warn('Cookie status div not found');
            return;
        }

        console.log('🍪 Checking cookie status...');

        try {
            const response = await fetch('/api/check-cookies');
            const data = await response.json();
            
            console.log('🍪 Cookie status:', data);
            
            if (data.exists) {
                if (data.valid) {
                    statusDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">✅</span>
                            <div>
                                <strong style="color: #00d97e;">คุกกี้พร้อมใช้งาน!</strong>
                                <br>
                                <small style="color: var(--text-secondary);">มี ${data.cookieCount} คุกกี้ | หมดอายุ: ${data.expiryDate || 'ไม่ระบุ'}</small>
                            </div>
                        </div>
                    `;
                    statusDiv.style.background = 'rgba(0, 217, 126, 0.1)';
                    statusDiv.style.border = '1px solid rgba(0, 217, 126, 0.3)';
                } else {
                    statusDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">⚠️</span>
                            <div>
                                <strong style="color: #f46a6a;">คุกกี้หมดอายุแล้ว!</strong>
                                <br>
                                <small style="color: var(--text-secondary);">กรุณาไปก็อปคุกกี้ใหม่จาก TikTok แล้ววางด้านล่าง</small>
                            </div>
                        </div>
                    `;
                    statusDiv.style.background = 'rgba(244, 106, 106, 0.1)';
                    statusDiv.style.border = '1px solid rgba(244, 106, 106, 0.3)';
                }
                statusDiv.style.display = 'block';
            } else {
                statusDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">ℹ️</span>
                        <div>
                            <strong style="color: #25f4ee;">ยังไม่มีคุกกี้</strong>
                            <br>
                            <small style="color: var(--text-secondary);">กรุณานำเข้าคุกกี้จาก TikTok ด้านล่าง</small>
                        </div>
                    </div>
                `;
                statusDiv.style.background = 'rgba(37, 244, 238, 0.1)';
                statusDiv.style.border = '1px solid rgba(37, 244, 238, 0.3)';
                statusDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error checking cookie status:', error);
            statusDiv.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary);">
                    ⚠️ ไม่สามารถตรวจสอบสถานะได้
                </div>
            `;
            statusDiv.style.display = 'block';
        }
    }

    async handleImportCookies() {
        const textarea = this.container.querySelector('#cookie-json');
        const btn = this.container.querySelector('#btn-import-cookies');
        
        if (!textarea || !textarea.value.trim()) {
            this.showNotification('❌ กรุณาใส่ JSON คุกกี้', 'error');
            return;
        }

        if (!this.api) {
            this.showNotification('❌ API ไม่พร้อมใช้งาน', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = '⏳ กำลังนำเข้า...';

        try {
            const result = await this.api.importCookies(textarea.value.trim());
            if (result.success) {
                this.showNotification('✅ ' + result.message, 'success');
                textarea.value = ''; // ล้างช่อง
                
                // เปลี่ยนโหมดเป็น StorageState อัตโนมัติ
                const authModeSelect = this.container.querySelector('#auth-mode');
                if (authModeSelect) {
                    authModeSelect.value = 'storage';
                }
                
                // รอให้ไฟล์ถูกเขียนเสร็จแล้วค่อย check status
                btn.textContent = '⏳ กำลังตรวจสอบ...';
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check status again after import
                await this.checkCookieStatus();
                
                this.showNotification('🎉 นำเข้าและตรวจสอบเสร็จแล้ว!', 'success');
            } else {
                throw new Error(result.error || 'ไม่สามารถนำเข้าคุกกี้ได้');
            }
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '📥 นำเข้าคุกกี้ (Save to StorageState)';
        }
    }

    autoFillChromePath() {
        const chromePathInput = this.container.querySelector('#chrome-path');
        if (!chromePathInput) return;

        // Windows default path
        const username = window.navigator.userAgent.match(/Windows NT/) ? 
            '' : '';
        const defaultPath = `C:\\\\Users\\\\${username || 'YourName'}\\\\AppData\\\\Local\\\\Google\\\\Chrome\\\\User Data`;
        
        if (!chromePathInput.value || chromePathInput.value === defaultPath) {
            // ลองหา username จริง
            this.findChromePath();
        }
    }

    async findChromePath() {
        // เรียก API เพื่อหา Chrome path จาก server
        try {
            const response = await fetch('/api/find-chrome-path');
            const data = await response.json();
            
            const chromePathInput = this.container.querySelector('#chrome-path');
            if (data.path && chromePathInput) {
                chromePathInput.value = data.path;
            }
        } catch (error) {
            console.error('Error finding Chrome path:', error);
        }
    }

    async loadChromeProfiles() {
        const btnLoadProfiles = this.container.querySelector('#btn-load-profiles');
        const profileSelect = this.container.querySelector('#chrome-profile-select');
        const chromePathInput = this.container.querySelector('#chrome-path');

        if (!btnLoadProfiles || !profileSelect) return;

        // แสดง loading
        btnLoadProfiles.disabled = true;
        btnLoadProfiles.textContent = '⏳ กำลังโหลด...';

        try {
            const response = await fetch('/api/find-chrome-path');
            const data = await response.json();

            if (data.success && data.profiles && data.profiles.length > 0) {
                // ล้าง options เดิม
                profileSelect.innerHTML = '<option value="">-- เลือก Profile ที่ login TikTok ไว้ --</option>';

                // เพิ่ม profiles
                data.profiles.forEach(profile => {
                    const option = document.createElement('option');
                    option.value = profile.fullPath;
                    option.textContent = `${profile.name} (${profile.path})`;
                    profileSelect.appendChild(option);
                });

                // แสดง dropdown
                profileSelect.style.display = 'block';

                // แสดง notification
                this.showNotification(`✅ พบ ${data.profiles.length} profiles`, 'success');
            } else {
                throw new Error('ไม่พบ Chrome profiles');
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
            this.showNotification('❌ ' + error.message, 'error');
            
            // ถ้าหาไม่เจอ แสดง path พื้นฐาน
            if (chromePathInput) {
                const username = window.navigator.userAgent.match(/Windows/) ? 'YourName' : '';
                chromePathInput.value = `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1`;
                chromePathInput.placeholder = 'ใส่ path เต็มของ profile ที่ login TikTok ไว้';
            }
        } finally {
            btnLoadProfiles.disabled = false;
            btnLoadProfiles.textContent = '🔍 โหลดรายการ Profile';
        }
    }

    showNotification(message, type = 'info') {
        // สร้าง notification ง่ายๆ
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
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    autoSave() {
        // Will be called by app.js to save config
        if (this.onConfigChange) {
            this.onConfigChange(this.getConfig());
        }
    }

    setConfig(config) {
        const urlInput = this.container.querySelector('#tiktok-url');
        const durationInput = this.container.querySelector('#duration');
        const intervalInput = this.container.querySelector('#interval');
        const headlessInput = this.container.querySelector('#headless');
        const persistentInput = this.container.querySelector('#persistent');
        const proxyInput = this.container.querySelector('#proxy-url');
        const useChromeInput = this.container.querySelector('#use-chrome-profile');
        const chromePathInput = this.container.querySelector('#chrome-path');
        const chromePathGroup = this.container.querySelector('#chrome-path-group');
        const browserInput = this.container.querySelector('#browser-engine');

        if (config.url && urlInput) {
            urlInput.value = config.url;
        }
        if (config.duration && durationInput) {
            durationInput.value = config.duration / 60;
        }
        if (config.interval && intervalInput) {
            intervalInput.value = config.interval;
        }
        if (config.headless !== undefined && headlessInput) {
            headlessInput.checked = config.headless;
        }
        if (config.persistent !== undefined && persistentInput) {
            persistentInput.checked = config.persistent;
        }
        if (config.proxy && proxyInput) {
            proxyInput.value = config.proxy;
        }
        if (config.mode) {
            const modeInput = this.container.querySelector(`input[name="work-mode"][value="${config.mode}"]`);
            if (modeInput) {
                modeInput.checked = true;
                // Dispatch change event to update styles
                modeInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        if (config.useChromeProfile !== undefined && useChromeInput) {
            useChromeInput.checked = config.useChromeProfile;
            if (chromePathGroup) {
                chromePathGroup.style.display = config.useChromeProfile ? 'block' : 'none';
            }
        }
        if (config.chromePath && chromePathInput) {
            chromePathInput.value = config.chromePath;
        }
        if (config.browser && browserInput) {
            browserInput.value = config.browser;
        }
    }

    disable() {
        const inputs = this.container.querySelectorAll('input');
        inputs.forEach(input => input.disabled = true);
    }

    enable() {
        const inputs = this.container.querySelectorAll('input');
        inputs.forEach(input => input.disabled = false);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
