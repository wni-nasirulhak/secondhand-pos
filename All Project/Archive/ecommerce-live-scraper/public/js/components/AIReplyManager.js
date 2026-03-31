// AI Reply Manager Component
class AIReplyManager {
  constructor() {
    this.status = null;
    this.logs = [];
    this.config = {
      aiMode: 'mock',
      apiKey: '',
      systemPrompt: 'คุณคือ AI ผู้ช่วยตอบคอมเมนต์ใน Live สด ตอบเป็นภาษาไทย สั้น กระชับ เป็นมิตร',
      replyDelay: 300
    };
  }

  async init() {
    await this.loadStatus();
    this.render();
    this.startStatusPolling();
  }

  async loadStatus() {
    try {
      const result = await API.getAIStatus();
      this.status = result;
    } catch (error) {
      console.error('Error loading AI status:', error);
    }
  }

  async loadLogs() {
    try {
      const result = await API.getAILogs(20);
      if (result.logs) {
        this.logs = result.logs;
        this.renderLogs();
      }
    } catch (error) {
      console.error('Error loading AI logs:', error);
    }
  }

  render() {
    const container = document.getElementById('aiReplyContent');
    const isRunning = this.status?.running || false;

    container.innerHTML = `
      <div class="tab-panel">
        <div class="panel-header">
          <div>
            <h2>🧠 AI Automation</h2>
            <p class="panel-subtitle">Manage real-time AI responses and interaction logs</p>
          </div>
          <div class="header-actions">
            <span class="status-badge ${isRunning ? 'running' : 'idle'}">
              ${isRunning ? '🟢 SYSTEM ACTIVE' : '⚪ SYSTEM STANDBY'}
            </span>
          </div>
        </div>

        <div class="stats-grid-v2">
          <div class="stat-card-v2">
            <div class="stat-icon">🔋</div>
            <div class="stat-value">${isRunning ? 'Online' : 'Offline'}</div>
            <div class="stat-label">AI ENGINE STATUS</div>
          </div>
          <div class="stat-card-v2">
            <div class="stat-icon">📡</div>
            <div class="stat-value">${this.status?.port || 3099}</div>
            <div class="stat-label">LISTENING PORT</div>
          </div>
        </div>

        <div class="card-v2">
          <div class="card-header-v2">
            <h3 class="card-title-v2">⚙️ Engine Configuration</h3>
            <div class="button-group">
              ${isRunning ? `
                <button class="btn btn-danger btn-small" onclick="aiReplyManager.stopServer()">
                  ⏹️ SHUTDOWN
                </button>
              ` : `
                <button class="btn btn-primary btn-small" onclick="aiReplyManager.startServer()">
                  ▶️ INITIATE ENGINE
                </button>
              `}
            </div>
          </div>
          <div class="card-body-v2">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
              <div>
                <div class="form-group">
                  <label>Automation Mode</label>
                  <select id="aiMode" ${isRunning ? 'disabled' : ''}>
                    <option value="mock" ${this.config.aiMode === 'mock' ? 'selected' : ''}>Mock Logic (Manual Rules)</option>
                    <option value="openai" ${this.config.aiMode === 'openai' ? 'selected' : ''}>OpenAI GPT-4o</option>
                    <option value="gemini" ${this.config.aiMode === 'gemini' ? 'selected' : ''}>Google Gemini Pro</option>
                  </select>
                </div>

                <div id="apiKeySection" style="display: ${this.config.aiMode !== 'mock' ? 'block' : 'none'};">
                  <div class="form-group">
                    <label>Engine API Key</label>
                    <input type="password" id="apiKey" value="${this.config.apiKey}" 
                      placeholder="Enter API key..." ${isRunning ? 'disabled' : ''}>
                  </div>
                </div>

                <div class="form-group">
                  <label>Processing Delay (ms)</label>
                  <input type="number" id="replyDelay" value="${this.config.replyDelay}" 
                    min="0" step="100" ${isRunning ? 'disabled' : ''}>
                  <p class="text-tertiary" style="font-size: 0.75rem; margin-top: 5px;">Simulates human-like response thinking time</p>
                </div>
              </div>

              <div>
                <div class="form-group">
                  <label>System Persona / Prompt</label>
                  <textarea id="systemPrompt" rows="6" ${isRunning ? 'disabled' : ''}>${this.config.systemPrompt}</textarea>
                </div>

                ${!isRunning ? `
                  <button class="btn btn-secondary" style="width: 100%;" onclick="aiReplyManager.updateConfig()">
                    💾 SAVE CONFIGURATION
                  </button>
                ` : ''}

                ${isRunning ? `
                  <div style="padding: 15px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-top: 10px;">
                    <p class="text-secondary" style="font-size: 0.8rem; margin-bottom: 8px; font-weight: 700; text-transform: uppercase;">ACTIVE WEBHOOK</p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <code style="color: var(--accent-pink); font-family: monospace; font-size: 0.9rem;">http://localhost:${this.status.port}/webhook</code>
                      <button class="btn btn-secondary btn-small" onclick="navigator.clipboard.writeText('http://localhost:${this.status.port}/webhook')">
                        📋
                      </button>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        <div class="card-v2">
          <div class="card-header-v2">
            <h3 class="card-title-v2">📜 Execution Logs</h3>
            <div class="button-group">
              <button class="btn btn-secondary btn-small" onclick="aiReplyManager.loadLogs()">
                🔄 REFRESH
              </button>
              <button class="btn btn-danger btn-small" onclick="aiReplyManager.clearLogs()">
                🗑️ PURGE
              </button>
            </div>
          </div>
          <div id="aiLogsContainer">
            <div class="text-center text-secondary" style="padding: 40px;">Request logs will appear here during active scraping</div>
          </div>
        </div>
      </div>
    `;

    // Add event listener for AI mode change
    const aiModeSelect = document.getElementById('aiMode');
    if (aiModeSelect) {
      aiModeSelect.addEventListener('change', () => {
        this.toggleAPIKeySection();
      });
    }
  }

  toggleAPIKeySection() {
    const aiMode = document.getElementById('aiMode').value;
    const section = document.getElementById('apiKeySection');
    section.style.display = aiMode !== 'mock' ? 'block' : 'none';
  }

  renderLogs() {
    const container = document.getElementById('aiLogsContainer');

    if (!this.logs || this.logs.length === 0) {
      container.innerHTML = '<div class="text-center text-secondary" style="padding: 20px;">ไม่มี logs</div>';
      return;
    }

    container.innerHTML = this.logs.map(log => `
      <div class="list-item" style="flex-direction: column; align-items: flex-start;">
        <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
          <div style="font-weight: 600; color: var(--accent-blue);">
            👤 ${this.escapeHtml(log.username)}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-tertiary);">
            ${new Date(log.timestamp).toLocaleString('th-TH')}
          </div>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">
          💬 <strong>Comment:</strong> ${this.escapeHtml(log.comment)}
        </div>
        <div style="font-size: 0.9rem; color: var(--accent-green);">
          🤖 <strong>Reply:</strong> ${this.escapeHtml(log.reply || 'N/A')}
        </div>
      </div>
    `).join('');
  }

  async startServer() {
    try {
      const config = {
        aiMode: document.getElementById('aiMode').value,
        apiKey: document.getElementById('apiKey').value,
        systemPrompt: document.getElementById('systemPrompt').value,
        replyDelay: parseInt(document.getElementById('replyDelay').value)
      };

      const result = await API.startAI(config);
      
      if (result.success) {
        alert('✅ เริ่ม AI Server สำเร็จ!\n\nWebhook URL:\n' + result.url);
        await this.loadStatus();
        this.render();
      } else {
        alert('❌ เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  async stopServer() {
    if (!confirm('ต้องการหยุด AI Server?')) return;

    try {
      const result = await API.stopAI();
      
      if (result.success) {
        alert('✅ หยุด AI Server แล้ว');
        await this.loadStatus();
        this.render();
      } else {
        alert('❌ เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  async updateConfig() {
    this.config = {
      aiMode: document.getElementById('aiMode').value,
      apiKey: document.getElementById('apiKey').value,
      systemPrompt: document.getElementById('systemPrompt').value,
      replyDelay: parseInt(document.getElementById('replyDelay').value)
    };

    alert('✅ บันทึกการตั้งค่าแล้ว!\n\nกด "เริ่ม Server" เพื่อใช้งาน');
  }

  async clearLogs() {
    if (!confirm('ต้องการล้าง logs?')) return;

    try {
      const result = await API.clearAILogs();
      if (result.success) {
        this.logs = [];
        this.renderLogs();
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  startStatusPolling() {
    setInterval(async () => {
      await this.loadStatus();
      
      // Update status badge only
      const isRunning = this.status?.running || false;
      const badge = document.querySelector('.stat-value');
      if (badge) {
        badge.textContent = isRunning ? 'Running' : 'Stopped';
      }
    }, 5000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in main app
window.AIReplyManager = AIReplyManager;
