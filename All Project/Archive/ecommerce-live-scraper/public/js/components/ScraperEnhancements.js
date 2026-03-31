// Scraper Enhancements Component (Presets, Keywords, Reply Templates)
class ScraperEnhancements {
  constructor() {
    this.presets = {};
    this.keywords = [];
    this.replyTemplates = [];
  }

  async init() {
    this.loadPresets();
    this.loadKeywords();
    this.loadReplyTemplates();
    this.renderAll();
  }

  // ========== Presets ==========
  loadPresets() {
    this.presets = Storage.getPresets();
  }

  renderPresets() {
    const container = document.getElementById('presetsList');
    if (!container) return;

    const presetNames = Object.keys(this.presets);

    if (presetNames.length === 0) {
      container.innerHTML = '<div class="text-center text-secondary" style="padding: 10px;">ยังไม่มี preset</div>';
      return;
    }

    container.innerHTML = presetNames.map(name => `
      <div class="list-item" style="padding: 8px 12px; margin-bottom: 5px;">
        <span style="font-weight: 600;">${this.escapeHtml(name)}</span>
        <div class="button-group">
          <button class="btn btn-secondary btn-small" onclick="scraperEnhancements.loadPreset('${name}')">
            📥 โหลด
          </button>
          <button class="btn btn-danger btn-small" onclick="scraperEnhancements.deletePreset('${name}')">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  savePreset() {
    const name = prompt('ตั้งชื่อ preset:');
    if (!name || !name.trim()) return;

    const config = {
      platform: document.getElementById('platform').value,
      duration: parseInt(document.getElementById('duration').value),
      interval: parseInt(document.getElementById('interval').value),
      headless: document.getElementById('headless').checked,
      browser: document.getElementById('browser').value,
      authMode: document.getElementById('authMode').value,
      mode: document.getElementById('mode').value,
      replyCooldown: parseInt(document.getElementById('replyCooldown')?.value || 5),
      replyOnQuestion: document.getElementById('replyOnQuestion')?.checked || false
    };

    Storage.savePreset(name, config);
    this.presets = Storage.getPresets();
    this.renderPresets();
    alert(`✅ บันทึก preset "${name}" แล้ว!`);
  }

  loadPreset(name) {
    const preset = Storage.loadPreset(name);
    if (!preset) return;

    if (preset.platform) document.getElementById('platform').value = preset.platform;
    if (preset.duration) document.getElementById('duration').value = preset.duration;
    if (preset.interval) document.getElementById('interval').value = preset.interval;
    if (preset.headless !== undefined) document.getElementById('headless').checked = preset.headless;
    if (preset.browser) document.getElementById('browser').value = preset.browser;
    if (preset.authMode) document.getElementById('authMode').value = preset.authMode;
    if (preset.mode) document.getElementById('mode').value = preset.mode;
    if (preset.replyCooldown) document.getElementById('replyCooldown').value = preset.replyCooldown;
    if (preset.replyOnQuestion !== undefined) document.getElementById('replyOnQuestion').checked = preset.replyOnQuestion;

    // Trigger updates
    const platformSelect = document.getElementById('platform');
    platformSelect.dispatchEvent(new Event('change'));

    const modeSelect = document.getElementById('mode');
    modeSelect.dispatchEvent(new Event('change'));

    alert(`✅ โหลด preset "${name}" แล้ว!`);
  }

  deletePreset(name) {
    if (!confirm(`ต้องการลบ preset "${name}"?`)) return;

    Storage.deletePreset(name);
    this.presets = Storage.getPresets();
    this.renderPresets();
  }

  // ========== Keywords ==========
  loadKeywords() {
    this.keywords = Storage.loadKeywords();
  }

  renderKeywords() {
    const container = document.getElementById('keywordsList');
    if (!container) return;

    if (this.keywords.length === 0) {
      container.innerHTML = '<div class="text-center text-secondary" style="padding: 10px;">ยังไม่มีคำสำคัญ</div>';
      return;
    }

    container.innerHTML = this.keywords.map((keyword, index) => `
      <div class="list-item" style="padding: 8px 12px; margin-bottom: 5px;">
        <span>⚠️ ${this.escapeHtml(keyword)}</span>
        <button class="btn btn-danger btn-small" onclick="scraperEnhancements.removeKeyword(${index})">
          🗑️
        </button>
      </div>
    `).join('');
  }

  addKeyword() {
    const input = document.getElementById('keywordInput');
    if (!input) return;

    const keyword = input.value.trim();
    if (!keyword) {
      alert('กรุณาพิมพ์คำสำคัญ');
      return;
    }

    if (this.keywords.includes(keyword)) {
      alert('คำนี้มีอยู่แล้ว');
      return;
    }

    this.keywords.push(keyword);
    Storage.saveKeywords(this.keywords);
    input.value = '';
    this.renderKeywords();
  }

  removeKeyword(index) {
    this.keywords.splice(index, 1);
    Storage.saveKeywords(this.keywords);
    this.renderKeywords();
  }

  // ========== Reply Templates ==========
  loadReplyTemplates() {
    this.replyTemplates = Storage.loadReplyTemplates() || [];
  }

  renderReplyTemplates() {
    // This would be rendered in a modal or separate section
    // For now, just manage in localStorage
  }

  saveReplyTemplate() {
    const pattern = prompt('Pattern (regex หรือคำทั่วไป):');
    if (!pattern) return;

    const response = prompt('คำตอบ (ใช้ {username} แทนชื่อผู้ใช้):');
    if (!response) return;

    this.replyTemplates.push({ pattern, response });
    Storage.saveReplyTemplates(this.replyTemplates);
    alert('✅ บันทึก template แล้ว!');
  }

  // ========== Render All ==========
  renderAll() {
    this.renderPresets();
    this.renderKeywords();
    this.renderReplyTemplates();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in main app
window.ScraperEnhancements = ScraperEnhancements;
