// Webhook Manager Component
class WebhookManager {
  constructor() {
    this.webhooks = [];
    this.editingId = null;
  }

  async init() {
    await this.loadWebhooks();
    this.render();
  }

  async loadWebhooks() {
    try {
      const result = await API.getWebhooks();
      if (result.success) {
        this.webhooks = result.webhooks;
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
    }
  }

  render() {
    const container = document.getElementById('webhookContent');
    container.innerHTML = `
      <div class="tab-panel">
        <div class="panel-header">
          <div>
            <h2>🔌 Webhook Integrations</h2>
            <p class="panel-subtitle">Forward extracted comments to external services in real-time</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary btn-small" onclick="webhookManager.showAddForm()">
              ➕ ADD WEBHOOK
            </button>
          </div>
        </div>
        
        <div class="card-v2">
          <div class="card-header-v2">
            <h3 class="card-title-v2">📡 Active Endpoints (${this.webhooks.length})</h3>
            <span class="text-tertiary" style="font-size: 0.75rem;">JSON POST READY</span>
          </div>
          <div class="card-body-v2" style="padding: 0;">
            ${this.renderWebhookList()}
          </div>
        </div>

        <div id="webhookFormContainer"></div>
      </div>
    `;
  }

  renderWebhookList() {
    if (this.webhooks.length === 0) {
      return `
        <div class="empty-state" style="padding: 60px 20px;">
          <div class="empty-state-icon">🔌</div>
          <p>No webhooks configured</p>
          <p class="text-small">Add a Discord, Slack or Custom URL to start forwarding data</p>
        </div>
      `;
    }

    return this.webhooks.map(webhook => `
      <div class="list-item-v2" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 1.5rem; background: var(--bg-primary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            ${this.getPlatformIcon(webhook.platform)}
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px; display: flex; align-items: center; gap: 8px;">
              ${webhook.platform.toUpperCase()}
              ${webhook.enabled ? '<span class="feature-badge" style="background: hsla(var(--g-h), 79%, 42%, 0.1); color: var(--accent-green); border-color: hsla(var(--g-h), 79%, 42%, 0.2); font-size: 0.65rem;">ACTIVE</span>' : '<span class="feature-badge inactive" style="font-size: 0.65rem;">PAUSED</span>'}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-tertiary); font-family: monospace;">
              ${this.truncateUrl(webhook.url || 'TELEGRAM BOT')}
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-small" onclick="webhookManager.testWebhook('${webhook.id}')" title="Test Connection">
            🧪
          </button>
          <button class="btn btn-secondary btn-small" onclick="webhookManager.editWebhook('${webhook.id}')" title="Edit Configuration">
            ✏️
          </button>
          <button class="btn btn-danger btn-small" onclick="webhookManager.deleteWebhook('${webhook.id}')" title="Remove Integration">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  showAddForm() {
    this.editingId = null;
    this.renderForm();
  }

  editWebhook(id) {
    this.editingId = id;
    this.renderForm();
  }

  renderForm() {
    const container = document.getElementById('webhookFormContainer');
    const webhook = this.editingId ? this.webhooks.find(w => w.id === this.editingId) : null;
    const isEdit = !!webhook;

    container.innerHTML = `
      <div class="card-v2" style="margin-top: 24px;">
        <div class="card-header-v2">
          <h3 class="card-title-v2">${isEdit ? '✏️ Configure' : '➕ Create New'} Integration</h3>
          <button class="btn btn-secondary btn-small" onclick="webhookManager.cancelForm()">
            ✕ CANCEL
          </button>
        </div>
        <div class="card-body-v2">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
              <div class="form-group">
                <label>Target Platform</label>
                <select id="webhookPlatform" onchange="webhookManager.updateFormFields()">
                  <option value="discord" ${webhook?.platform === 'discord' ? 'selected' : ''}>Discord Webhook</option>
                  <option value="slack" ${webhook?.platform === 'slack' ? 'selected' : ''}>Slack Webhook</option>
                  <option value="telegram" ${webhook?.platform === 'telegram' ? 'selected' : ''}>Telegram Bot API</option>
                  <option value="custom" ${webhook?.platform === 'custom' ? 'selected' : ''}>Custom HTTP Endpoint (POST)</option>
                </select>
              </div>

              <div id="webhookFields">
                ${this.renderPlatformFields(webhook?.platform || 'discord', webhook)}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="checkbox-item" style="margin-bottom: 20px;">
                  <input type="checkbox" id="webhookEnabled" ${webhook?.enabled !== false ? 'checked' : ''}>
                  <label for="webhookEnabled">ENABLE INTEGRATION</label>
                </div>
                <p class="text-tertiary" style="font-size: 0.8rem; line-height: 1.5;">
                  Active webhooks will trigger automatically for every comment matching your filters in the Scraper tab.
                </p>
              </div>

              <div class="button-group mt-3" style="display: flex; gap: 12px;">
                <button class="btn btn-primary" style="flex: 1;" onclick="webhookManager.saveWebhook()">
                  💾 SAVE CHANGES
                </button>
                <button class="btn btn-secondary" onclick="webhookManager.cancelForm()">
                  DISCARD
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateFormFields() {
    const platform = document.getElementById('webhookPlatform').value;
    document.getElementById('webhookFields').innerHTML = this.renderPlatformFields(platform);
  }

  renderPlatformFields(platform, webhook = null) {
    switch (platform) {
      case 'discord':
      case 'slack':
        return `
          <div class="form-group">
            <label>Webhook URL</label>
            <input type="url" id="webhookUrl" value="${webhook?.url || ''}" 
              placeholder="https://discord.com/api/webhooks/..." required>
            <small class="text-secondary">วาง webhook URL ที่ได้จาก ${platform === 'discord' ? 'Discord' : 'Slack'}</small>
          </div>
        `;

      case 'telegram':
        return `
          <div class="form-group">
            <label>Bot Token</label>
            <input type="text" id="telegramToken" value="${webhook?.token || ''}" 
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" required>
          </div>
          <div class="form-group">
            <label>Chat ID</label>
            <input type="text" id="telegramChatId" value="${webhook?.chatId || ''}" 
              placeholder="-1001234567890" required>
          </div>
        `;

      case 'custom':
        return `
          <div class="form-group">
            <label>Webhook URL</label>
            <input type="url" id="webhookUrl" value="${webhook?.url || ''}" 
              placeholder="https://your-server.com/webhook" required>
            <small class="text-secondary">จะส่ง POST request พร้อม JSON ของคอมเมนต์</small>
          </div>
        `;

      default:
        return '';
    }
  }

  async saveWebhook() {
    const platform = document.getElementById('webhookPlatform').value;
    const enabled = document.getElementById('webhookEnabled').checked;

    let webhookData = { platform, enabled };

    if (platform === 'telegram') {
      const token = document.getElementById('telegramToken').value;
      const chatId = document.getElementById('telegramChatId').value;
      
      if (!token || !chatId) {
        alert('กรุณากรอกข้อมูลให้ครบ');
        return;
      }

      webhookData.token = token;
      webhookData.chatId = chatId;
    } else {
      const url = document.getElementById('webhookUrl').value;
      
      if (!url) {
        alert('กรุณากรอก URL');
        return;
      }

      webhookData.url = url;
    }

    try {
      let result;
      if (this.editingId) {
        result = await API.updateWebhook(this.editingId, webhookData);
      } else {
        result = await API.addWebhook(webhookData);
      }

      if (result.success) {
        alert(this.editingId ? 'อัปเดตสำเร็จ!' : 'เพิ่มสำเร็จ!');
        await this.loadWebhooks();
        this.cancelForm();
        this.render();
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  async testWebhook(id) {
    try {
      const result = await API.testWebhook(id);
      if (result.success) {
        alert('✅ ส่ง webhook สำเร็จ! ตรวจสอบที่ destination');
      } else {
        alert('❌ ส่งไม่สำเร็จ: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  async deleteWebhook(id) {
    if (!confirm('ต้องการลบ webhook นี้?')) return;

    try {
      const result = await API.deleteWebhook(id);
      if (result.success) {
        await this.loadWebhooks();
        this.render();
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  }

  cancelForm() {
    this.editingId = null;
    document.getElementById('webhookFormContainer').innerHTML = '';
  }

  getPlatformIcon(platform) {
    const icons = {
      discord: '💬',
      slack: '💼',
      telegram: '✈️',
      custom: '🔗'
    };
    return icons[platform] || '🔗';
  }

  truncateUrl(url) {
    if (url.length > 50) {
      return url.substring(0, 47) + '...';
    }
    return url;
  }
}

// Export for use in main app
window.WebhookManager = WebhookManager;
