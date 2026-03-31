// Reply Templates Component
export class ReplyTemplates {
    constructor(container, storage = null, api = null) {
        this.container = container;
        this.storage = storage;
        this.api = api;
        this.templates = this.loadTemplates();
        this.render();
    }

    loadTemplates() {
        if (!this.storage) {
            return this.getDefaultTemplates();
        }

        const saved = this.storage.get('reply_templates');
        if (saved && saved.length > 0) {
            return saved;
        }

        return this.getDefaultTemplates();
    }

    getDefaultTemplates() {
        return [
            {
                id: Date.now(),
                text: '@{username} สวัสดีครับ! 👋',
                enabled: true
            },
            {
                id: Date.now() + 1,
                text: 'ขอบคุณที่คอมเมนต์นะครับ @{username} 😊',
                enabled: true
            },
            {
                id: Date.now() + 2,
                text: 'เห็นคอมเมนต์แล้วนะครับ {username}! 💖',
                enabled: false
            }
        ];
    }

    saveTemplates() {
        if (this.storage) {
            this.storage.set('reply_templates', this.templates);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="reply-templates">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <strong style="font-size: 16px;">📝 ข้อความตอบกลับ</strong>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-secondary);">
                            ตั้งค่าข้อความที่จะตอบอัตโนมัติ (สุ่มจากที่เปิดใช้งาน)
                        </p>
                    </div>
                    <button id="add-template" class="btn btn-small" style="background: #00d97e;">
                        ➕ เพิ่ม
                    </button>
                </div>

                <div class="template-variables" style="
                    background: rgba(37, 244, 238, 0.1);
                    border: 1px solid rgba(37, 244, 238, 0.3);
                    border-radius: 8px;
                    padding: 10px;
                    margin-bottom: 15px;
                    font-size: 13px;
                ">
                    <strong>💡 ตัวแปรที่ใช้ได้:</strong>
                    <div style="margin-top: 5px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <code style="background: var(--bg-secondary); padding: 2px 8px; border-radius: 4px;">{username}</code>
                        <code style="background: var(--bg-secondary); padding: 2px 8px; border-radius: 4px;">{comment}</code>
                        <code style="background: var(--bg-secondary); padding: 2px 8px; border-radius: 4px;">{time}</code>
                    </div>
                </div>

                <div id="templates-list">
                    ${this.renderTemplatesList()}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderTemplatesList() {
        if (this.templates.length === 0) {
            return `
                <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                    📝 ยังไม่มีเทมเพลต<br>
                    <small>คลิกปุ่ม "➕ เพิ่ม" เพื่อสร้างข้อความตอบกลับ</small>
                </div>
            `;
        }

        return this.templates.map((template, index) => `
            <div class="template-item" data-template-id="${template.id}" style="
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 10px;
                ${template.enabled ? 'border-left: 3px solid #00d97e;' : 'opacity: 0.6;'}
            ">
                <div style="display: flex; gap: 10px; align-items: start;">
                    <label style="cursor: pointer; display: flex; align-items: center; margin-top: 8px;">
                        <input 
                            type="checkbox" 
                            class="template-toggle" 
                            data-id="${template.id}"
                            ${template.enabled ? 'checked' : ''}
                            style="width: 18px; height: 18px; cursor: pointer;"
                        />
                    </label>
                    
                    <textarea 
                        class="template-text" 
                        data-id="${template.id}"
                        placeholder="พิมพ์ข้อความตอบกลับ..."
                        style="
                            flex: 1;
                            background: var(--bg-input);
                            border: 1px solid var(--border-color);
                            border-radius: 6px;
                            padding: 8px;
                            color: var(--text-primary);
                            font-size: 14px;
                            resize: vertical;
                            min-height: 60px;
                            font-family: inherit;
                        "
                    >${this.escapeHtml(template.text)}</textarea>
                    
                    <button 
                        class="template-delete" 
                        data-id="${template.id}"
                        style="
                            background: #f46a6a;
                            border: none;
                            border-radius: 6px;
                            padding: 8px 12px;
                            color: white;
                            cursor: pointer;
                            font-size: 18px;
                            line-height: 1;
                            margin-top: 8px;
                        "
                        title="ลบ"
                    >🗑️</button>
                </div>
                
                <div style="margin-top: 8px; padding-left: 28px;">
                    <small style="color: var(--text-secondary);">
                        ตัวอย่าง: ${this.previewTemplate(template.text)}
                    </small>
                </div>
            </div>
        `).join('');
    }

    previewTemplate(text) {
        return text
            .replace(/{username}/g, '<strong>User123</strong>')
            .replace(/{comment}/g, '<em>สวัสดีครับ</em>')
            .replace(/{time}/g, '<span>14:30</span>');
    }

    attachEvents() {
        // Add template
        const addBtn = this.container.querySelector('#add-template');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTemplate());
        }

        // Toggle enabled
        this.container.querySelectorAll('.template-toggle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.toggleTemplate(id, e.target.checked);
            });
        });

        // Edit text
        this.container.querySelectorAll('.template-text').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.updateTemplateText(id, e.target.value);
            });
        });

        // Delete template
        this.container.querySelectorAll('.template-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteTemplate(id);
            });
        });
    }

    addTemplate() {
        const newTemplate = {
            id: Date.now(),
            text: '@{username} ',
            enabled: true
        };

        this.templates.push(newTemplate);
        this.saveTemplates();
        this.render();

        // Focus on new textarea
        setTimeout(() => {
            const newTextarea = this.container.querySelector(`textarea[data-id="${newTemplate.id}"]`);
            if (newTextarea) {
                newTextarea.focus();
                newTextarea.setSelectionRange(newTextarea.value.length, newTextarea.value.length);
            }
        }, 100);
    }

    toggleTemplate(id, enabled) {
        const template = this.templates.find(t => t.id === id);
        if (template) {
            template.enabled = enabled;
            this.saveTemplates();
            this.render();
        }
    }

    updateTemplateText(id, text) {
        const template = this.templates.find(t => t.id === id);
        if (template) {
            template.text = text;
            this.saveTemplates();
        }
    }

    deleteTemplate(id) {
        if (!confirm('ต้องการลบเทมเพลตนี้?')) return;

        this.templates = this.templates.filter(t => t.id !== id);
        this.saveTemplates();
        this.render();
    }

    getEnabledTemplates() {
        return this.templates.filter(t => t.enabled && t.text.trim() !== '');
    }

    getRandomTemplate() {
        const enabled = this.getEnabledTemplates();
        if (enabled.length === 0) {
            return '@{username} สวัสดีครับ! 👋'; // fallback
        }

        return enabled[Math.floor(Math.random() * enabled.length)].text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
