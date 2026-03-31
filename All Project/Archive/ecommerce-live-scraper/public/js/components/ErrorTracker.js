// Error Tracker Component
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  init() {
    this.loadErrors();
    this.render();
    this.setupGlobalErrorHandler();
  }

  setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.addError({
        type: 'JavaScript Error',
        message: event.message,
        source: event.filename,
        line: event.lineno,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || String(event.reason),
        timestamp: Date.now()
      });
    });
  }

  addError(error) {
    this.errors.unshift({
      id: Date.now() + Math.random(),
      ...error
    });

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.saveErrors();
    this.render();
  }

  loadErrors() {
    const saved = localStorage.getItem('error_logs');
    if (saved) {
      try {
        this.errors = JSON.parse(saved);
      } catch (e) {
        this.errors = [];
      }
    }
  }

  saveErrors() {
    localStorage.setItem('error_logs', JSON.stringify(this.errors));
  }

  render() {
    const container = document.getElementById('errorsContent');

    container.innerHTML = `
      <h2 style="margin-bottom: 20px; font-size: 1.5rem;">🛡️ ข้อผิดพลาด</h2>
      
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-value">${this.errors.length}</div>
          <div class="stat-label">Total Errors</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔴</div>
          <div class="stat-value">${this.getRecentErrorsCount()}</div>
          <div class="stat-label">Last Hour</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${this.getErrorTypes().length}</div>
          <div class="stat-label">Error Types</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">🛡️ Error Logs</h3>
          <div class="button-group">
            <button class="btn btn-secondary btn-small" onclick="errorTracker.exportErrors()">
              📥 ส่งออก
            </button>
            <button class="btn btn-danger btn-small" onclick="errorTracker.clearErrors()">
              🗑️ ล้างทั้งหมด
            </button>
          </div>
        </div>
        <div style="padding: 15px;">
          ${this.renderErrorList()}
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-header">
          <h3 class="card-title">📊 Error Types</h3>
        </div>
        <div style="padding: 15px;">
          ${this.renderErrorTypes()}
        </div>
      </div>
    `;
  }

  renderErrorList() {
    if (this.errors.length === 0) {
      return '<div class="text-center text-secondary" style="padding: 20px;">ไม่มี error 🎉</div>';
    }

    return this.errors.slice(0, 20).map(error => `
      <div class="list-item" style="flex-direction: column; align-items: flex-start;">
        <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
          <div style="font-weight: 600; color: var(--accent-red);">
            ${this.getErrorIcon(error.type)} ${error.type}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-tertiary);">
            ${new Date(error.timestamp).toLocaleString('th-TH')}
          </div>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); word-break: break-word;">
          ${this.escapeHtml(error.message)}
        </div>
        ${error.source ? `
          <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 4px;">
            📁 ${error.source}${error.line ? `:${error.line}` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  renderErrorTypes() {
    const types = this.getErrorTypes();

    if (types.length === 0) {
      return '<div class="text-center text-secondary" style="padding: 20px;">ไม่มีข้อมูล</div>';
    }

    return types.map(({ type, count }) => `
      <div class="list-item">
        <span>${this.getErrorIcon(type)} ${type}</span>
        <span style="color: var(--accent-red); font-weight: 600;">${count}</span>
      </div>
    `).join('');
  }

  getErrorTypes() {
    const typeCounts = {};
    
    this.errors.forEach(error => {
      typeCounts[error.type] = (typeCounts[error.type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  getRecentErrorsCount() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return this.errors.filter(e => e.timestamp > oneHourAgo).length;
  }

  getErrorIcon(type) {
    if (type.includes('Network')) return '🌐';
    if (type.includes('API')) return '🔌';
    if (type.includes('JavaScript')) return '⚠️';
    if (type.includes('Promise')) return '🔄';
    return '❌';
  }

  clearErrors() {
    if (!confirm('ต้องการล้าง error logs ทั้งหมด?')) return;

    this.errors = [];
    this.saveErrors();
    this.render();
  }

  exportErrors() {
    const dataStr = JSON.stringify(this.errors, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in main app
window.ErrorTracker = ErrorTracker;
