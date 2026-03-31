// Mock Rules Editor Component
class MockRulesEditor {
  constructor() {
    this.rules = [];
    this.editingIndex = null;
    this.currentCategory = 'all';
    this.categories = {
      shipping: { icon: '📦', name: 'Shipping', color: '#3b82f6' },
      payment: { icon: '💳', name: 'Payment/Channel', color: '#8b5cf6' },
      promotion: { icon: '🎁', name: 'Promotion', color: '#f59e0b' },
      trust: { icon: '✅', name: 'Trust/Quality', color: '#10b981' },
      order: { icon: '📋', name: 'Order/CF', color: '#06b6d4' },
      greeting: { icon: '👋', name: 'Greeting', color: '#ec4899' },
      compliment: { icon: '🎉', name: 'Compliment/Support', color: '#f43f5e' },
      question: { icon: '❓', name: 'Question', color: '#a855f7' }
    };
  }

  async init() {
    await this.loadRules();
    // Load default rules if empty
    if (this.rules.length === 0) {
      this.loadDefaultRules();
    }
    this.render();
  }

  async loadRules() {
    try {
      const result = await API.getMockRules();
      if (result.success) {
        this.rules = result.rules || [];
      }
    } catch (error) {
      console.error('Error loading mock rules:', error);
    }
  }

  loadDefaultRules() {
    this.rules = [
      // Shipping
      {
        category: 'shipping',
        keywords: ['ส่งฟรี', 'ค่าส่ง', 'จัดส่ง', 'เก็บเงินปลายทาง', 'COD', 'ส่งไว', 'ส่งด่วน', 'flash', 'kerry'],
        replies: [
          'ส่งฟรีทั่วไทยค่ะ 🚚 ไม่มีขั้นต่ำ!',
          'ใช้ Kerry Express ส่งไวมากค่ะ ⚡ 1-3 วัน',
          'รองรับเก็บเงินปลายทางนะคะ (COD) 💰',
          'ส่งฟรี! ส่งไว! ส่งทุกวันค่ะ 📦'
        ]
      },
      // Payment/Channel
      {
        category: 'payment',
        keywords: ['จ่ายยังไง', 'ชำระเงิน', 'ผ่อน', 'บัตร', 'wallet', 'พร้อมเพย์', 'โอน'],
        replies: [
          'รับชำระทุกช่องทางค่ะ 💳 บัตร, โอน, พร้อมเพย์, Wallet ครบ!',
          'ผ่อน 0% ได้นะคะ 🎯 ผ่านบัตรเครดิต',
          'โอนได้เลยค่ะ พร้อมเพย์สะดวกสุด! 💸'
        ]
      },
      // Promotion
      {
        category: 'promotion',
        keywords: ['ลด', 'โปร', 'flash sale', 'แถม', 'ของแถม', 'โค้ด', 'voucher'],
        replies: [
          'วันนี้มีโปรพิเศษ! 🔥 ลด 1 แถม 1 รีบจับด่วน!',
          'มี Flash Sale ทุกวันค่ะ ⚡ ติดตามได้เลย!',
          'ใช้โค้ด "LIVE10" ลดเพิ่ม 10% นะคะ! 🎁'
        ]
      },
      // Trust/Quality
      {
        category: 'trust',
        keywords: ['แท้ไหม', 'ของแท้', 'รับประกัน', 'คุณภาพ', 'เชื่อถือได้'],
        replies: [
          'ของแท้ 100% ค่ะ ✅ รับประกันคุณภาพ!',
          'มีใบรับรองนะคะ 📜 เชื่อถือได้แน่นอน!',
          'รับประกันสินค้า ภายใน 30 วันค่ะ 🛡️'
        ]
      },
      // Order/CF
      {
        category: 'order',
        keywords: ['สั่ง', 'ซื้อ', 'อยากได้', 'จอง', 'จองคิว', 'CF', 'สต็อก'],
        replies: [
          'สั่งได้เลยค่ะ! 📝 มีสต็อกพร้อมส่งทันที!',
          'กดสั่งได้เลยนะคะ 🛒 ของพร้อมส่ง!',
          'ลงทะเบียนจองได้นะคะ! 📋 รีบด่วน! ⚡'
        ]
      },
      // Greeting
      {
        category: 'greeting',
        keywords: ['สวัสดี', 'หวัดดี', 'hello', 'hi', 'ค่ะ', 'ครับ'],
        replies: [
          'สวัสดีค่ะ! ❤️ ยินดีต้อนรับนะคะ!',
          'หวัดดีค่ะ 🌸 มีอะไรให้ช่วยไหมคะ?',
          'Hello! 💖 ยินดีให้คำปรึกษานะคะ!'
        ]
      },
      // Compliment/Support
      {
        category: 'compliment',
        keywords: ['สวย', 'สุด', 'ชอบ', 'เท่', 'แจ่ม', 'เจ๋ง', 'เลิฟ'],
        replies: [
          'ขอบคุณมากค่ะ! 😊💕 ที่ให้กำลังใจ!',
          'ยินดีมากเลยค่ะ! 🥰 รักลูกค้าทุกคน!',
          'ขอบใจนะคะ! 🙏✨ ฝากติดตามด้วยนะคะ!'
        ]
      },
      // Question
      {
        category: 'question',
        keywords: ['อะไร', 'ไหม', 'มั้ย', 'ได้ไหม', 'ทำไม', 'เท่าไหร่', 'เมื่อไหร่'],
        replies: [
          'สามารถสอบถามได้เลยนะคะ! 💬 เรายินดีตอบทุกข้อสงสัย!',
          'ถามได้เลยค่ะ! 💭 ตอบทันทีเลย!',
          'มีคำถามไหมคะ? 🤔 ยินดีช่วยเหลือนะคะ!'
        ]
      }
    ];
    this.saveRules();
  }

