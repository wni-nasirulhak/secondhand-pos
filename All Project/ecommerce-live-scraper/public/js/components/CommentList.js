// Component สำหรับแสดงรายการคอมเมนต์
export class CommentList {
    constructor(container) {
        this.container = container;
        this.comments = [];
        this.filteredComments = [];
        this.searchQuery = '';
        this.filterType = 'all'; // all, questions
        this.sortBy = 'newest'; // newest, oldest
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="comment-list">
                <div class="comment-header">
                    <h2>💬 คอมเมนต์ที่ดึงได้</h2>
                    <div class="comment-stats">
                        <span class="stat">
                            <span class="stat-icon">📊</span>
                            <span id="comment-count">0</span> คอมเมนต์
                        </span>
                    </div>
                </div>
                
                <!-- Search & Filter Bar -->
                <div class="comment-filters" style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 15px;
                ">
                    <!-- Search Box -->
                    <div style="margin-bottom: 10px;">
                        <input 
                            type="text" 
                            id="comment-search" 
                            placeholder="🔍 ค้นหา username หรือข้อความ..."
                            style="
                                width: 100%;
                                padding: 12px;
                                background: var(--bg-input);
                                border: 1px solid var(--border-color);
                                border-radius: 8px;
                                color: var(--text-primary);
                                font-size: 14px;
                            "
                        />
                    </div>
                    
                    <!-- Filter Options -->
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                        <select id="filter-type" style="
                            flex: 1;
                            min-width: 150px;
                            padding: 10px;
                            background: var(--bg-input);
                            border: 1px solid var(--border-color);
                            border-radius: 6px;
                            color: var(--text-primary);
                            cursor: pointer;
                        ">
                            <option value="all">📋 ทั้งหมด</option>
                            <option value="questions">❓ เฉพาะคำถาม</option>
                        </select>
                        
                        <select id="sort-by" style="
                            flex: 1;
                            min-width: 150px;
                            padding: 10px;
                            background: var(--bg-input);
                            border: 1px solid var(--border-color);
                            border-radius: 6px;
                            color: var(--text-primary);
                            cursor: pointer;
                        ">
                            <option value="newest">🕐 ใหม่สุด → เก่าสุด</option>
                            <option value="oldest">🕑 เก่าสุด → ใหม่สุด</option>
                        </select>
                        
                        <button id="clear-filters" class="btn btn-small" style="
                            background: var(--bg-input);
                            border: 1px solid var(--border-color);
                            padding: 10px 15px;
                            cursor: pointer;
                        " title="ล้างการกรอง">
                            ✖️ ล้าง
                        </button>
                    </div>
                    
                    <!-- Filter Stats -->
                    <div id="filter-stats" style="
                        margin-top: 12px;
                        padding-top: 12px;
                        border-top: 1px solid var(--border-color);
                        font-size: 13px;
                        color: var(--text-secondary);
                    "></div>
                </div>

                <div id="comments-container" class="comments-container">
                    <div class="empty-state">
                        <span class="empty-icon">📭</span>
                        <p>ยังไม่มีคอมเมนต์</p>
                        <small>กดปุ่ม "เริ่มดึงคอมเมนต์" เพื่อเริ่มต้น</small>
                    </div>
                </div>
            </div>
        `;

        this.attachFilterEvents();
    }
    
    attachFilterEvents() {
        // Search input with debounce
        const searchInput = this.container.querySelector('#comment-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value.toLowerCase().trim();
                    this.applyFilters();
                }, 300); // Debounce 300ms
            });
        }
        
        // Filter type
        const filterType = this.container.querySelector('#filter-type');
        if (filterType) {
            filterType.addEventListener('change', (e) => {
                this.filterType = e.target.value;
                this.applyFilters();
            });
        }
        
        // Sort by
        const sortBy = this.container.querySelector('#sort-by');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }
        
        // Clear filters
        const clearBtn = this.container.querySelector('#clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }
    
    clearFilters() {
        this.searchQuery = '';
        this.filterType = 'all';
        this.sortBy = 'newest';
        
        const searchInput = this.container.querySelector('#comment-search');
        const filterType = this.container.querySelector('#filter-type');
        const sortBy = this.container.querySelector('#sort-by');
        
        if (searchInput) searchInput.value = '';
        if (filterType) filterType.value = 'all';
        if (sortBy) sortBy.value = 'newest';
        
        this.applyFilters();
    }
    
    isQuestion(comment) {
        const text = comment.toLowerCase();
        const thaiQuestions = ['ไหม', 'หรือ', 'อะไร', 'ทำไม', 'เมื่อไหร่', 'ที่ไหน', 'ยังไง', 'คือ', 'มั้ย', 'หรอ', 'เหรอ', 'ไร'];
        const englishQuestions = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should'];
        
        if (text.includes('?')) return true;
        if (thaiQuestions.some(word => text.includes(word))) return true;
        
        const words = text.trim().split(/\s+/);
        if (words.length > 0 && englishQuestions.includes(words[0])) return true;
        
        return false;
    }
    
    applyFilters() {
        let filtered = [...this.comments];
        
        // Apply search
        if (this.searchQuery) {
            filtered = filtered.filter(c => 
                c.username.toLowerCase().includes(this.searchQuery) ||
                c.comment.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // Apply filter type
        if (this.filterType === 'questions') {
            filtered = filtered.filter(c => this.isQuestion(c.comment));
        }
        
        // Apply sort
        if (this.sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (this.sortBy === 'oldest') {
            filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        
        this.filteredComments = filtered;
        this.updateCommentList();
        this.updateFilterStats();
    }
    
    updateFilterStats() {
        const statsDiv = this.container.querySelector('#filter-stats');
        if (!statsDiv) return;
        
        const total = this.comments.length;
        const filtered = this.filteredComments.length;
        const questions = this.comments.filter(c => this.isQuestion(c.comment)).length;
        
        let statsHTML = `<strong>สถิติ:</strong> `;
        
        if (this.searchQuery || this.filterType !== 'all') {
            statsHTML += `แสดง <strong style="color: var(--accent-primary);">${filtered}</strong> จาก ${total} คอมเมนต์`;
        } else {
            statsHTML += `ทั้งหมด ${total} คอมเมนต์`;
        }
        
        statsHTML += ` | คำถาม: ${questions} รายการ`;
        
        if (this.searchQuery) {
            statsHTML += ` | 🔍 ค้นหา: "<strong>${this.escapeHtml(this.searchQuery)}</strong>"`;
        }
        
        statsDiv.innerHTML = statsHTML;
    }

    addComment(comment) {
        // Check for duplicates
        const exists = this.comments.some(c => 
            c.username === comment.username && 
            c.comment === comment.comment &&
            c.timestamp === comment.timestamp
        );

        if (!exists) {
            this.comments.unshift(comment); // Add to beginning
            this.applyFilters(); // Re-apply filters
        }
    }

    updateCommentList() {
        const container = this.container.querySelector('#comments-container');
        const countEl = this.container.querySelector('#comment-count');

        if (countEl) {
            countEl.textContent = this.comments.length;
        }

        if (this.filteredComments.length === 0 && this.comments.length === 0) {
            // No comments at all
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>ยังไม่มีคอมเมนต์</p>
                    <small>กดปุ่ม "เริ่มดึงคอมเมนต์" เพื่อเริ่มต้น</small>
                </div>
            `;
        } else if (this.filteredComments.length === 0) {
            // No results after filtering
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🔍</span>
                    <p>ไม่พบผลลัพธ์</p>
                    <small>ลองค้นหาด้วยคำอื่นหรือล้างตัวกรอง</small>
                </div>
            `;
        } else {
            // Show filtered comments
            container.innerHTML = this.filteredComments.map((comment, index) => {
                const isQuestionComment = this.isQuestion(comment.comment);
                const highlightedUsername = this.highlightText(comment.username, this.searchQuery);
                const highlightedComment = this.highlightText(comment.comment, this.searchQuery);
                
                return `
                    <div class="comment-item" style="
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 12px;
                        transition: all 0.3s;
                        ${isQuestionComment ? 'border-left: 3px solid #f39c12;' : ''}
                    " onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                        <div class="comment-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <strong class="comment-username" style="color: var(--accent-primary); font-size: 15px;">
                                    ${highlightedUsername}
                                </strong>
                                ${isQuestionComment ? '<span style="background: #f39c12; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">❓ คำถาม</span>' : ''}
                            </div>
                            <span class="comment-time" style="color: var(--text-secondary); font-size: 12px;">
                                ${this.formatTime(comment.timestamp)}
                            </span>
                        </div>
                        <div class="comment-text" style="color: var(--text-primary); line-height: 1.5;">
                            ${highlightedComment}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    highlightText(text, query) {
        if (!query) return this.escapeHtml(text);
        
        const escapedText = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(query);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        return escapedText.replace(regex, '<mark style="background: #ffeb3b; color: #000; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;
        if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
        if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;

        return date.toLocaleString('th-TH', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getComments() {
        return this.comments;
    }

    clear() {
        this.comments = [];
        this.filteredComments = [];
        this.searchQuery = '';
        this.clearFilters();
    }

    setComments(comments) {
        this.comments = comments || [];
        this.applyFilters();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
