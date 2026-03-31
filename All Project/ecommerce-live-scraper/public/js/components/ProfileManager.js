// Profile Manager Component - Phase 2
export class ProfileManager {
    constructor(container, api = null) {
        this.container = container;
        this.api = api;
        this.profiles = [];
        this.init();
    }

    async init() {
        await this.loadProfiles();
        this.render();
    }

    async loadProfiles() {
        try {
            const response = await fetch('/api/profiles');
            const data = await response.json();
            if (data.success) {
                this.profiles = data.profiles;
            }
        } catch (error) {
            console.error('Failed to load profiles:', error);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="profile-manager">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">👤</span>
                            Account Profiles
                        </h3>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: var(--text-secondary);">
                            จัดการบัญชีแยกกันสำหรับ TikTok, Shopee และแพลตฟอร์มอื่นๆ
                        </p>
                    </div>
                    <button id="btn-add-profile" class="btn btn-small" style="background: var(--accent-primary);">
                        ➕ สร้างโปรไฟล์ใหม่
                    </button>
                </div>

                <div id="profile-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    <!-- Profiles will be injected here -->
                </div>
            </div>
        `;

        this.attachEvents();
        this.updateProfileList();
    }

    attachEvents() {
        const btnAdd = this.container.querySelector('#btn-add-profile');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.showCreateModal());
        }
    }

    async showCreateModal() {
        const name = prompt('กรุณาชื่อเรียกโปรไฟล์ (เช่น Account_A_TikTok):');
        if (!name) return;

        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const result = await response.json();
            if (result.success) {
                await this.loadProfiles();
                this.updateProfileList();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to create profile');
        }
    }

    updateProfileList() {
        const listEl = this.container.querySelector('#profile-list');
        if (!listEl) return;

        if (this.profiles.length === 0) {
            listEl.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: 12px; color: var(--text-secondary);">
                    ยังไม่มีโปรไฟล์ที่บันทึกไว้
                </div>
            `;
            return;
        }

        listEl.innerHTML = this.profiles.map(profile => `
            <div class="profile-card" style="
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                transition: all 0.3s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: var(--bg-input); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                            👤
                        </div>
                        <div>
                            <h4 style="margin: 0; color: var(--text-primary);">${profile.name}</h4>
                            <small style="color: var(--text-secondary); font-size: 11px;">Path: ${profile.name}</small>
                        </div>
                    </div>
                    <button class="btn-delete-profile" data-name="${profile.name}" style="background: transparent; border: none; font-size: 18px; cursor: pointer; color: #f46a6a;">
                        🗑️
                    </button>
                </div>
                <div style="margin-top: 5px;">
                    <button class="btn btn-small btn-block btn-select-profile" data-name="${profile.name}" style="background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color);">
                        เลือกโปรไฟล์นี้
                    </button>
                </div>
            </div>
        `).join('');

        // Attach delete events
        listEl.querySelectorAll('.btn-delete-profile').forEach(btn => {
            btn.addEventListener('click', () => this.deleteProfile(btn.dataset.name));
        });

        // Attach select events
        listEl.querySelectorAll('.btn-select-profile').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                // Dispatch event to notify ConfigForm
                window.dispatchEvent(new CustomEvent('profile-selected', { detail: { name } }));
            });
        });
    }

    async deleteProfile(name) {
        if (!confirm(`ต้องการลบโปรไฟล์ "${name}"?`)) return;
        try {
            const response = await fetch(`/api/profiles/${name}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                await this.loadProfiles();
                this.updateProfileList();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }
}
