# 🎨 Design Document - E-commerce Live Scraper v2.0

**Version:** 2.0.0  
**Date:** 2026-03-30  
**Status:** Design Phase

---

## 🎯 Overview

เวอร์ชัน 2.0 จะรวมทุกฟีเจอร์จากโปรเจค TikTok Live Scraper เดิม + เพิ่ม Multi-Platform Support

---

## ✨ Features Comparison

### v1.0 (Current)
- ✅ Multi-platform support (TikTok, Shopee, Lazada)
- ✅ Basic scraping
- ✅ Simple UI
- ✅ Comment history

### v2.0 (Target)
- ✅ All v1.0 features
- ✅ **AI Auto-Reply System**
- ✅ **Mock AI Rules Editor**
- ✅ **Webhook Integration** (Discord, Slack, Telegram, Custom)
- ✅ **User Management** (Blacklist, Whitelist, VIP)
- ✅ **Reply Templates**
- ✅ **Statistics Dashboard**
- ✅ **Error Tracking**
- ✅ **Keyword Alerts**
- ✅ **Chrome Profile Auth**
- ✅ **Storage State Auth**
- ✅ **Preset Management**
- ✅ **Advanced Filters**
- ✅ **Real-time Status**
- ✅ **Dark Theme UI**

---

## 🏗️ Architecture

### Frontend Structure

```
public/
├── index.html              # Main HTML
├── css/
│   └── style.css           # Global styles + Dark theme
└── js/
    ├── app.js              # Main app controller
    ├── api.js              # API helper
    ├── storage.js          # LocalStorage helper
    └── components/
        ├── Accordion.js             # Collapsible sections
        ├── AIWebhookManager.js      # AI webhook UI
        ├── CommentHistory.js        # History viewer
        ├── CommentList.js           # Comment display
        ├── ConfigForm.js            # Configuration form
        ├── ControlPanel.js          # Control buttons
        ├── ErrorHandler.js          # Error display
        ├── KeywordAlert.js          # Keyword alerts
        ├── MockRulesEditor.js       # Mock AI rules
        ├── PresetManager.js         # Preset management
        ├── PlatformSelector.js      # Platform picker (NEW)
        ├── ReplyTemplates.js        # Reply templates
        ├── StatsDashboard.js        # Statistics
        ├── StatusBar.js             # Status display
        ├── UserListManager.js       # User filters
        └── WebhookManager.js        # Webhook config
```

### Backend Structure

```
server/
├── server.js               # Main Express server
├── routes/
│   ├── scraper.js          # Scraper endpoints
│   ├── platforms.js        # Platform management
│   ├── webhooks.js         # Webhook endpoints
│   ├── ai.js               # AI webhook endpoints
│   ├── users.js            # User management
│   └── stats.js            # Statistics endpoints
└── middleware/
    ├── validator.js        # Request validation
    └── error.js            # Error handling

core/
├── scraper-engine.js       # Enhanced with all features
├── scraper-wrapper.js      # Command-line wrapper
├── webhook-manager.js      # Webhook sender
├── ai-reply-engine.js      # AI reply logic
├── user-filter.js          # User filtering
└── stats-tracker.js        # Statistics tracking

platforms/
├── platform-interface.js   # Base class
├── tiktok/
│   ├── scraper.js
│   ├── selectors.json
│   └── auth.js             # Authentication helpers
├── shopee/
│   ├── scraper.js
│   ├── selectors.json
│   └── auth.js
└── lazada/
    ├── scraper.js
    ├── selectors.json
    └── auth.js
```

---

