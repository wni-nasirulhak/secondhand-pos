// Statistics Dashboard Component
class StatsDashboard {
  constructor() {
    this.stats = null;
    this.refreshInterval = null;
  }

  async init() {
    await this.loadStats();
    this.startAutoRefresh();
  }

  async loadStats() {
    try {
      const result = await API.getStats();
      if (result.success) {
        this.stats = result.stats;
        this.render();
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  render() {
    const container = document.getElementById('statsContent');
    
    if (!this.stats || this.stats.totalComments === 0) {
      container.innerHTML = `
        <div class="tab-panel">
          <div class="panel-header">
            <div>
              <h2>📊 สถิติการทำงาน</h2>
              <p class="panel-subtitle">แสดงข้อมูลสถิติการรับคอมเมนต์แบบเรียลไทม์</p>
            </div>
          </div>
          ${this.renderEmptyState()}
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="tab-panel">
        <div class="panel-header">
          <div>
            <h2>📈 Performance Analytics</h2>
            <p class="panel-subtitle">Real-time engagement metrics and platform distribution</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary btn-small" onclick="statsDashboard.loadStats()">
              🔄 REFRESH
            </button>
          </div>
        </div>

        <div class="panel-body">
          <!-- Overview Stats -->
          <div class="stats-grid-v2">
            ${this.renderTotalCommentsCard()}
            ${this.renderCommentsPerMinuteCard()}
            ${this.renderPlatformBreakdownCard()}
            ${this.renderUptimeCard()}
          </div>

          <!-- Top Users -->
          <div class="card-v2">
            <div class="card-header-v2">
              <h3 class="card-title-v2">👥 Top Users</h3>
              <span class="text-secondary">${this.stats.topUsers?.length || 0} users</span>
            </div>
            <div class="card-body-v2">
              ${this.renderTopUsers()}
            </div>
          </div>

          <!-- Timeline Chart -->
          <div class="card-v2">
            <div class="card-header-v2">
              <h3 class="card-title-v2">📈 Timeline</h3>
              <span class="text-secondary">Last ${this.stats.timeline?.length || 0} minutes</span>
            </div>
            <div class="card-body-v2">
              ${this.renderTimeline()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📈</div>
        <p>No statistics available yet</p>
        <p class="text-small">Start the scraper to begin tracking metrics</p>
      </div>
    `;
  }

  renderTotalCommentsCard() {
    return `
      <div class="stat-card-v2">
        <div class="stat-icon">💬</div>
        <div class="stat-value">${this.stats.totalComments.toLocaleString()}</div>
        <div class="stat-label">TOTAL EXTRACTED</div>
      </div>
    `;
  }

  renderCommentsPerMinuteCard() {
    const cpm = this.stats.commentsPerMinute || 0;
    return `
      <div class="stat-card-v2">
        <div class="stat-icon">⚡</div>
        <div class="stat-value">${cpm.toFixed(1)}</div>
        <div class="stat-label">COMMENTS / MIN</div>
      </div>
    `;
  }

  renderPlatformBreakdownCard() {
    const platforms = Object.entries(this.stats.platformBreakdown || {});
    if (platforms.length === 0) {
      return `
        <div class="stat-card-v2">
          <div class="stat-icon">🌐</div>
          <div class="stat-value">0</div>
          <div class="stat-label">PLATFORMS</div>
        </div>
      `;
    }

    const platformsList = platforms.map(([platform, count]) => {
      const emoji = this.getPlatformEmoji(platform);
      const percentage = ((count / this.stats.totalComments) * 100).toFixed(1);
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>${emoji}</span>
            <span style="font-weight: 600; font-size: 0.85rem;">${platform.toUpperCase()}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-weight: 700; color: var(--accent-pink); font-size: 0.9rem;">${count}</span>
            <span style="font-size: 0.75rem; color: var(--text-tertiary);">${percentage}%</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="stat-card-v2" style="text-align: left; height: auto;">
        <div class="stat-label" style="text-align: left; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">PLATFORM REACH</div>
        <div style="width: 100%;">
          ${platformsList}
        </div>
      </div>
    `;
  }

  renderUptimeCard() {
    const uptime = this.stats.uptime || 0;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const uptimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return `
      <div class="stat-card-v2">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value" style="font-size: 1.4rem; font-family: 'Courier New', monospace;">${uptimeStr}</div>
        <div class="stat-label">SESSION DURATION</div>
      </div>
    `;
  }

  renderTopUsers() {
    if (!this.stats.topUsers || this.stats.topUsers.length === 0) {
      return `
        <div class="empty-state" style="padding: 40px 20px;">
          <div class="empty-state-icon" style="font-size: 3rem;">👥</div>
          <p class="text-secondary">ยังไม่มีข้อมูลผู้ใช้</p>
        </div>
      `;
    }

    const usersList = this.stats.topUsers.slice(0, 10).map((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      const rankColor = index === 0 ? 'var(--accent-yellow)' : index === 1 ? 'var(--text-secondary)' : index === 2 ? 'var(--accent-red)' : 'var(--text-tertiary)';
      
      return `
        <div class="list-item-v2" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="font-size: 1rem; color: ${rankColor}; font-weight: 800; min-width: 40px;">${medal || `#${index + 1}`}</span>
            <div>
              <div style="font-weight: 700; color: var(--text-primary);">${this.escapeHtml(user.username)}</div>
              <div style="font-size: 0.75rem; color: var(--text-tertiary);">Member</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: var(--accent-pink); font-size: 1.1rem;">${user.count}</div>
            <div style="font-size: 0.65rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.1em;">Messages</div>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="list-v2">${usersList}</div>`;
  }

  renderTimeline() {
    if (!this.stats.timeline || this.stats.timeline.length === 0) {
      return `
        <div class="empty-state" style="padding: 40px 20px;">
          <div class="empty-state-icon" style="font-size: 3rem;">📈</div>
          <p class="text-secondary">ยังไม่มีข้อมูล Timeline</p>
        </div>
      `;
    }

    const maxCount = Math.max(...this.stats.timeline.map(t => t.count), 1);
    
    const bars = this.stats.timeline.map((point, index) => {
      const height = (point.count / maxCount) * 100;
      const time = new Date(point.timestamp).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="position: relative; width: 100%; height: 200px; display: flex; align-items: flex-end; justify-content: center;">
            <div class="timeline-bar" style="
              width: 85%;
              height: ${height || 5}%;
              min-height: 5px;
              background: linear-gradient(180deg, var(--accent-pink) 0%, var(--accent-purple) 100%);
              border-radius: 6px 6px 0 0;
              transition: all 0.3s ease;
              cursor: pointer;
              position: relative;
              box-shadow: 0 -4px 10px rgba(254, 44, 85, 0.3);
            " 
            onmouseover="this.style.transform='scaleY(1.05)'; this.style.boxShadow='0 -6px 15px rgba(254, 44, 85, 0.5)';"
            onmouseout="this.style.transform='scaleY(1)'; this.style.boxShadow='0 -4px 10px rgba(254, 44, 85, 0.3)';"
            title="${point.count} คอมเมนต์ เวลา ${time}">
              <div style="
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-primary);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 700;
                color: var(--accent-pink);
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.3s;
              " class="bar-tooltip">${point.count}</div>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary); font-weight: 500;">${time}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="chart-section" style="padding: 20px;">
        <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 10px;">
          ${bars}
        </div>
        <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
          <span style="color: var(--text-secondary); font-size: 0.8rem;">
            📊 DATA RETENTION: ${this.stats.timeline.length} MIN HISTORY | PEAK: ${maxCount} MSG/MIN
          </span>
        </div>
      </div>
      <style>
        .timeline-bar:hover .bar-tooltip {
          opacity: 1 !important;
        }
      </style>
    `;
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadStats();
    }, 5000); // Refresh every 5 seconds
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  destroy() {
    this.stopAutoRefresh();
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
window.StatsDashboard = StatsDashboard;
