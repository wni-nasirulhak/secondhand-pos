// Blacklist/Whitelist/VIP User Manager Component
export class UserListManager {
    constructor(container, storage = null) {
        this.container = container;
        this.storage = storage;
        this.blacklist = this.loadList('blacklist');
        this.whitelist = this.loadList('whitelist');
        this.viplist = this.loadList('viplist');
        this.render();
    }

    loadList(key) {
        if (!this.storage) return [];
        return this.storage.get(`user_${key}`) || [];
    }

    saveLists() {
        if (!this.storage) return;
        this.storage.set('user_blacklist', this.blacklist);
        this.storage.set('user_whitelist', this.whitelist);
        this.storage.set('user_viplist', this.viplist);
    }

    render() {
        this.container.innerHTML = `
            <div class="user-list-manager">
                <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">👥</span>
                    จัดการผู้ใช้
                </h3>

                <!-- Add User Form -->
                <div style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 20px;
                ">
                    <h4 style="margin-bottom: 12px;">➕ เพิ่มผู้ใช้</h4>
                    
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <input 
                            type="text" 
                            id="add-username" 
                            placeholder="ใส่ username..."
                            style="
                                flex: 1;
                                min-width: 200px;
                                padding: 10px;
                                background: var(--bg-input);
                                border: 1px solid var(--border-color);
                                border-radius: 8px;
                                color: var(--text-primary);
                            "
                        />
                        
                        <select id="add-list-type" style="
                            padding: 10px;
                            background: var(--bg-input);
                            border: 1px solid var(--border-color);
                            border-radius: 8px;
                            color: var(--text-primary);
                        ">
                            <option value="blacklist">🚫 Blacklist (ไม่ตอบ)</option>
                            <option value="whitelist">✅ Whitelist (ตอบทันที)</option>
                            <option value="viplist">⭐ VIP (พิเศษ)</option>
                        </select>
                        
                        <button id="btn-add-user" class="btn btn-small" style="background: #00d97e;">
                            ➕ เพิ่ม
                        </button>
                    </div>
                </div>

                <!-- User Lists Tabs -->
                <div class="user-tabs" style="
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid var(--border-color);
                ">
                    <button class="user-tab active" data-tab="blacklist" style="
                        padding: 10px 20px;
                        background: transparent;
                        border: none;
                        border-bottom: 3px solid transparent;
                        cursor: pointer;
                        color: var(--text-secondary);
                        font-weight: 600;
                        transition: all 0.3s;
                    ">
                        🚫 Blacklist (<span id="blacklist-count">0</span>)
                    </button>
                    <button class="user-tab" data-tab="whitelist" style="
                        padding: 10px 20px;
                        background: transparent;
                        border: none;
                        border-bottom: 3px solid transparent;
                        cursor: pointer;
                        color: var(--text-secondary);
                        font-weight: 600;
                        transition: all 0.3s;
                    ">
                        ✅ Whitelist (<span id="whitelist-count">0</span>)
                    </button>
                    <button class="user-tab" data-tab="viplist" style="
                        padding: 10px 20px;
                        background: transparent;
                        border: none;
                        border-bottom: 3px solid transparent;
                        cursor: pointer;
                        color: var(--text-secondary);
                        font-weight: 600;
                        transition: all 0.3s;
                    ">
                        ⭐ VIP (<span id="viplist-count">0</span>)
                    </button>
                </div>

                <!-- Search Box -->
                <div style="margin-bottom: 15px;">
                    <input 
                        type="text" 
                        id="search-users" 
                        placeholder="🔍 ค้นหาผู้ใช้..."
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

                <!-- User List Content -->
                <div id="blacklist-content" class="user-list-content"></div>
                <div id="whitelist-content" class="user-list-content" style="display: none;"></div>
                <div id="viplist-content" class="user-list-content" style="display: none;"></div>
            </div>
        `;

        this.attachEvents();
        this.updateLists();
    }

