// API Helper Functions
const API = {
  baseURL: '',

  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(this.baseURL + endpoint, options);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Platforms
  async getPlatforms() {
    return await this.request('GET', '/api/platforms');
  },

  // Scraper
  async startScraper(config) {
    return await this.request('POST', '/api/start', config);
  },

  async stopScraper() {
    return await this.request('POST', '/api/stop');
  },

  async getStatus() {
    return await this.request('GET', '/api/status');
  },

  async getComments(limit = 100) {
    return await this.request('GET', `/api/comments?limit=${limit}`);
  },

  async clearComments() {
    return await this.request('DELETE', '/api/comments');
  },

  // Webhooks
  async getWebhooks() {
    return await this.request('GET', '/api/webhooks');
  },

  async addWebhook(webhook) {
    return await this.request('POST', '/api/webhooks', webhook);
  },

  async updateWebhook(id, webhook) {
    return await this.request('PUT', `/api/webhooks/${id}`, webhook);
  },

  async deleteWebhook(id) {
    return await this.request('DELETE', `/api/webhooks/${id}`);
  },

  async testWebhook(id) {
    return await this.request('POST', `/api/webhooks/${id}/test`);
  },

  // Users
  async getUserLists() {
    return await this.request('GET', '/api/users/all');
  },

  async updateBlacklist(blacklist) {
    return await this.request('POST', '/api/users/blacklist', { blacklist });
  },

  async updateWhitelist(whitelist) {
    return await this.request('POST', '/api/users/whitelist', { whitelist });
  },

  async updateVIPList(viplist) {
    return await this.request('POST', '/api/users/viplist', { viplist });
  },

  // Stats
  async getStats() {
    return await this.request('GET', '/api/stats');
  },

  // History
  async getHistories(platform) {
    return await this.request('GET', `/api/histories?platform=${platform}`);
  },

  async deleteHistory(platform, id) {
    return await this.request('DELETE', `/api/histories/${platform}/${id}`);
  },

  // Chrome Profile
  async findChromePath() {
    return await this.request('GET', '/api/find-chrome-path');
  },

  async checkCookies() {
    return await this.request('GET', '/api/check-cookies');
  },

  async importCookies(cookiesJson) {
    return await this.request('POST', '/api/import-cookies', { cookiesJson });
  },

  // AI Webhook Server
  async startAI(config) {
    return await this.request('POST', '/api/ai/start', config);
  },

  async stopAI() {
    return await this.request('POST', '/api/ai/stop');
  },

  async getAIStatus() {
    return await this.request('GET', '/api/ai/status');
  },

  async getAILogs(limit = 20) {
    return await this.request('GET', `/api/ai/logs?limit=${limit}`);
  },

  async clearAILogs() {
    return await this.request('DELETE', '/api/ai/logs');
  },

  async updateAIConfig(config) {
    return await this.request('POST', '/api/ai/config', config);
  },

  // Mock Rules
  async getMockRules() {
    return await this.request('GET', '/api/mock-rules');
  },

  async saveMockRules(rules) {
    return await this.request('POST', '/api/mock-rules', { rules });
  },

  async testMockRule(rule, testComment) {
    return await this.request('POST', '/api/mock-rules/test', { rule, testComment });
  }
};
