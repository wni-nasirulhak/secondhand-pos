// AI Reply Engine - Auto-reply with templates or AI
const http = require('http');

class AIReplyEngine {
  constructor(config = {}) {
    this.enabled = config.enabled || false;
    this.templates = config.templates || [];
    this.cooldown = config.cooldown || 5; // seconds
    this.replyOnQuestion = config.replyOnQuestion !== false;
    this.aiWebhookUrl = config.aiWebhookUrl || null;
    this.hostUsername = config.hostUsername || null;
    this.lastReplyTime = {};
  }

  shouldReply(comment) {
    if (!this.enabled) return false;
    
    // Don't reply to host
    if (this.hostUsername && comment.username.toLowerCase() === this.hostUsername.toLowerCase()) {
      return false;
    }
    
    // Check cooldown
    const now = Date.now();
    const lastReply = this.lastReplyTime[comment.username] || 0;
    if ((now - lastReply) / 1000 < this.cooldown) {
      return false;
    }
    
    // Check if reply on question only
    if (this.replyOnQuestion && !this.isQuestion(comment.comment)) {
      return false;
    }
    
    return true;
  }

  isQuestion(text) {
    // Check for question marks or question words
    const questionMarks = ['?', '？', 'ไหม', 'หรือ', 'อะไร', 'ยังไง', 'เมื่อไหร่', 'ที่ไหน'];
    return questionMarks.some(q => text.includes(q));
  }

  async generateReply(comment) {
    if (!this.shouldReply(comment)) {
      return null;
    }
    
    let reply;
    
    // Try AI webhook first
    if (this.aiWebhookUrl) {
      try {
        reply = await this.getAIReply(comment);
        if (reply) {
          this.updateLastReplyTime(comment.username);
          return reply;
        }
      } catch (error) {
        console.error('[AI Reply] AI webhook error:', error.message);
      }
    }
    
    // Fall back to templates
    reply = this.getTemplateReply(comment);
    if (reply) {
      this.updateLastReplyTime(comment.username);
      return reply;
    }
    
    return null;
  }

  async getAIReply(comment) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.aiWebhookUrl);
      const postData = JSON.stringify({
        username: comment.username,
        comment: comment.comment,
        platform: comment.platform
      });

      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.reply || null);
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(3000, () => {
        req.destroy();
        reject(new Error('AI webhook timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  getTemplateReply(comment) {
    if (this.templates.length === 0) return null;
    
    // Find matching template
    for (const template of this.templates) {
      if (this.matchesPattern(comment.comment, template.pattern)) {
        return this.interpolateTemplate(template.response, comment);
      }
    }
    
    // Random template if no match
    const randomTemplate = this.templates[Math.floor(Math.random() * this.templates.length)];
    return this.interpolateTemplate(randomTemplate.response, comment);
  }

  matchesPattern(text, pattern) {
    if (!pattern) return true; // No pattern = always match
    
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  }

  interpolateTemplate(template, comment) {
    return template
      .replace(/{username}/g, comment.username)
      .replace(/{platform}/g, comment.platform);
  }

  updateLastReplyTime(username) {
    this.lastReplyTime[username] = Date.now();
  }

  updateConfig(config) {
    if (config.enabled !== undefined) this.enabled = config.enabled;
    if (config.templates) this.templates = config.templates;
    if (config.cooldown !== undefined) this.cooldown = config.cooldown;
    if (config.replyOnQuestion !== undefined) this.replyOnQuestion = config.replyOnQuestion;
    if (config.aiWebhookUrl !== undefined) this.aiWebhookUrl = config.aiWebhookUrl;
    if (config.hostUsername !== undefined) this.hostUsername = config.hostUsername;
  }

  getStats() {
    return {
      enabled: this.enabled,
      templateCount: this.templates.length,
      cooldown: this.cooldown,
      replyOnQuestion: this.replyOnQuestion,
      hasAIWebhook: !!this.aiWebhookUrl
    };
  }
}

module.exports = AIReplyEngine;
