// Component สำหรับจัดการ Presets
export class PresetManager {
    constructor(container, presetManager, callbacks = {}) {
        this.container = container;
        this.presetManager = presetManager;
        this.callbacks = callbacks;
        this.render();
        this.attachEvents();
    }

    render() {
        const presets = this.presetManager.getAll();

        this.container.innerHTML = `
            <div class="preset-manager">
                <div class="preset-header">
                    <h3>💾 การตั้งค่าที่บันทึกไว้</h3>
                    <button id="btn-save-preset" class="btn btn-small btn-primary">
                        <span class="btn-icon">➕</span>
                        บันทึกการตั้งค่า
                    </button>
                </div>

                <div id="preset-list" class="preset-list">
                    ${presets.length === 0 ? `
                        <div class="empty-preset">
                            <span class="empty-icon">📋</span>
                            <p>ยังไม่มีการตั้งค่าที่บันทึกไว้</p>
                            <small>กดปุ่ม "➕ บันทึกการตั้งค่า" เพื่อเริ่มต้น</small>
                        </div>
                    ` : presets.map(preset => this.renderPresetItem(preset)).join('')}
                </div>
            </div>

            <!-- Modal สำหรับบันทึก preset -->
            <div id="preset-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>💾 บันทึกการตั้งค่า</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="preset-name">ชื่อการตั้งค่า</label>
                            <input 
                                type="text" 
                                id="preset-name" 
                                placeholder="เช่น: Live ประจำวัน, Event พิเศษ"
                                autocomplete="off"
                            />
                            <small>ตั้งชื่อที่จำง่ายสำหรับการตั้งค่านี้</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="btn-cancel-preset" class="btn btn-secondary">ยกเลิก</button>
                        <button id="btn-confirm-preset" class="btn btn-primary">บันทึก</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPresetItem(preset) {
        const date = new Date(preset.updatedAt);
        const formattedDate = date.toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="preset-item" data-preset-id="${preset.id}">
                <div class="preset-info">
                    <div class="preset-name">${this.escapeHtml(preset.name)}</div>
                    <div class="preset-details">
                        <span class="preset-url" title="${this.escapeHtml(preset.config.url)}">
                            🔗 ${this.extractUsername(preset.config.url)}
                        </span>
                        <span class="preset-duration">⏱️ ${preset.config.duration / 60} นาที</span>
                        <span class="preset-interval">🔄 ${preset.config.interval} วินาที</span>
                    </div>
                    <div class="preset-date">
                        <small>อัปเดต: ${formattedDate}</small>
                    </div>
                </div>
                <div class="preset-actions">
                    <button class="btn btn-small btn-primary btn-load-preset" title="โหลดการตั้งค่านี้">
                        <span class="btn-icon">📂</span>
                        โหลด
                    </button>
                    <button class="btn btn-small btn-danger btn-delete-preset" title="ลบ">
                        <span class="btn-icon">🗑️</span>
                    </button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        // ปุ่มเปิด modal
        const btnSavePreset = this.container.querySelector('#btn-save-preset');
        btnSavePreset?.addEventListener('click', () => this.showModal());

        // ปุ่มปิด modal
        const modalClose = this.container.querySelector('.modal-close');
        const btnCancel = this.container.querySelector('#btn-cancel-preset');
        
        modalClose?.addEventListener('click', () => this.hideModal());
        btnCancel?.addEventListener('click', () => this.hideModal());

        // ปุ่ม confirm
        const btnConfirm = this.container.querySelector('#btn-confirm-preset');
        btnConfirm?.addEventListener('click', () => this.handleSavePreset());

        // Enter ใน input
        const presetNameInput = this.container.querySelector('#preset-name');
        presetNameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSavePreset();
            }
        });

        // ปิด modal เมื่อคลิกนอก
        const modal = this.container.querySelector('#preset-modal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Event delegation สำหรับ preset items
        const presetList = this.container.querySelector('#preset-list');
        presetList?.addEventListener('click', (e) => {
            const presetItem = e.target.closest('.preset-item');
            if (!presetItem) return;

            const presetId = parseInt(presetItem.dataset.presetId);

            if (e.target.closest('.btn-load-preset')) {
                this.handleLoadPreset(presetId);
            } else if (e.target.closest('.btn-delete-preset')) {
                this.handleDeletePreset(presetId);
            }
        });
    }

    showModal() {
        const modal = this.container.querySelector('#preset-modal');
        const input = this.container.querySelector('#preset-name');
        
        modal.classList.add('show');
        input.value = '';
        input.focus();
    }

    hideModal() {
        const modal = this.container.querySelector('#preset-modal');
        modal.classList.remove('show');
    }

    handleSavePreset() {
        const input = this.container.querySelector('#preset-name');
        const name = input.value.trim();

        if (!name) {
            alert('⚠️ กรุณาใส่ชื่อการตั้งค่า');
            input.focus();
            return;
        }

        if (this.callbacks.onSave) {
            this.callbacks.onSave(name);
        }

        this.hideModal();
        this.render();
        this.attachEvents();
    }

    handleLoadPreset(presetId) {
        const preset = this.presetManager.load(presetId);
        
        if (preset && this.callbacks.onLoad) {
            this.callbacks.onLoad(preset.config);
        }
    }

    handleDeletePreset(presetId) {
        const preset = this.presetManager.load(presetId);
        
        if (confirm(`⚠️ ต้องการลบการตั้งค่า "${preset.name}" หรือไม่?`)) {
            this.presetManager.delete(presetId);
            this.render();
            this.attachEvents();

            if (this.callbacks.onDelete) {
                this.callbacks.onDelete(presetId);
            }
        }
    }

    refresh() {
        this.render();
        this.attachEvents();
    }

    extractUsername(url) {
        const match = url.match(/@([^/]+)/);
        return match ? `@${match[1]}` : url;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
