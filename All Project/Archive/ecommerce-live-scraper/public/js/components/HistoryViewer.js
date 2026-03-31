// History Viewer Component
class HistoryViewer {
  constructor() {
    this.histories = [];
    this.selectedPlatform = 'tiktok';
    this.viewingHistory = null;
  }

  async init() {
    this.render();
    await this.loadHistories();
  }

  async loadHistories() {
    try {
      const result = await API.getHistories(this.selectedPlatform);
      if (result.success) {
        this.histories = result.histories;
        this.renderList();
      }
    } catch (error) {
      console.error('Error loading histories:', error);
    }
  }

  render() {
    const container = document.getElementById('historyContent');
    container.innerHTML = `
      <div class="tab-panel">
        <div class="panel-header">
          <div>
            <h2>🗂️ Archive Viewer</h2>
            <p class="panel-subtitle">Access and manage previously extracted scraping sessions</p>
          </div>
          <div class="header-actions">
            <select id="historyPlatform" class="url-input" style="width: auto; padding: 8px 16px; font-size: 0.85rem;" onchange="historyViewer.changePlatform(this.value)">
              <option value="tiktok">🎵 TikTok Archive</option>
              <option value="shopee">🛒 Shopee Archive</option>
              <option value="lazada">📦 Lazada Archive</option>
            </select>
          </div>
        </div>
        
        <div class="card-v2">
          <div class="card-header-v2">
            <h3 class="card-title-v2">📄 Session History</h3>
            <span class="text-tertiary" id="historyCountBadge">0 FILES</span>
          </div>
          <div class="card-body-v2" style="padding: 0; max-height: 500px; overflow-y: auto;">
            <div id="historyListContainer"></div>
          </div>
        </div>

        <div id="historyDetailContainer"></div>
      </div>
    `;
  }

  changePlatform(platform) {
    this.selectedPlatform = platform;
    this.viewingHistory = null;
    this.loadHistories();
  }

  renderList() {
    const container = document.getElementById('historyListContainer');
    document.getElementById('historyCountBadge').textContent = `${this.histories.length} FILES`;

    if (this.histories.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 60px 20px;">
          <div class="empty-state-icon">🗂️</div>
          <p>No archive records found</p>
          <p class="text-small">Completed scraping sessions will automatically be saved here</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.histories.map(history => `
      <div class="list-item-v2" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 25px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 1.2rem; background: var(--bg-primary); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--border-color);">
            📄
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
              ${this.escapeHtml(history.filename)}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">
              <span style="color: var(--accent-pink); font-weight: 700;">${history.count} MSG</span> • 
              <span>${this.formatFileSize(history.size)}</span> • 
              <span>${new Date(history.created).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-small" onclick="historyViewer.viewHistory('${history.filename}')" title="Preview Contents">
            👁️
          </button>
          <button class="btn btn-secondary btn-small" onclick="historyViewer.downloadHistory('${history.filename}')" title="Download File">
            📥
          </button>
          <button class="btn btn-danger btn-small" onclick="historyViewer.deleteHistory('${history.filename}')" title="Delete Permanently">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  async viewHistory(filename) {
    try {
      const response = await fetch(`/api/histories/${this.selectedPlatform}/${filename}`);
      const result = await response.json();

      if (result.success) {
        this.viewingHistory = {
          filename,
          comments: result.comments
        };
        this.renderDetail();
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  renderDetail() {
    if (!this.viewingHistory) {
      document.getElementById('historyDetailContainer').innerHTML = '';
      return;
    }

    const container = document.getElementById('historyDetailContainer');
    const { filename, comments } = this.viewingHistory;

    container.innerHTML = `
      <div class="card-v2" style="margin-top: 24px;">
        <div class="card-header-v2">
          <h3 class="card-title-v2">📄 ${filename} <small class="text-tertiary">(${comments.length} MSG)</small></h3>
          <button class="btn btn-secondary btn-small" onclick="historyViewer.closeDetail()">
            ✕ CLOSE
          </button>
        </div>
        <div class="card-body-v2" style="max-height: 600px; overflow-y: auto; background: var(--bg-primary);">
           ${comments.map(comment => `
              <div class="comment-item" style="margin-bottom: 8px;">
                <div class="comment-header">
                  <span class="comment-username">${this.escapeHtml(comment.username)}</span>
                  <span class="comment-platform ${comment.platform}">
                    ${comment.platform.toUpperCase()}
                  </span>
                </div>
                <div class="comment-text">${this.escapeHtml(comment.comment)}</div>
                <div class="comment-timestamp">${new Date(comment.timestamp).toLocaleString()}</div>
              </div>
            `).join('')}
        </div>
      </div>
    `;
  }

  closeDetail() {
    this.viewingHistory = null;
    document.getElementById('historyDetailContainer').innerHTML = '';
  }

  async downloadHistory(filename) {
    try {
      const response = await fetch(`/api/histories/${this.selectedPlatform}/${filename}/download`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  async deleteHistory(filename) {
    if (!confirm(`ต้องการลบ "${filename}"?`)) return;

    try {
      const response = await fetch(`/api/histories/${this.selectedPlatform}/${filename}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        alert('ลบสำเร็จ!');
        await this.loadHistories();
        
        if (this.viewingHistory && this.viewingHistory.filename === filename) {
          this.closeDetail();
        }
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getPlatformEmoji(platform) {
    const emojis = {
      tiktok: '🎵',
      shopee: '🛒',
      lazada: '📦'
    };
    return emojis[platform] || '🌐';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in main app
window.HistoryViewer = HistoryViewer;