  async saveRules() {
    try {
      const result = await API.saveMockRules(this.rules);
      if (result.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving mock rules:', error);
      return false;
    }
  }

  render() {
    const container = document.getElementById('mockRulesContent');

    container.innerHTML = `
      <div class="tab-panel">
        <div class="panel-header">
          <div>
            <h2>🎭 Smart Rules Engine</h2>
            <p class="panel-subtitle">Define automated responses based on keyword triggers and categories</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary btn-small" onclick="mockRulesEditor.loadDefaultRules(); mockRulesEditor.render();">
              🔄 RESET DEFAULTS
            </button>
            <button class="btn btn-primary" onclick="mockRulesEditor.showAddForm()">
              ➕ ADD NEW RULE
            </button>
          </div>
        </div>

        <!-- Category Stats Overview -->
        <div class="stats-grid-v2">
          <div class="stat-card-v2">
            <div class="stat-icon">📋</div>
            <div class="stat-value">${this.rules.length}</div>
            <div class="stat-label">TOTAL RULES</div>
          </div>
          <div class="stat-card-v2">
            <div class="stat-icon">✅</div>
            <div class="stat-value">${this.rules.filter(r => r.keywords && r.keywords.length > 0).length}</div>
            <div class="stat-label">ACTIVE TRIGGERS</div>
          </div>
          <div class="stat-card-v2">
            <div class="stat-icon">💬</div>
            <div class="stat-value">${this.getTotalReplies()}</div>
            <div class="stat-label">TOTAL REPLIES</div>
          </div>
          <div class="stat-card-v2">
            <div class="stat-icon">📁</div>
            <div class="stat-value">${Object.keys(this.categories).length}</div>
            <div class="stat-label">CATEGORIES</div>
          </div>
        </div>

        <!-- Category Tabs -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap; background: var(--bg-secondary); padding: 10px; border-radius: 8px;">
            <button 
              class="category-tab ${this.currentCategory === 'all' ? 'active' : ''}" 
              onclick="mockRulesEditor.filterCategory('all')"
              style="background: ${this.currentCategory === 'all' ? 'var(--accent-pink)' : 'var(--bg-tertiary)'}; color: ${this.currentCategory === 'all' ? 'white' : 'var(--text-secondary)'};"
            >
              🌟 ทั้งหมด (${this.rules.length})
            </button>
            ${Object.entries(this.categories).map(([key, cat]) => `
              <button 
                class="category-tab ${this.currentCategory === key ? 'active' : ''}" 
                onclick="mockRulesEditor.filterCategory('${key}')"
                style="background: ${this.currentCategory === key ? cat.color : 'var(--bg-tertiary)'}; color: ${this.currentCategory === key ? 'white' : 'var(--text-secondary)'};"
              >
                ${cat.icon} ${cat.name} (${this.rules.filter(r => r.category === key).length})
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Rules List -->
        <div class="card-v2">
          <div class="card-header-v2">
            <h3 class="card-title-v2">
              ${this.currentCategory === 'all' ? '🌟 EVERYTHING' : this.categories[this.currentCategory]?.icon + ' ' + this.categories[this.currentCategory]?.name.toUpperCase()}
            </h3>
            <div style="color: var(--text-tertiary); font-size: 0.8rem; font-weight: 700;">
              ${this.getFilteredRules().length} ACTIVE RULES
            </div>
          </div>
          <div class="card-body-v2">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 24px;">
              ${this.renderRulesList()}
            </div>
          </div>
        </div>

        <div id="ruleFormContainer"></div>

        <!-- Test Section -->
        <div class="card-v2" style="background: var(--bg-tertiary);">
          <div class="card-header-v2" style="background: rgba(255,255,255,0.03);">
            <h3 class="card-title-v2">🧪 Simulation Sandbox</h3>
          </div>
          <div class="card-body-v2">
            <div class="form-group">
              <label>SIMULATE COMMENT</label>
              <div style="display: flex; gap: 12px;">
                <input 
                  type="text" 
                  id="testComment" 
                  class="url-input"
                  placeholder="Type a test message (e.g. How much is shipping?)..." 
                  onkeypress="if(event.key==='Enter') mockRulesEditor.testRule()"
                >
                <button class="btn btn-primary" onclick="mockRulesEditor.testRule()">
                  RUN SIMULATION
                </button>
              </div>
            </div>
            <div id="testResult" style="margin-top: 20px;"></div>
          </div>
        </div>
      </div>
    `;

    this.attachCategoryTabStyles();
  }

  attachCategoryTabStyles() {
    // Inject dynamic styles for category tabs and rule cards
    if (!document.getElementById('mockRulesStyles')) {
      const style = document.createElement('style');
      style.id = 'mockRulesStyles';
      style.textContent = `
        .category-tab {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.3s;
          white-space: nowrap;
        }
        .category-tab:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .category-tab.active {
          box-shadow: var(--shadow-lg);
        }
        
        .rule-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
          transition: all 0.3s;
        }
        .rule-card:hover {
          border-color: var(--border-color-light);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        
        .rule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        
        .rule-body {
          padding: 15px;
        }
        
        .rule-section {
          margin-bottom: 15px;
        }
        .rule-section:last-child {
          margin-bottom: 0;
        }
        
        .rule-section-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .keywords-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .keyword-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(254, 44, 85, 0.15);
          border: 1px solid rgba(254, 44, 85, 0.3);
          color: var(--accent-pink);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .replies-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .reply-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: var(--bg-primary);
          border-left: 3px solid var(--accent-green);
          border-radius: 6px;
        }
        
        .reply-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          background: var(--accent-green);
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
        }
        