## 🎨 UI Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🛒 E-commerce Live Scraper                                 │
│  Multi-Platform Live Comment Scraper                        │
├─────────────────────────────────────────────────────────────┤
│  [Scraper] [Stats] [Users] [Errors] [Webhook] [History]    │
│  [AI Reply] [Mock Rules]                                    │
├──────────────────┬──────────────────────────────────────────┤
│  ⚙️ การตั้งค่า   │  📊 สถานะ                                │
│                  │  🟢 พร้อมใช้งาน | ⏱️ 00:00:00           │
│  [▼] ทั่วไป      │  💬 0 คอมเมนต์ | 🌐 Platform: -         │
│   - Platform     │                                          │
│   - URL          │  🔍 ค้นหา: [________________] [⚙️]       │
│   - Duration     │                                          │
│   - Interval     │  💬 คอมเมนต์ที่ดึงได้ (0 รายการ)        │
│                  │  ┌──────────────────────────────────┐   │
│  [▼] การเข้าถึง  │  │  ยังไม่มีคอมเมนต์                 │   │
│   - Auth Mode    │  │  กด "เริ่มรับคอมเมนต์" เพื่อเริ่ม │   │
│   - Profile Path │  └──────────────────────────────────┘   │
│                  │                                          │
│  [▼] การตอบกลับ  │                                          │
│   - Mode         │                                          │
│   - Cooldown     │                                          │
│   - Templates    │                                          │
│                  │                                          │
│  [▼] ตัวกรอง     │                                          │
│   - Blacklist    │                                          │
│   - Whitelist    │                                          │
│   - VIP List     │                                          │
│                  │                                          │
│  [เริ่มรับ] [หยุด]│                                         │
│  [JSON] [CSV]    │                                          │
│  [ล้าง]          │                                          │
│                  │                                          │
│  📁 Presets      │                                          │
│  - [Preset 1] 🗑️│                                          │
│  - [Preset 2] 🗑️│                                          │
│  [+ เพิ่ม]       │                                          │
│                  │                                          │
│  ⚠️ คำสำคัญ      │                                          │
│  [Toggle]        │                                          │
│  [พิมพ์คำ...] + │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

---

## 📊 Tab Structure

### 1. Scraper (หน้าหลัก)
- Configuration sections (collapsible)
- Control panel
- Real-time comments
- Search/Filter

### 2. Stats (สถิติ)
- Total comments
- Comments per minute
- Top users
- Platform breakdown
- Timeline chart

### 3. Users (จัดการผู้ใช้)
- Blacklist management
- Whitelist management
- VIP list management
- Bulk import/export

### 4. Errors (ข้อผิดพลาด)
- Error log viewer
- Error statistics
- Clear errors

### 5. Webhook (Webhook)
- Discord webhook
- Slack webhook
- Telegram webhook
- Custom webhook
- Test webhook

### 6. History (ประวัติ)
- Past scraping sessions
- Load/Delete sessions
- Export sessions

### 7. AI Reply (AI ตอบกลับ)
- AI webhook server control
- AI configuration
- AI logs
- Test AI

### 8. Mock Rules (กฎ Mock AI)
- Rule editor
- Pattern matching
- Response templates
- Test rules

---

## 🔧 Configuration Sections

### 1. การตั้งค่าทั่วไป
- **Platform**: TikTok / Shopee / Lazada (dropdown with emoji)
- **Live URL**: Input field
- **Duration**: Number input (seconds)
- **Interval**: Number input (seconds)
- **Headless**: Checkbox
- **Browser**: Chromium / Firefox / WebKit (dropdown)

### 2. การเข้าถึงบัญชี
- **Auth Mode**: Storage State / Chrome Profile / Persistent / None
- **Chrome Profile Path**: File picker (for Chrome Profile mode)
- **Import Cookies**: Button + Text area (for Storage State mode)
- **Check Cookies**: Button (shows cookie status)

### 3. การตอบกลับอัตโนมัติ
- **Mode**: Read / Respond (radio buttons)
- **Reply Cooldown**: Number input (seconds)
- **Reply on Question**: Checkbox
- **AI Webhook URL**: Input field (optional)
- **Host Username**: Input field (to exclude self)
- **Reply Templates**: List + Add/Remove

### 4. ตัวกรองผู้ใช้
- **Blacklist**: Textarea (one username per line)
- **Whitelist**: Textarea
- **VIP List**: Textarea
- **Import/Export**: Buttons

---

## 📡 API Endpoints

### Scraper
```
POST   /api/start          # Start scraper
POST   /api/stop           # Stop scraper
GET    /api/status         # Get status
GET    /api/comments       # Get comments
DELETE /api/comments       # Clear comments
```

### Platforms
```
GET    /api/platforms              # List platforms
GET    /api/platforms/:id          # Get platform details
GET    /api/platforms/:id/test     # Test platform connection
```

