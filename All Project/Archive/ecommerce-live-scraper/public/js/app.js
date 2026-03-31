// Main Application
class ScraperApp {
  constructor() {
    this.isRunning = false;
    this.comments = [];
    this.currentTab = 'scraper';
    this.refreshInterval = null;
    this.uptimeInterval = null;
    this.startTime = null;

    this.init();
  }

  init() {
    console.log('🚀 Initializing E-commerce Live Scraper...');

    // Initialize UI
    this.initTabs();
    this.initAccordions();
    this.initEventListeners();
    this.loadSavedConfig();

    // Start status polling
    this.startStatusPolling();

    console.log('✅ App initialized');
  }

  // ========== Tab Management ==========
  initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabName}`);
    });

    this.currentTab = tabName;

    // Load tab content
    this.loadTabContent(tabName);
  }

  loadTabContent(tabName) {
    switch (tabName) {
      case 'stats':
        this.loadStats();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'webhook':
        this.loadWebhooks();
        break;
      case 'history':
        this.loadHistory();
        break;
      case 'errors':
        this.loadErrors();
        break;
      case 'ai-reply':
        this.loadAIReply();
        break;
      case 'mock-rules':
        this.loadMockRules();
        break;
    }
  }

  // ========== Accordion Management ==========
  initAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
      const header = accordion.querySelector('.accordion-header');
      header.addEventListener('click', () => {
        accordion.classList.toggle('open');
      });
    });
  }

  // ========== Event Listeners ==========
  initEventListeners() {
    // Start/Stop buttons
    document.getElementById('startBtn').addEventListener('click', () => this.startScraper());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopScraper());

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => this.refreshComments());

    // Platform selector
    document.getElementById('platform').addEventListener('change', (e) => {
      this.updatePlatformPlaceholder(e.target.value);
    });

    // Auth mode selector
    document.getElementById('authMode').addEventListener('change', (e) => {
      this.toggleAuthSections(e.target.value);
    });

    // Mode selector
    document.getElementById('mode').addEventListener('change', (e) => {
      this.toggleReplySettings(e.target.value);
    });

    // Chrome path finder
    document.getElementById('findChromeBtn')?.addEventListener('click', () => this.findChromePath());

    // Cookie management
    document.getElementById('checkCookiesBtn')?.addEventListener('click', () => this.checkCookies());
    document.getElementById('importCookiesBtn')?.addEventListener('click', () => this.importCookies());

    // Download buttons
    document.getElementById('downloadJsonBtn')?.addEventListener('click', () => this.downloadJSON());
    document.getElementById('downloadCsvBtn')?.addEventListener('click', () => this.downloadCSV());

    // Clear comments
    document.getElementById('clearCommentsBtn')?.addEventListener('click', () => this.clearComments());

    // Search
    document.getElementById('searchBtn')?.addEventListener('click', () => this.searchComments());
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchComments();
    });

    // Keyword alerts
    document.getElementById('keywordAlertsEnabled')?.addEventListener('change', (e) => {
      this.toggleKeywordAlerts(e.target.checked);
    });

    // Preset management
    document.getElementById('savePresetBtn')?.addEventListener('click', () => {
      if (!window.scraperEnhancements) {
        window.scraperEnhancements = new ScraperEnhancements();
      }
      window.scraperEnhancements.savePreset();
    });

    // Keyword alerts
    document.getElementById('addKeywordBtn')?.addEventListener('click', () => {
      if (!window.scraperEnhancements) {
        window.scraperEnhancements = new ScraperEnhancements();
      }
      window.scraperEnhancements.addKeyword();
    });

    // Reply templates
    document.getElementById('manageTemplatesBtn')?.addEventListener('click', () => {
      if (!window.scraperEnhancements) {
        window.scraperEnhancements = new ScraperEnhancements();
      }
      window.scraperEnhancements.saveReplyTemplate();
    });

    // Initialize enhancements
    if (!window.scraperEnhancements) {
      window.scraperEnhancements = new ScraperEnhancements();
      window.scraperEnhancements.init();
    }
  }

  // ========== Config Management ==========
  loadSavedConfig() {
    const config = Storage.loadConfig();
    if (config) {
      document.getElementById('platform').value = config.platform || 'tiktok';
      document.getElementById('url').value = config.url || '';
      document.getElementById('duration').value = config.duration || 60;
      document.getElementById('interval').value = config.interval || 3;
      document.getElementById('headless').checked = config.headless || false;
      document.getElementById('browser').value = config.browser || 'chromium';
      document.getElementById('authMode').value = config.authMode || 'storage';
      document.getElementById('mode').value = config.mode || 'read';

      // Trigger updates
      this.updatePlatformPlaceholder(config.platform);
      this.toggleAuthSections(config.authMode);
      this.toggleReplySettings(config.mode);
    }
  }

  getCurrentConfig() {
    return {
      platform: document.getElementById('platform').value,
      url: document.getElementById('url').value,
      duration: parseInt(document.getElementById('duration').value),
      interval: parseInt(document.getElementById('interval').value),
      headless: document.getElementById('headless').checked,
      browser: document.getElementById('browser').value,
      authMode: document.getElementById('authMode').value,
      mode: document.getElementById('mode').value,
      reply: {
        enabled: document.getElementById('mode').value === 'respond',
        cooldown: parseInt(document.getElementById('replyCooldown')?.value || 5),
        onQuestion: document.getElementById('replyOnQuestion')?.checked || false,
        aiWebhookUrl: document.getElementById('aiWebhookUrl')?.value || null,
        hostUsername: document.getElementById('hostUsername')?.value || null
      },
      filters: this.getUserFilters()
    };
  }

  getUserFilters() {
    const blacklistText = document.getElementById('blacklist')?.value || '';
    const whitelistText = document.getElementById('whitelist')?.value || '';
    const viplistText = document.getElementById('viplist')?.value || '';

    return {
      blacklist: blacklistText.split('\n').filter(u => u.trim()),
      whitelist: whitelistText.split('\n').filter(u => u.trim()),
      viplist: viplistText.split('\n').filter(u => u.trim())
    };
  }

  // ========== UI Updates ==========
  updatePlatformPlaceholder(platform) {
    const placeholders = {
      tiktok: 'https://www.tiktok.com/@username/live',
      shopee: 'https://live.shopee.co.th/...',
      lazada: 'https://pages.lazada.co.th/wow/...'
    };
    document.getElementById('url').placeholder = placeholders[platform] || 'https://...';
  }

  toggleAuthSections(mode) {
    const chromeSection = document.getElementById('chromeProfileSection');
    const storageSection = document.getElementById('storageStateSection');

    chromeSection.style.display = mode === 'chrome' ? 'block' : 'none';
    storageSection.style.display = mode === 'storage' ? 'block' : 'none';
  }

  toggleReplySettings(mode) {
    const replySettings = document.getElementById('replySettings');
    replySettings.style.display = mode === 'respond' ? 'block' : 'none';
  }

  toggleKeywordAlerts(enabled) {
    const section = document.getElementById('keywordAlertsSection');
    section.style.display = enabled ? 'block' : 'none';
  }

  // ========== Scraper Control ==========
  async startScraper() {
    const config = this.getCurrentConfig();

    // Validate
    if (!config.url) {
      alert('กรุณาใส่ Live URL');
      return;
    }

    // Save config
    Storage.saveConfig(config);

    // Disable button
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = true;
    startBtn.textContent = '⏳ กำลังเริ่ม...';

    try {
      const result = await API.startScraper(config);

      if (result.success) {
        this.isRunning = true;
        this.startTime = Date.now();
        document.getElementById('stopBtn').disabled = false;
        startBtn.textContent = '▶️ เริ่มรับคอมเมนต์';
        this.updateStatusBadge('running');

        // Start auto-refresh
        this.startAutoRefresh();
        this.startUptimeCounter();

        this.showNotification('✅ เริ่มรับคอมเมนต์สำเร็จ!', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      startBtn.disabled = false;
      startBtn.textContent = '▶️ เริ่มรับคอมเมนต์';
      this.showNotification('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  }

  async stopScraper() {
    const stopBtn = document.getElementById('stopBtn');
    stopBtn.disabled = true;
    stopBtn.textContent = '⏳ กำลังหยุด...';

    try {
      const result = await API.stopScraper();

      if (result.success) {
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
        stopBtn.textContent = '⏹️ หยุด';
        this.updateStatusBadge('idle');

        // Stop auto-refresh
        this.stopAutoRefresh();
        this.stopUptimeCounter();

        this.showNotification('✅ หยุดรับคอมเมนต์สำเร็จ!', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      stopBtn.disabled = false;
      stopBtn.textContent = '⏹️ หยุด';
      this.showNotification('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  }

  // ========== Comments Management ==========
  async refreshComments() {
    try {
      const result = await API.getComments(100);
      if (result.success) {
        this.comments = result.comments;
        this.renderComments();
      }
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  }

  renderComments(commentsToRender = null) {
    const commentsList = document.getElementById('commentsList');
    const comments = commentsToRender || this.comments;

    if (comments.length === 0) {
      commentsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <p>ยังไม่มีคอมเมนต์</p>
          <p class="text-small">กด "เริ่มรับคอมเมนต์" เพื่อเริ่มดึงข้อมูล</p>
        </div>
      `;
      return;
    }

    commentsList.innerHTML = comments.map(comment => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-username">${this.escapeHtml(comment.username)}</span>
          <span class="comment-platform ${comment.platform}">
            ${this.getPlatformEmoji(comment.platform)} ${comment.platform.toUpperCase()}
          </span>
        </div>
        <div class="comment-text">${this.escapeHtml(comment.comment)}</div>
        <div class="comment-timestamp">${new Date(comment.timestamp).toLocaleString('th-TH')}</div>
      </div>
    `).join('');

    // Update count
    document.getElementById('commentCountDisplay').textContent = `${comments.length} รายการ`;
  }

  searchComments() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) {
      this.renderComments();
      return;
    }

    const filtered = this.comments.filter(c =>
      c.username.toLowerCase().includes(query) ||
      c.comment.toLowerCase().includes(query)
    );

    this.renderComments(filtered);
  }

  async clearComments() {
    if (!confirm('ต้องการล้างคอมเมนต์ทั้งหมด?')) return;

    try {
      await API.clearComments();
      this.comments = [];
      this.renderComments();
      this.showNotification('✅ ล้างคอมเมนต์สำเร็จ!', 'success');
    } catch (error) {
      this.showNotification('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  }

  // ========== Status Polling ==========
  startStatusPolling() {
    this.updateStatus();
    setInterval(() => this.updateStatus(), 2000);
  }

  async updateStatus() {
    try {
      const status = await API.getStatus();

      if (status.running && !this.isRunning) {
        this.isRunning = true;
        this.startAutoRefresh();
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('startBtn').disabled = true;
        this.updateStatusBadge('running');
      } else if (!status.running && this.isRunning) {
        this.isRunning = false;
        this.stopAutoRefresh();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        this.updateStatusBadge('idle');
      }

      document.getElementById('commentCount').textContent = status.commentsCount;

      if (status.config) {
        const emoji = this.getPlatformEmoji(status.config.platform);
        document.getElementById('currentPlatform').textContent = 
          `${emoji} ${status.config.platform.toUpperCase()}`;
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  }

  updateStatusBadge(status) {
    const badge = document.getElementById('statusBadge');
    if (status === 'running') {
      badge.className = 'status-badge running';
      badge.textContent = '🟢 กำลังทำงาน';
    } else {
      badge.className = 'status-badge idle';
      badge.textContent = '⚪ พร้อมใช้งาน';
    }
  }

  // ========== Auto Refresh ==========
  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.refreshComments();
    }, 3000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // ========== Uptime Counter ==========
  startUptimeCounter() {
    this.uptimeInterval = setInterval(() => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;

      document.getElementById('uptime').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
  }

  stopUptimeCounter() {
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
      this.uptimeInterval = null;
    }
    document.getElementById('uptime').textContent = '00:00:00';
  }

  // ========== Tab Content Loaders ==========
  async loadStats() {
    if (!window.statsDashboard) {
      window.statsDashboard = new StatsDashboard();
    }
    await window.statsDashboard.init();
  }

  async loadUsers() {
    if (!window.userListManager) {
      window.userListManager = new UserListManager();
    }
    await window.userListManager.init();
  }

  async loadWebhooks() {
    if (!window.webhookManager) {
      window.webhookManager = new WebhookManager();
    }
    await window.webhookManager.init();
  }

  async loadHistory() {
    if (!window.historyViewer) {
      window.historyViewer = new HistoryViewer();
    }
    await window.historyViewer.init();
  }

  async loadErrors() {
    if (!window.errorTracker) {
      window.errorTracker = new ErrorTracker();
    }
    window.errorTracker.init();
  }

  async loadAIReply() {
    if (!window.aiReplyManager) {
      window.aiReplyManager = new AIReplyManager();
    }
    await window.aiReplyManager.init();
  }

  async loadMockRules() {
    if (!window.mockRulesEditor) {
      window.mockRulesEditor = new MockRulesEditor();
    }
    await window.mockRulesEditor.init();
  }

  // ========== Helper Methods ==========
  async findChromePath() {
    try {
      const result = await API.findChromePath();
      if (result.success && result.path) {
        document.getElementById('chromePath').value = result.path;
        this.showNotification('✅ พบ Chrome Profile!', 'success');
      }
    } catch (error) {
      this.showNotification('❌ ไม่พบ Chrome Profile', 'error');
    }
  }

  async checkCookies() {
    try {
      const result = await API.checkCookies();
      if (result.exists) {
        this.showNotification(`✅ พบคุกกี้ ${result.cookieCount} รายการ`, 'success');
      } else {
        this.showNotification('⚠️ ยังไม่มีคุกกี้', 'warning');
      }
    } catch (error) {
      this.showNotification('❌ เกิดข้อผิดพลาด', 'error');
    }
  }

  async importCookies() {
    const cookiesJson = prompt('วาง JSON คุกกี้ที่นี่:');
    if (!cookiesJson) return;

    try {
      const result = await API.importCookies(cookiesJson);
      if (result.success) {
        this.showNotification('✅ นำเข้าคุกกี้สำเร็จ!', 'success');
      }
    } catch (error) {
      this.showNotification('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  }

  downloadJSON() {
    const dataStr = JSON.stringify(this.comments, null, 2);
    this.downloadFile(dataStr, `comments_${Date.now()}.json`, 'application/json');
  }

  downloadCSV() {
    const csv = this.convertToCSV(this.comments);
    this.downloadFile(csv, `comments_${Date.now()}.csv`, 'text/csv');
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = ['Platform', 'Username', 'Comment', 'Timestamp'];
    const rows = data.map(item => [
      item.platform,
      item.username,
      item.comment.replace(/"/g, '""'),
      item.timestamp
    ]);

    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];

    return '\ufeff' + csvRows.join('\n'); // BOM for UTF-8
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  showNotification(message, type = 'info') {
    // Simple notification (can be enhanced with toast library)
    console.log(`[${type.toUpperCase()}]`, message);
    if (type === 'error') {
      alert(message);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getPlatformEmoji(platform) {
    const emojis = {
      tiktok: '🎵',
      shopee: '🛒',
      lazada: '📦'
    };
    return emojis[platform] || '🌐';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ScraperApp();
});
