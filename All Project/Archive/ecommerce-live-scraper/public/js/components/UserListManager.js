// User List Manager Component (Blacklist, Whitelist, VIP)
class UserListManager {
  constructor() {
    this.lists = {
      blacklist: [],
      whitelist: [],
      viplist: []
    };
  }

  async init() {
    await this.loadLists();
    this.render();
  }

  async loadLists() {
    try {
      const result = await API.getUserLists();
      if (result.success) {
        this.lists = result.lists;
      }
    } catch (error) {
      console.error('Error loading user lists:', error);
    }
  }

  render() {
    const container = document.getElementById('usersContent');
    container.innerHTML = `
      <div class="tab-panel">
        <div class="panel-header">
          <div>
            <h2>👤 Audience Management</h2>
            <p class="panel-subtitle">Control user access and prioritize engagement</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary btn-small" onclick="userListManager.bulkImport()">
              📥 IMPORT
            </button>
            <button class="btn btn-secondary btn-small" onclick="userListManager.bulkExport()">
              📤 EXPORT
            </button>
            <button class="btn btn-danger btn-small" onclick="userListManager.clearAll()">
              🗑️ PURGE
            </button>
          </div>
        </div>
        
        <div class="stats-grid-v2">
          <div class="stat-card-v2">
            <div class="stat-icon">🚫</div>
            <div class="stat-value">${this.lists.blacklist.length}</div>
            <div class="stat-label">BLACKLISTED</div>
          </div>
          <div class="stat-card-v2">
            <div class="stat-icon">✅</div>
            <div class="stat-value">${this.lists.whitelist.length}</div>
            <div class="stat-label">WHITELISTED</div>
          </div>
          <div class="stat-card-v2">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">${this.lists.viplist.length}</div>
            <div class="stat-label">VIP MEMBERS</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
          <div class="card-v2">
            <div class="card-header-v2">
              <h3 class="card-title-v2">🚫 Restricted (Blacklist)</h3>
              <button class="btn btn-secondary btn-small" onclick="userListManager.addUser('blacklist')">
                ➕ ADD
              </button>
            </div>
            <div class="card-body-v2" style="padding: 0; max-height: 400px; overflow-y: auto;">
              ${this.renderList('blacklist')}
            </div>
          </div>

          <div class="card-v2">
            <div class="card-header-v2">
              <h3 class="card-title-v2">✅ Verified (Whitelist)</h3>
              <button class="btn btn-secondary btn-small" onclick="userListManager.addUser('whitelist')">
                ➕ ADD
              </button>
            </div>
            <div class="card-body-v2" style="padding: 0; max-height: 400px; overflow-y: auto;">
              ${this.renderList('whitelist')}
            </div>
          </div>

          <div class="card-v2">
            <div class="card-header-v2">
              <h3 class="card-title-v2">⭐ Priority (VIP List)</h3>
              <button class="btn btn-secondary btn-small" onclick="userListManager.addUser('viplist')">
                ➕ ADD
              </button>
            </div>
            <div class="card-body-v2" style="padding: 0; max-height: 400px; overflow-y: auto;">
              ${this.renderList('viplist')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderList(listType) {
    const list = this.lists[listType];
    
    if (list.length === 0) {
      return `
        <div class="empty-state" style="padding: 40px 20px;">
          <p class="text-tertiary">No users in this list</p>
        </div>
      `;
    }

    return list.map(username => `
      <div class="list-item-v2" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; background: var(--bg-primary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); border: 1px solid var(--border-color);">
            ${username.charAt(0).toUpperCase()}
          </div>
          <span style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${this.escapeHtml(username)}</span>
        </div>
        <button class="btn btn-danger btn-small" onclick="userListManager.removeUser('${listType}', '${this.escapeHtml(username)}')" style="padding: 5px 10px;">
          🗑️
        </button>
      </div>
    `).join('');
  }

  async addUser(listType) {
    const username = prompt(`เพิ่มผู้ใช้ใน ${this.getListLabel(listType)}:`);
    if (!username || !username.trim()) return;

    const trimmed = username.trim();
    
    if (this.lists[listType].includes(trimmed)) {
      alert('ผู้ใช้นี้มีอยู่แล้ว');
      return;
    }

    this.lists[listType].push(trimmed);
    await this.saveLists();
    this.render();
  }

  async removeUser(listType, username) {
    if (!confirm(`ต้องการลบ "${username}" จาก ${this.getListLabel(listType)}?`)) return;

    this.lists[listType] = this.lists[listType].filter(u => u !== username);
    await this.saveLists();
    this.render();
  }

  async bulkImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        
        if (imported.blacklist) this.lists.blacklist = [...new Set([...this.lists.blacklist, ...imported.blacklist])];
        if (imported.whitelist) this.lists.whitelist = [...new Set([...this.lists.whitelist, ...imported.whitelist])];
        if (imported.viplist) this.lists.viplist = [...new Set([...this.lists.viplist, ...imported.viplist])];
        
        await this.saveLists();
        this.render();
        alert('นำเข้าสำเร็จ!');
      } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
      }
    };
    
    input.click();
  }

  bulkExport() {
    const dataStr = JSON.stringify(this.lists, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_lists_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async clearAll() {
    if (!confirm('ต้องการล้างรายการทั้งหมด?')) return;

    this.lists = {
      blacklist: [],
      whitelist: [],
      viplist: []
    };

    await this.saveLists();
    this.render();
  }

  async saveLists() {
    try {
      await API.updateBlacklist(this.lists.blacklist);
      await API.updateWhitelist(this.lists.whitelist);
      await API.updateVIPList(this.lists.viplist);
      
      // Also save to localStorage
      Storage.saveUserLists(this.lists);
    } catch (error) {
      console.error('Error saving lists:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  }

  getListLabel(listType) {
    const labels = {
      blacklist: 'Blacklist',
      whitelist: 'Whitelist',
      viplist: 'VIP List'
    };
    return labels[listType] || listType;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in main app
window.UserListManager = UserListManager;
