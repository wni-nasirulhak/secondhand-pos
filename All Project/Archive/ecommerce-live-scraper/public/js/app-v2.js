// App V2 - Simplified UI
let selectedPlatform = null;
let selectedMode = 'read';
let isRunning = false;
let comments = [];
let uptimeInterval = null;
let startTime = null;

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPlatformCards();
  initModeCards();
  initQuickStart();
  initAdvancedPanel();
  initAuthMode();
  initComponentManagers();
  
  // Start polling status
  setInterval(updateStatus, 2000);
});

// ========== Tab Management ==========
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabName}`);
  });
  
  // Load tab content if needed
  loadTabContent(tabName);
}

function loadTabContent(tabName) {
  switch (tabName) {
    case 'stats':
      if (window.statsDashboard) window.statsDashboard.render();
      break;
    case 'users':
      if (window.userListManager) window.userListManager.render();
      break;
    case 'webhook':
      if (window.webhookManager) window.webhookManager.render();
      break;
    case 'history':
      if (window.historyViewer) window.historyViewer.render();
      break;
    case 'ai-reply':
      if (window.aiReplyManager) window.aiReplyManager.render();
      break;
    case 'mock-rules':
      if (window.mockRulesEditor) window.mockRulesEditor.render();
      break;
  }
}

// ========== Platform Cards ==========
function initPlatformCards() {
  const cards = document.querySelectorAll('.platform-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const platform = card.dataset.platform;
      selectPlatform(platform);
    });
  });
}

function selectPlatform(platform) {
  selectedPlatform = platform;
  
  // Update card selection
  document.querySelectorAll('.platform-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.platform === platform);
  });
  
  // Show URL input section
  document.getElementById('urlInputSection').style.display = 'block';
  document.getElementById('modeSection').style.display = 'block';
  document.getElementById('quickSettings').style.display = 'block';
  document.getElementById('actionButtons').style.display = 'block';
  
  // Update URL label and placeholder
  const platformNames = {
    tiktok: 'TikTok Live',
    shopee: 'Shopee Live',
    lazada: 'Lazada Live'
  };
  
  const platformExamples = {
    tiktok: 'https://www.tiktok.com/@username/live',
    shopee: 'https://live.shopee.co.th/...',
    lazada: 'https://pages.lazada.co.th/wow/...'
  };
  
  document.getElementById('urlInputLabel').textContent = `${platformNames[platform]} URL`;
  document.getElementById('quickUrl').placeholder = platformExamples[platform];
  document.getElementById('urlExamples').innerHTML = `
    <small class="text-secondary">ตัวอย่าง: ${platformExamples[platform]}</small>
  `;
}

// ========== Mode Cards ==========
function initModeCards() {
  const modeCards = document.querySelectorAll('.mode-card');
  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      selectMode(mode);
    });
  });
}

function selectMode(mode) {
  selectedMode = mode;
  
  // Update card selection
  document.querySelectorAll('.mode-card').forEach(card => {
    card.classList.toggle('active', card.dataset.mode === mode);
  });
}

// ========== Quick Start ==========
function initQuickStart() {
  document.getElementById('quickStartBtn').addEventListener('click', startScraper);
  document.getElementById('quickStopBtn').addEventListener('click', stopScraper);
  
  // Download buttons
  document.getElementById('downloadJsonBtn').addEventListener('click', downloadJSON);
  document.getElementById('downloadCsvBtn').addEventListener('click', downloadCSV);
  document.getElementById('clearCommentsBtn').addEventListener('click', clearComments);
  
  // Search
  document.getElementById('searchBtn').addEventListener('click', searchComments);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchComments();
  });
  document.getElementById('refreshBtn').addEventListener('click', refreshComments);
}

async function startScraper() {
  if (!selectedPlatform) {
    alert('❌ กรุณาเลือก platform ก่อน');
    return;
  }
  
  const url = document.getElementById('quickUrl').value.trim();
  if (!url) {
    alert('❌ กรุณาใส่ URL ของไลฟ์');
    return;
  }
  
  const duration = parseInt(document.getElementById('quickDuration').value);
  const interval = parseInt(document.getElementById('quickInterval').value);
  const headless = document.getElementById('quickHeadless').checked;
  
  const config = {
    platform: selectedPlatform,
    url: url,
    duration: duration,
    interval: interval,
    headless: headless,
    mode: selectedMode
  };
  
  try {
    const result = await API.startScraper(config);
    
    if (result.success) {
      isRunning = true;
      startTime = Date.now();
      
      document.getElementById('quickStartBtn').style.display = 'none';
      document.getElementById('quickStopBtn').style.display = 'block';
      
      updateStatusBadge('running', '🔴 กำลังทำงาน');
      startUptimeCounter();
      startCommentPolling();
      
      showToast('✅ เริ่มรับคอมเมนต์แล้ว!', 'success');
    } else {
      alert(`❌ เริ่มไม่สำเร็จ: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
  }
}

