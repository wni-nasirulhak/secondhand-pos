// Component สำหรับแสดงประวัติคอมเมนต์ทั้งหมด
export class CommentHistory {
    constructor(container, api = null) {
        this.container = container;
        this.api = api;
        this.histories = [];
        this.render();
        this.loadHistories();
    }

    render() {
        this.container.innerHTML = `
            <div class="comment-history">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h2>📜 ประวัติคอมเมนต์</h2>
                    <button id="btn-refresh-history" class="btn btn-small" style="background: var(--accent-primary);">
                        🔄 รีเฟรช
                    </button>
                </div>
                
                <div id="history-list" style="max-height: 600px; overflow-y: auto;">
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        ⏳ กำลังโหลด...
                    </div>
                </div>
            </div>
        `;

        // Attach events
        const btnRefresh = this.container.querySelector('#btn-refresh-history');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => this.loadHistories());
        }
    }

    async loadHistories() {
        const listContainer = this.container.querySelector('#history-list');
        if (!listContainer) return;

        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                ⏳ กำลังโหลด...
            </div>
        `;

        try {
            const response = await fetch('/api/comment-histories');
            const data = await response.json();

            if (data.success && data.histories && data.histories.length > 0) {
                this.histories = data.histories;
                this.renderHistoryList();
            } else {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        📭 ยังไม่มีประวัติ<br>
                        <small>เริ่มดึงคอมเมนต์เพื่อสร้างประวัติ</small>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading histories:', error);
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-error);">
                    ❌ เกิดข้อผิดพลาดในการโหลด
                </div>
            `;
        }
    }

    renderHistoryList() {
        const listContainer = this.container.querySelector('#history-list');
        if (!listContainer) return;

        listContainer.innerHTML = this.histories.map(history => `
            <div class="history-card" style="
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 15px;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <strong style="color: var(--text-primary); font-size: 16px;">${this.escapeHtml(history.filename)}</strong>
                        <br>
                        <small style="color: var(--text-secondary);">
                            📅 ${history.date} | ⏰ ${history.time}
                        </small>
                    </div>
                    <div style="text-align: right;">
                        <div style="
                            background: var(--accent-primary);
                            color: white;
                            padding: 5px 12px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                        ">
                            💬 ${history.count} คอมเมนต์
                        </div>
                        <small style="color: var(--text-secondary); display: block; margin-top: 5px;">
                            ${this.formatFileSize(history.size)}
                        </small>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn btn-small" onclick="window.viewHistory('${this.escapeHtml(history.filename)}')" style="flex: 1; background: var(--accent-secondary);">
                        👁️ ดู
                    </button>
                    <button class="btn btn-small" onclick="window.downloadHistory('${this.escapeHtml(history.filename)}')" style="flex: 1; background: #00d97e;">
                        📥 ดาวน์โหลด
                    </button>
                    <button class="btn btn-small" onclick="window.deleteHistory('${this.escapeHtml(history.filename)}')" style="background: #f46a6a;">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // Setup global handlers
        window.viewHistory = (filename) => this.viewHistory(filename);
        window.downloadHistory = (filename) => this.downloadHistory(filename);
        window.deleteHistory = (filename) => this.deleteHistory(filename);
    }

    async viewHistory(filename) {
        try {
            const response = await fetch(`/api/comment-histories/${encodeURIComponent(filename)}`);
            const data = await response.json();

            if (data.success && data.comments) {
                this.showCommentModal(filename, data.comments);
            } else {
                alert('❌ ไม่สามารถโหลดคอมเมนต์ได้');
            }
        } catch (error) {
            console.error('Error viewing history:', error);
            alert('❌ เกิดข้อผิดพลาด');
        }
    }

    showCommentModal(filename, comments) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
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
        `;

        modal.innerHTML = `
            <div style="
                background: var(--bg-primary);
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; color: var(--text-primary);">📜 ${this.escapeHtml(filename)}</h2>
                    <button id="close-modal" style="
                        background: transparent;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: var(--text-secondary);
                    ">×</button>
                </div>
                
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    ${comments.map((c, i) => `
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 8px;
                            padding: 12px;
                            margin-bottom: 10px;
                        ">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <strong style="color: var(--accent-primary);">${this.escapeHtml(c.username)}</strong>
                                <small style="color: var(--text-secondary);">${new Date(c.timestamp).toLocaleString('th-TH')}</small>
                            </div>
                            <div style="color: var(--text-primary);">${this.escapeHtml(c.comment)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="padding: 20px; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-secondary);">
                    ทั้งหมด ${comments.length} คอมเมนต์
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on click outside or close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        const closeBtn = modal.querySelector('#close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }
    }

    downloadHistory(filename) {
        window.open(`/api/comment-histories/${encodeURIComponent(filename)}/download`, '_blank');
    }

    async deleteHistory(filename) {
        if (!confirm(`ต้องการลบ ${filename} ใช่หรือไม่?`)) return;

        try {
            const response = await fetch(`/api/comment-histories/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ ลบสำเร็จ');
                this.loadHistories();
            } else {
                alert('❌ ไม่สามารถลบได้: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting history:', error);
            alert('❌ เกิดข้อผิดพลาด');
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