### Webhooks
```
GET    /api/webhooks               # List webhooks
POST   /api/webhooks               # Add webhook
PUT    /api/webhooks/:id           # Update webhook
DELETE /api/webhooks/:id           # Delete webhook
POST   /api/webhooks/:id/test      # Test webhook
```

### AI
```
POST   /api/ai/start               # Start AI webhook server
POST   /api/ai/stop                # Stop AI webhook server
GET    /api/ai/status              # Get AI status
GET    /api/ai/logs                # Get AI logs
DELETE /api/ai/logs                # Clear AI logs
POST   /api/ai/config              # Update AI config
```

### Users
```
GET    /api/users/blacklist        # Get blacklist
POST   /api/users/blacklist        # Update blacklist
GET    /api/users/whitelist        # Get whitelist
POST   /api/users/whitelist        # Update whitelist
GET    /api/users/viplist          # Get VIP list
POST   /api/users/viplist          # Update VIP list
```

### Stats
```
GET    /api/stats                  # Get overall stats
GET    /api/stats/platform/:id     # Get platform stats
GET    /api/stats/timeline         # Get timeline data
```

### History
```
GET    /api/histories              # List all histories
GET    /api/histories/:platform    # List platform histories
GET    /api/histories/:platform/:id # Get specific session
DELETE /api/histories/:platform/:id # Delete session
```

### Presets
```
GET    /api/presets                # List presets
POST   /api/presets                # Save preset
DELETE /api/presets/:id            # Delete preset
PUT    /api/presets/:id/load       # Load preset
```

### Mock Rules
```
GET    /api/mock-rules             # Get rules
POST   /api/mock-rules             # Update rules
POST   /api/mock-rules/test        # Test rule
```

---

## 🎨 Color Scheme (Dark Theme)

```css
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #242424;
  --bg-tertiary: #2d2d2d;
  --border-color: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --accent-pink: #fe2c55;
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  --accent-yellow: #f59e0b;
  --accent-red: #ef4444;
}
```

---

## 🚀 Implementation Plan

### Phase 1: Core Enhancement (Day 1-2)
- ✅ Migrate all backend features from TikTok project
- ✅ Add webhook manager
- ✅ Add AI reply engine
- ✅ Add user filter system
- ✅ Add statistics tracker

### Phase 2: UI Overhaul (Day 3-4)
- ✅ Implement dark theme
- ✅ Create all component modules
- ✅ Build tab system
- ✅ Add collapsible sections (Accordion)

### Phase 3: Features Integration (Day 5-6)
- ✅ AI Webhook Server
- ✅ Mock Rules Editor
- ✅ Reply Templates
- ✅ User Management UI
- ✅ Webhook Integration UI

### Phase 4: Polish & Testing (Day 7)
- ✅ Test all features
- ✅ Bug fixes
- ✅ Performance optimization
- ✅ Documentation

---

## 📦 Data Structure

### Config Object
```javascript
{
  platform: 'tiktok',
  url: 'https://...',
  duration: 300,
  interval: 3,
  headless: false,
  browser: 'chromium',
  auth: {
    mode: 'storage',
    chromePath: null
  },
  reply: {
    enabled: false,
    cooldown: 5,
    onQuestion: true,
    templates: [],
    aiWebhookUrl: null,
    hostUsername: null
  },
  filters: {
    blacklist: [],
    whitelist: [],
    viplist: []
  },
  webhooks: [],
  keywords: []
}
```

### Comment Object
```javascript
{
  id: 'uuid',
  platform: 'tiktok',
  username: 'user123',
  comment: 'Hello!',
  timestamp: '2026-03-30T...',
  replied: false,
  filtered: false
}
```

### Statistics Object
```javascript
{
  totalComments: 0,
  commentsPerMinute: 0,
  topUsers: [],
  platformBreakdown: {},
  timeline: []
}
```

---

## 🎯 Success Criteria

- ✅ All features from TikTok project working
- ✅ Multi-platform support maintained
- ✅ UI matches original design
- ✅ All tabs functional
- ✅ All API endpoints working
- ✅ Dark theme applied
- ✅ Responsive design
- ✅ Documentation complete

---

**Designed by:** ดา (OpenClaw AI) 💝  
**Date:** 2026-03-30  
**Status:** Ready for Implementation