async function stopScraper() {
  try {
    const result = await API.stopScraper();
    
    if (result.success) {
      isRunning = false;
      
      document.getElementById('quickStartBtn').style.display = 'block';
      document.getElementById('quickStopBtn').style.display = 'none';
      
      updateStatusBadge('idle', '⚪ พร้อมใช้งาน');
      stopUptimeCounter();
      
      showToast('⏹️ หยุดการทำงานแล้ว', 'info');
    }
  } catch (error) {
    alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
  }
}

// ========== Status Management ==========
function updateStatusBadge(state, text) {
  const badges = document.querySelectorAll('.status-badge');
  badges.forEach(badge => {
    badge.className = `status-badge ${state}`;
    badge.textContent = text;
  });
  
  const platformSpan = document.getElementById('currentPlatform');
  if (selectedPlatform && isRunning) {
    const icons = { tiktok: '🎵', shopee: '🛒', lazada: '📦' };
    const names = { tiktok: 'TikTok', shopee: 'Shopee', lazada: 'Lazada' };
    platformSpan.textContent = `${icons[selectedPlatform]} ${names[selectedPlatform]}`;
  } else {
    platformSpan.textContent = '-';
  }
}

function startUptimeCounter() {
  stopUptimeCounter();
  uptimeInterval = setInterval(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      document.getElementById('uptime').textContent = `${hours}:${minutes}:${seconds}`;
    }
  }, 1000);
}

function stopUptimeCounter() {
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
    uptimeInterval = null;
  }
  document.getElementById('uptime').textContent = '00:00:00';
  startTime = null;
}

async function updateStatus() {
  try {
    const result = await API.getStatus();
    if (result.isRunning && !isRunning) {
      // Server is running but UI doesn't know - sync state
      isRunning = true;
      startTime = Date.now();
      document.getElementById('quickStartBtn').style.display = 'none';
      document.getElementById('quickStopBtn').style.display = 'block';
      updateStatusBadge('running', '🔴 กำลังทำงาน');
      startUptimeCounter();
      startCommentPolling();
    } else if (!result.isRunning && isRunning) {
      // Server stopped but UI still thinks it's running - sync state
      isRunning = false;
      document.getElementById('quickStartBtn').style.display = 'block';
      document.getElementById('quickStopBtn').style.display = 'none';
      updateStatusBadge('idle', '⚪ พร้อมใช้งาน');
      stopUptimeCounter();
    }
  } catch (error) {
    console.error('Status update error:', error);
  }
}

// ========== Comment Polling ==========
let commentPollInterval = null;

function startCommentPolling() {
  stopCommentPolling();
  commentPollInterval = setInterval(refreshComments, 2000);
}

function stopCommentPolling() {
  if (commentPollInterval) {
    clearInterval(commentPollInterval);
    commentPollInterval = null;
  }
}

async function refreshComments() {
  try {
    const result = await API.getComments(1000);
    if (result.success && result.comments) {
      comments = result.comments;
      renderComments(comments);
      updateCommentCount(comments.length);
    }
  } catch (error) {
    console.error('Error refreshing comments:', error);
  }
}

function renderComments(commentList) {
  const container = document.getElementById('commentsList');
  
  if (commentList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>ยังไม่มีคอมเมนต์</p>
        <p class="text-small">เลือก platform และกด "เริ่มรับคอมเมนต์" เพื่อเริ่มต้น</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = commentList.map(comment => `
    <div class="comment-item">
      <div class="comment-header">
        <span class="comment-username">${escapeHtml(comment.username || 'Unknown')}</span>
        <span class="comment-platform ${comment.platform}">${comment.platform?.toUpperCase() || 'UNKNOWN'}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment.comment || comment.text || '')}</div>
      <div class="comment-timestamp">${formatTimestamp(comment.timestamp)}</div>
    </div>
  `).reverse().join('');
}

function updateCommentCount(count) {
  document.getElementById('commentCount').textContent = count;
  document.getElementById('topCommentCount').textContent = count;
}

function searchComments() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  if (!query) {
    renderComments(comments);
    return;
  }
  
  const filtered = comments.filter(c => 
    c.username?.toLowerCase().includes(query) ||
    c.comment?.toLowerCase().includes(query) ||
    c.text?.toLowerCase().includes(query)
  );
  
  renderComments(filtered);
}

async function clearComments() {
  if (!confirm('⚠️ ต้องการล้างคอมเมนต์ทั้งหมด?')) return;
  
  try {
    await API.clearComments();
    comments = [];
    renderComments(comments);
    updateCommentCount(0);
    showToast('🗑️ ล้างคอมเมนต์แล้ว', 'info');
  } catch (error) {
    alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
  }
}