    attachEvents() {
        // Add user button
        const btnAdd = this.container.querySelector('#btn-add-user');
        const inputUsername = this.container.querySelector('#add-username');
        const selectListType = this.container.querySelector('#add-list-type');

        if (btnAdd && inputUsername && selectListType) {
            btnAdd.addEventListener('click', () => {
                const username = inputUsername.value.trim();
                const listType = selectListType.value;
                
                if (username) {
                    this.addUser(username, listType);
                    inputUsername.value = '';
                }
            });

            // Enter key to add
            inputUsername.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    btnAdd.click();
                }
            });
        }

        // Tab switching
        const tabs = this.container.querySelectorAll('.user-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Search
        const searchInput = this.container.querySelector('#search-users');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsers(e.target.value.toLowerCase());
            });
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabs = this.container.querySelectorAll('.user-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
                tab.style.borderBottomColor = 'var(--accent-primary)';
                tab.style.color = 'var(--text-primary)';
            } else {
                tab.classList.remove('active');
                tab.style.borderBottomColor = 'transparent';
                tab.style.color = 'var(--text-secondary)';
            }
        });

        // Update content
        const contents = this.container.querySelectorAll('.user-list-content');
        contents.forEach(content => {
            content.style.display = content.id === `${tabName}-content` ? 'block' : 'none';
        });
    }

    addUser(username, listType) {
        // Remove from other lists first
        this.blacklist = this.blacklist.filter(u => u !== username);
        this.whitelist = this.whitelist.filter(u => u !== username);
        this.viplist = this.viplist.filter(u => u !== username);

        // Add to target list
        if (listType === 'blacklist' && !this.blacklist.includes(username)) {
            this.blacklist.push(username);
            this.showNotification(`🚫 เพิ่ม ${username} ใน Blacklist`, 'info');
        } else if (listType === 'whitelist' && !this.whitelist.includes(username)) {
            this.whitelist.push(username);
            this.showNotification(`✅ เพิ่ม ${username} ใน Whitelist`, 'success');
        } else if (listType === 'viplist' && !this.viplist.includes(username)) {
            this.viplist.push(username);
            this.showNotification(`⭐ เพิ่ม ${username} ใน VIP`, 'success');
        }

        this.saveLists();
        this.updateLists();
    }

    removeUser(username, listType) {
        if (!confirm(`ต้องการลบ ${username} ออกจาก ${listType}?`)) return;

        if (listType === 'blacklist') {
            this.blacklist = this.blacklist.filter(u => u !== username);
        } else if (listType === 'whitelist') {
            this.whitelist = this.whitelist.filter(u => u !== username);
        } else if (listType === 'viplist') {
            this.viplist = this.viplist.filter(u => u !== username);
        }

        this.saveLists();
        this.updateLists();
        this.showNotification(`ลบ ${username} แล้ว`, 'info');
    }

    updateLists() {
        // Update counts
        this.updateElement('#blacklist-count', this.blacklist.length);
        this.updateElement('#whitelist-count', this.whitelist.length);
        this.updateElement('#viplist-count', this.viplist.length);

        // Update content
        this.renderList('blacklist', this.blacklist, '🚫', '#f46a6a');
        this.renderList('whitelist', this.whitelist, '✅', '#00d97e');
        this.renderList('viplist', this.viplist, '⭐', '#FFD700');
    }

    renderList(listType, users, icon, color) {
        const container = this.container.querySelector(`#${listType}-content`);
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
                    <p>ยังไม่มีผู้ใช้ใน ${listType}</p>
                    <small>เพิ่มผู้ใช้จากด้านบนได้เลย</small>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="
                display: grid;
                gap: 10px;
            ">
                ${users.map(username => `
                    <div class="user-item" data-username="${this.escapeHtml(username)}" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 15px;
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-color);
                        border-left: 3px solid ${color};
                        border-radius: 8px;
                        transition: all 0.3s;
                    " onmouseover="this.style.borderColor='${color}'" onmouseout="this.style.borderColor='var(--border-color)'">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">${icon}</span>
                            <strong style="color: var(--text-primary);">${this.escapeHtml(username)}</strong>
                        </div>
                        <button 
                            class="btn-remove-user" 
                            data-username="${this.escapeHtml(username)}"
                            data-list="${listType}"
                            style="
                                background: #f46a6a;
                                border: none;
                                padding: 6px 12px;
                                border-radius: 6px;
                                color: white;
                                cursor: pointer;
                                font-size: 12px;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.background='#d63031'"
                            onmouseout="this.style.background='#f46a6a'"
                        >
                            🗑️ ลบ
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // Attach remove events
        container.querySelectorAll('.btn-remove-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                const listType = btn.dataset.list;
                this.removeUser(username, listType);
            });
        });
    }

    filterUsers(query) {
        const items = this.container.querySelectorAll('.user-item');
        items.forEach(item => {
            const username = item.dataset.username.toLowerCase();
            item.style.display = username.includes(query) ? 'flex' : 'none';
        });
    }

    updateElement(selector, value) {
        const el = this.container.querySelector(selector);
        if (el) el.textContent = value;
    }

    // Check if user is in blacklist
    isBlacklisted(username) {
        return this.blacklist.includes(username);
    }

    // Check if user is in whitelist
    isWhitelisted(username) {
        return this.whitelist.includes(username);
    }

    // Check if user is VIP
    isVIP(username) {
        return this.viplist.includes(username);
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