        .reply-text {
          flex: 1;
          color: var(--text-primary);
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `;
      document.head.appendChild(style);
    }
  }

  filterCategory(category) {
    this.currentCategory = category;
    this.render();
  }

  getFilteredRules() {
    if (this.currentCategory === 'all') {
      return this.rules;
    }
    return this.rules.filter(r => r.category === this.currentCategory);
  }

  renderRulesList() {
    const filteredRules = this.getFilteredRules();
    
    if (filteredRules.length === 0) {
      return `
        <div class="empty-state" style="padding: 40px 20px;">
          <div class="empty-state-icon">🎭</div>
          <p style="color: var(--text-secondary); font-size: 1rem;">
            ${this.currentCategory === 'all' ? 'ยังไม่มี rule' : 'ไม่มี rule ในหมวดนี้'}
          </p>
          <p class="text-small" style="color: var(--text-tertiary);">
            กด "เพิ่ม Rule ใหม่" หรือ "รีเซ็ตเป็นค่าเริ่มต้น" เพื่อเริ่มต้น
          </p>
        </div>
      `;
    }

    return filteredRules.map((rule, displayIndex) => {
      const actualIndex = this.rules.indexOf(rule);
      const category = this.categories[rule.category] || { icon: '📋', name: 'Other', color: '#808080' };
      
      return `
        <div class="rule-card" style="margin-bottom: 15px; border-left: 4px solid ${category.color};">
          <div class="rule-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">${category.icon}</span>
              <div>
                <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">
                  ${category.name} - Rule #${actualIndex + 1}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">
                  ${rule.keywords?.length || 0} keywords · ${rule.replies?.length || 0} replies
                </div>
              </div>
            </div>
            <div class="button-group">
              <button class="btn btn-secondary btn-small" onclick="mockRulesEditor.editRule(${actualIndex})" title="แก้ไข">
                ✏️
              </button>
              <button class="btn btn-danger btn-small" onclick="mockRulesEditor.deleteRule(${actualIndex})" title="ลบ">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="rule-body">
            <div class="rule-section">
              <div class="rule-section-title">🔑 Keywords</div>
              <div class="keywords-container">
                ${rule.keywords?.map(kw => `
                  <span class="keyword-badge">${this.escapeHtml(kw)}</span>
                `).join('') || '<span class="text-secondary">ไม่มี keywords</span>'}
              </div>
            </div>
            
            <div class="rule-section">
              <div class="rule-section-title">💬 Replies (${rule.replies?.length || 0})</div>
              <div class="replies-container">
                ${rule.replies?.slice(0, 3).map((reply, i) => `
                  <div class="reply-item">
                    <span class="reply-number">${i + 1}</span>
                    <span class="reply-text">${this.escapeHtml(reply)}</span>
                  </div>
                `).join('') || '<div class="text-secondary">ไม่มีคำตอบ</div>'}
                ${rule.replies?.length > 3 ? `
                  <div class="text-secondary text-small" style="margin-top: 8px;">
                    + อีก ${rule.replies.length - 3} คำตอบ
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  showAddForm() {
    this.editingIndex = null;
    this.renderForm();
  }

  editRule(index) {
    this.editingIndex = index;
    this.renderForm();
  }

  renderForm() {
    const container = document.getElementById('ruleFormContainer');
    const rule = this.editingIndex !== null ? this.rules[this.editingIndex] : null;
    const isEdit = this.editingIndex !== null;
    const selectedCategory = rule?.category || this.currentCategory !== 'all' ? this.currentCategory : 'shipping';

    container.innerHTML = `
      <div class="card mt-3" style="background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary)); border: 2px solid var(--accent-pink);">
        <div class="card-header" style="border-bottom: 2px solid var(--border-color);">
          <h3 class="card-title">${isEdit ? '✏️ แก้ไข' : '➕ เพิ่ม'} Rule</h3>
          <button class="btn btn-secondary btn-small" onclick="mockRulesEditor.cancelForm()">
            ✕ ยกเลิก
          </button>
        </div>
        <div style="padding: 25px;">
          <!-- Category Selection -->
          <div class="form-group">
            <label style="font-weight: 600;">📁 หมวดหมู่</label>
            <select id="ruleCategory" style="font-size: 1rem; padding: 12px;">
              ${Object.entries(this.categories).map(([key, cat]) => `
                <option value="${key}" ${selectedCategory === key ? 'selected' : ''}>
                  ${cat.icon} ${cat.name}
                </option>
              `).join('')}
            </select>
            <small class="text-secondary">เลือกหมวดหมู่ที่เหมาะสมกับ rule นี้</small>
          </div>

          <div style="border-top: 1px solid var(--border-color); margin: 20px 0;"></div>

          <!-- Keywords -->
          <div class="form-group">
            <label style="font-weight: 600;">🔑 Keywords (คำสำคัญที่จะ trigger rule)</label>
            <textarea 
              id="ruleKeywords" 
              rows="3" 
              placeholder="เช่น: ส่งฟรี, ค่าส่ง, จัดส่ง, COD (คั่นด้วยจุลภาค)"
              style="font-family: 'Segoe UI', sans-serif;"
            >${rule?.keywords?.join(', ') || ''}</textarea>
            <small class="text-secondary">💡 ถ้าคอมเมนต์มีคำเหล่านี้ จะใช้ rule นี้ตอบกลับ</small>
          </div>

          <!-- Replies -->
          <div class="form-group">
            <label style="font-weight: 600;">💬 Replies (คำตอบที่จะสุ่มส่ง)</label>
            <textarea 
              id="ruleReplies" 
              rows="5" 
              placeholder="คำตอบ 1&#10;คำตอบ 2&#10;คำตอบ 3&#10;&#10;(แต่ละบรรทัด = 1 คำตอบ)"
              style="font-family: 'Segoe UI', sans-serif; line-height: 1.6;"
            >${rule?.replies?.join('\n') || ''}</textarea>
            <small class="text-secondary">💡 ระบบจะสุ่มเลือกคำตอบหนึ่งจากรายการนี้ | ใช้ @username เพื่อแทนชื่อผู้ใช้</small>
          </div>

          <div style="border-top: 1px solid var(--border-color); margin: 20px 0;"></div>

          <!-- Action Buttons -->
          <div class="button-group" style="justify-content: flex-end;">
            <button class="btn btn-secondary" onclick="mockRulesEditor.cancelForm()">
              ✕ ยกเลิก
            </button>
            <button class="btn btn-primary" onclick="mockRulesEditor.saveRule()">
              💾 ${isEdit ? 'บันทึกการแก้ไข' : 'เพิ่ม Rule'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Scroll to form
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  saveRule() {
    const category = document.getElementById('ruleCategory').value;
    const keywordsText = document.getElementById('ruleKeywords').value;
    const repliesText = document.getElementById('ruleReplies').value;

    const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);
    const replies = repliesText.split('\n').map(r => r.trim()).filter(r => r);

    if (keywords.length === 0 && replies.length === 0) {
      alert('❌ กรุณาใส่ keywords หรือ replies อย่างน้อยหนึ่งอย่าง');
      return;
    }

    const rule = { category, keywords, replies };

    if (this.editingIndex !== null) {
      this.rules[this.editingIndex] = rule;
    } else {
      this.rules.push(rule);
    }

    this.saveRules();
    this.cancelForm();
    this.render();
    
    // Show success message
    this.showToast('✅ บันทึกสำเร็จ!', 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)'};
      color: white;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-weight: 600;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  deleteRule(index) {
    if (!confirm(`ต้องการลบ Rule #${index + 1}?`)) return;

    this.rules.splice(index, 1);
    this.saveRules();
    this.render();
  }

  cancelForm() {
    this.editingIndex = null;
    document.getElementById('ruleFormContainer').innerHTML = '';
  }

  async testRule() {
    const testComment = document.getElementById('testComment').value.trim();
    if (!testComment) {
      this.showToast('❌ กรุณาพิมพ์คอมเมนต์ทดสอบ', 'error');
      return;
    }

    document.getElementById('testResult').innerHTML = '<div class="text-center text-secondary">🔍 กำลังทดสอบ...</div>';

    // Test against all rules
    let matchedRules = [];
    
    for (let i = 0; i < this.rules.length; i++) {
      const rule = this.rules[i];
      const keywords = rule.keywords || [];
      
      // Check if any keyword matches
      const matched = keywords.some(kw => 
        testComment.toLowerCase().includes(kw.toLowerCase())
      );
      
      if (matched) {
        const randomReply = rule.replies?.[Math.floor(Math.random() * rule.replies.length)] || 'ไม่มีคำตอบ';
        matchedRules.push({
          index: i,
          rule: rule,
          reply: randomReply
        });
      }
    }

    if (matchedRules.length > 0) {
      const firstMatch = matchedRules[0];
      const category = this.categories[firstMatch.rule.category] || { icon: '📋', name: 'Other', color: '#808080' };
      
      document.getElementById('testResult').innerHTML = `
        <div style="padding: 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05)); border: 2px solid var(--accent-green); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <span style="font-size: 2rem;">✅</span>
            <div>
              <div style="color: var(--accent-green); font-weight: 700; font-size: 1.1rem;">พบ ${matchedRules.length} Rule ที่ตรง!</div>
              <div style="color: var(--text-secondary); font-size: 0.85rem;">ระบบจะใช้ rule แรกที่เจอ</div>
            </div>
          </div>
          
          <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid ${category.color};">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 1.3rem;">${category.icon}</span>
              <strong style="color: var(--text-primary);">${category.name} - Rule #${firstMatch.index + 1}</strong>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 10px;">
              Keywords: ${firstMatch.rule.keywords?.join(', ')}
            </div>
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 3px solid var(--accent-green);">
              <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 5px;">💬 คำตอบที่จะส่ง:</div>
              <div style="color: var(--text-primary); font-size: 1rem;">${this.escapeHtml(firstMatch.reply)}</div>
            </div>
          </div>
          
          ${matchedRules.length > 1 ? `
            <details style="margin-top: 10px;">
              <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.9rem;">
                + แสดง ${matchedRules.length - 1} rule อื่นที่ตรง
              </summary>
              <div style="margin-top: 10px; padding-left: 10px;">
                ${matchedRules.slice(1).map(m => {
                  const cat = this.categories[m.rule.category] || { icon: '📋', name: 'Other' };
                  return `
                    <div style="padding: 8px; background: var(--bg-primary); border-radius: 4px; margin-bottom: 5px; font-size: 0.85rem;">
                      ${cat.icon} ${cat.name} - Rule #${m.index + 1}
                    </div>
                  `;
                }).join('')}
              </div>
            </details>
          ` : ''}
        </div>
      `;
    } else {
      document.getElementById('testResult').innerHTML = `
        <div style="padding: 20px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)); border: 2px solid var(--accent-red); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 2rem;">❌</span>
            <div style="color: var(--accent-red); font-weight: 700; font-size: 1.1rem;">ไม่พบ Rule ที่ตรง</div>
          </div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">
            ไม่มี keywords ใดที่ตรงกับคอมเมนต์ "<strong>${this.escapeHtml(testComment)}</strong>"
          </div>
          <div style="margin-top: 10px; padding: 10px; background: var(--bg-tertiary); border-radius: 6px; font-size: 0.85rem; color: var(--text-tertiary);">
            💡 ลองเพิ่ม rule ใหม่ หรือปรับ keywords ให้ครอบคลุมมากขึ้น
          </div>
        </div>
      `;
    }
  }

  getTotalReplies() {
    return this.rules.reduce((sum, rule) => sum + (rule.replies?.length || 0), 0);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in main app
window.MockRulesEditor = MockRulesEditor;