// ========== Download ==========
function downloadJSON() {
  if (comments.length === 0) {
    alert('❌ ไม่มีคอมเมนต์ให้ดาวน์โหลด');
    return;
  }
  
  const blob = new Blob([JSON.stringify(comments, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comments_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📥 ดาวน์โหลด JSON แล้ว', 'success');
}

function downloadCSV() {
  if (comments.length === 0) {
    alert('❌ ไม่มีคอมเมนต์ให้ดาวน์โหลด');
    return;
  }
  
  const headers = ['Platform', 'Username', 'Comment', 'Timestamp'];
  const rows = comments.map(c => [
    c.platform || '',
    c.username || '',
    c.comment || c.text || '',
    c.timestamp || ''
  ]);
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comments_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📥 ดาวน์โหลด CSV แล้ว', 'success');
}

// ========== Advanced Panel ==========
function initAdvancedPanel() {
  document.getElementById('showAdvancedBtn').addEventListener('click', () => {
    document.getElementById('advancedPanel').style.display = 'block';
  });
  
  document.getElementById('hideAdvancedBtn').addEventListener('click', () => {
    document.getElementById('advancedPanel').style.display = 'none';
  });

  // Cookie management
  document.getElementById('checkCookiesBtn').addEventListener('click', checkCookies);
  document.getElementById('importCookiesBtn').addEventListener('click', importCookies);
  document.getElementById('findChromeBtn').addEventListener('click', findChromePath);
}

function initAuthMode() {
  const authMode = document.getElementById('authMode');
  const chromeSection = document.getElementById('chromeProfileSection');
  const storageSection = document.getElementById('storageStateSection');

  authMode.addEventListener('change', () => {
    const mode = authMode.value;
    chromeSection.style.display = mode === 'chrome' ? 'block' : 'none';
    storageSection.style.display = mode === 'storage' ? 'block' : 'none';
  });
}

async function checkCookies() {
  try {
    const result = await API.checkCookies();
    if (result.exists) {
      showToast(`✅ พบคุกกี้ ${result.cookieCount} รายการ`, 'success');
    } else {
      showToast('⚠️ ยังไม่มีคุกกี้', 'info');
    }
  } catch (error) {
    showToast('❌ เกิดข้อผิดพลาดในการเช็คคุกกี้', 'error');
  }
}

async function importCookies() {
  const cookiesJson = prompt('วาง JSON คุกกี้ที่นี่ (จาก EditThisCookie หรือไฟล์ storage-state.json):');
  if (!cookiesJson) return;

  try {
    const result = await API.importCookies(cookiesJson);
    if (result.success) {
      showToast('✅ นำเข้าคุกกี้สำเร็จ!', 'success');
    } else {
      showToast(`❌ นำเข้าไม่สำเร็จ: ${result.error}`, 'error');
    }
  } catch (error) {
    showToast('❌ เกิดข้อผิดพลาดในการนำเข้าคุกกี้', 'error');
  }
}

async function findChromePath() {
  const btn = document.getElementById('findChromeBtn');
  const originalText = btn.textContent;
  btn.textContent = '⏳';
  btn.disabled = true;

  try {
    const result = await API.findChromePath();
    if (result.success && result.path) {
      document.getElementById('chromePath').value = result.path;
      showToast('✅ พบ Chrome Profile Path!', 'success');
    } else {
      showToast('❌ ไม่พบ Chrome Profile อัตโนมัติ', 'error');
    }
  } catch (error) {
    showToast('❌ เกิดข้อผิดพลาดในการค้นหา', 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ========== Component Managers ==========
function initComponentManagers() {
  // Initialize all component managers (stats, users, webhooks, etc.)
  if (typeof StatsDashboard !== 'undefined') {
    window.statsDashboard = new StatsDashboard();
  }
  
  if (typeof UserListManager !== 'undefined') {
    window.userListManager = new UserListManager();
  }
  
  if (typeof WebhookManager !== 'undefined') {
    window.webhookManager = new WebhookManager();
  }
  
  if (typeof HistoryViewer !== 'undefined') {
    window.historyViewer = new HistoryViewer();
  }
  
  if (typeof AIReplyManager !== 'undefined') {
    window.aiReplyManager = new AIReplyManager();
  }
  
  if (typeof MockRulesEditor !== 'undefined') {
    window.mockRulesEditor = new MockRulesEditor();
    window.mockRulesEditor.init();
  }
}

// ========== Utilities ==========
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const colors = {
    success: 'var(--accent-green)',
    error: 'var(--accent-red)',
    info: 'var(--accent-blue)'
  };
  
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 15px 20px;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
