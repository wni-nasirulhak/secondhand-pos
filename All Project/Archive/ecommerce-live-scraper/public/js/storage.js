// LocalStorage Helper
const Storage = {
  // Save config
  saveConfig(config) {
    localStorage.setItem('scraper_config', JSON.stringify(config));
  },

  // Load config
  loadConfig() {
    const saved = localStorage.getItem('scraper_config');
    return saved ? JSON.parse(saved) : null;
  },

  // Save presets
  savePreset(name, config) {
    const presets = this.getPresets();
    presets[name] = {
      ...config,
      savedAt: Date.now()
    };
    localStorage.setItem('scraper_presets', JSON.stringify(presets));
  },

  // Get all presets
  getPresets() {
    const saved = localStorage.getItem('scraper_presets');
    return saved ? JSON.parse(saved) : {};
  },

  // Delete preset
  deletePreset(name) {
    const presets = this.getPresets();
    delete presets[name];
    localStorage.setItem('scraper_presets', JSON.stringify(presets));
  },

  // Load preset
  loadPreset(name) {
    const presets = this.getPresets();
    return presets[name] || null;
  },

  // Save user lists
  saveUserLists(lists) {
    localStorage.setItem('user_lists', JSON.stringify(lists));
  },

  // Load user lists
  loadUserLists() {
    const saved = localStorage.getItem('user_lists');
    return saved ? JSON.parse(saved) : { blacklist: [], whitelist: [], viplist: [] };
  },

  // Save keywords
  saveKeywords(keywords) {
    localStorage.setItem('keywords', JSON.stringify(keywords));
  },

  // Load keywords
  loadKeywords() {
    const saved = localStorage.getItem('keywords');
    return saved ? JSON.parse(saved) : [];
  },

  // Save reply templates
  saveReplyTemplates(templates) {
    localStorage.setItem('reply_templates', JSON.stringify(templates));
  },

  // Load reply templates
  loadReplyTemplates() {
    const saved = localStorage.getItem('reply_templates');
    return saved ? JSON.parse(saved) : [];
  },

  // Save webhooks
  saveWebhooks(webhooks) {
    localStorage.setItem('webhooks', JSON.stringify(webhooks));
  },

  // Load webhooks
  loadWebhooks() {
    const saved = localStorage.getItem('webhooks');
    return saved ? JSON.parse(saved) : [];
  },

  // Clear all
  clearAll() {
    localStorage.clear();
  }
};
