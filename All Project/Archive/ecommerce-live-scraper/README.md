# 🛒 E-commerce Live Scraper

**Multi-Platform Live Comment Scraper** - รองรับ TikTok, Shopee, Lazada และอื่นๆ!

---

## ✨ Features

- ✅ **Multi-Platform Support** - TikTok, Shopee, Lazada (เพิ่มได้ง่าย)
- ✅ **Unified Architecture** - โครงสร้างเดียวกันสำหรับทุก platform
- ✅ **Real-time Scraping** - ดึงคอมเมนต์แบบ real-time
- ✅ **Web UI** - ใช้งานง่ายผ่าน browser
- ✅ **Comment Deduplication** - กันคอมเมนต์ซ้ำอัตโนมัติ
- ✅ **Storage State Support** - รองรับการ login แบบ persistent
- ✅ **History Management** - เก็บประวัติคอมเมนต์แยกตาม platform

---

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium
```

---

## 📂 Project Structure

```
ecommerce-live-scraper/
├── 🚀 START.bat           # เปิด server (แนะนำ!)
├── 🛑 STOP.bat            # หยุด server
├── server.js              # Main server
├── package.json           # Dependencies
├── README.md              # คุณอยู่ที่นี่
│
├── docs/                  # 📚 เอกสารทั้งหมด
│   ├── QUICKSTART.md      # วิธีเริ่มต้นใช้งาน
│   ├── HOW-TO-RUN.md      # คู่มือรัน scripts
│   ├── FIXPLAN.md         # แผนการพัฒนา
│   └── ...                # เอกสารอื่นๆ
│
├── scripts/               # 🚀 สคริปต์เสริม
│   ├── start.bat          # รันพร้อม logs
│   ├── start.ps1          # PowerShell version
│   └── START-SILENT.vbs   # รันแบบเงียบ
│
├── tests/                 # 🧪 ไฟล์ทดสอบ
│   ├── test-api.js
│   ├── test-manual.js
│   └── test-v2.js
│
├── public/                # 🎨 Frontend (Web UI)
│   ├── index.html
│   ├── css/
│   └── js/
│
├── server/                # 🖥️ Backend routes
│   └── routes/
│
├── core/                  # ⚙️ Business logic
│   ├── scraper-engine.js
│   ├── ai-reply-engine.js
│   └── webhook-manager.js
│
├── platforms/             # 🌐 Platform scrapers
│   ├── tiktok/
│   ├── shopee/
│   └── lazada/
│
├── config/                # 🔧 Configuration
├── data/                  # 💾 Data storage
└── storage-states/        # 🔐 Login sessions
```

**หมายเหตุ:**
- 📂 โฟลเดอร์สำคัญมี README.md อธิบายเพิ่มเติม
- 🚀 ใช้ `🚀 START.bat` เพื่อเริ่มต้นแบบง่าย
- 📚 เอกสารทั้งหมดอยู่ใน `docs/`

---

## 🚀 Quick Start

### วิธีที่ง่ายที่สุด (แนะนำ!)

**Windows:**
```
Double-click → START-SIMPLE.bat
```
✅ รอ 2-3 วินาที → Browser จะเปิดเอง!

**Alternative:**
```bash
# เปิด server ด้วย npm
npm start

# จากนั้นเปิด browser
http://localhost:3000
```

**มีปัญหา?** → อ่าน [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎯 หยุด Server

```
Double-click → STOP-SIMPLE.bat
```
หรือกด `Ctrl+C` ใน command prompt

---

## 🎯 Usage

### 1. เลือก Platform
- 🎵 **TikTok Live**
- 🛒 **Shopee Live**
- 📦 **Lazada Live**

### 2. ใส่ URL
ใส่ URL ของ Live ที่ต้องการ scrape

### 3. ตั้งค่า
- **Duration** - ระยะเวลาที่ต้องการ scrape (วินาที)
- **Interval** - ระยะเวลาระหว่างรอบ (วินาที)
- **Headless** - เปิด/ปิด browser window

### 4. เริ่ม Scrape!
กด "Start Scraping" แล้วรอดูผลลัพธ์

---

## 📁 Project Structure

```
ecommerce-live-scraper/
├── platforms/              # Platform-specific scrapers
│   ├── platform-interface.js
│   ├── tiktok/
│   │   ├── scraper.js
│   │   └── selectors.json
│   ├── shopee/
│   │   ├── scraper.js
│   │   └── selectors.json
│   └── lazada/
│       ├── scraper.js
│       └── selectors.json
│
├── core/                   # Core engine
│   ├── scraper-engine.js
│   └── scraper-wrapper.js
│
├── public/                 # Web UI
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
│
├── data/                   # Scraped data
│   └── comments/
│       ├── tiktok/
│       ├── shopee/
│       └── lazada/
│
├── storage-states/         # Login sessions
│   ├── tiktok.json
│   ├── shopee.json
│   └── lazada.json
│
└── server.js              # Express server
```

---

## 🔧 Configuration

### Adding a New Platform

1. สร้างโฟลเดอร์ใน `platforms/`
2. สร้าง `scraper.js` และ `selectors.json`
3. Extend `PlatformScraper` class
4. เพิ่ม platform ใน `server.js`

**Example:**

```javascript
// platforms/facebook/scraper.js
const PlatformScraper = require('../platform-interface');

class FacebookScraper extends PlatformScraper {
  constructor(config) {
    const selectors = require('./selectors.json');
    super({ name: 'Facebook', url: config.url, selectors });
  }

  async authenticate() {
    // Facebook auth logic
  }

  async extractComments(page) {
    // Facebook comment extraction
  }
}

module.exports = FacebookScraper;
```

---

## 🛠️ API Endpoints

### GET /api/platforms
รายการ platforms ที่รองรับ

### POST /api/start
เริ่ม scraper

```json
{
  "platform": "tiktok",
  "url": "https://...",
  "duration": 60,
  "interval": 3,
  "headless": false,
  "mode": "read"
}
```

### POST /api/stop
หยุด scraper

### GET /api/status
เช็คสถานะ scraper

### GET /api/comments?limit=50
ดึงคอมเมนต์

### GET /api/histories?platform=tiktok
ดึงประวัติคอมเมนต์

---

## 🎨 Architecture Design

### Platform Interface Pattern
ใช้ Abstract Base Class เพื่อให้ทุก platform มี interface เดียวกัน:

```javascript
class PlatformScraper {
  async authenticate()         // Login/auth
  async extractComments(page)  // Parse comments
  async postComment(page, text) // Post comment (optional)
}
```

### Scraper Engine
Core engine ที่รัน scraping loop และจัดการ lifecycle:

- Initialize platform
- Authenticate
- Navigate to live
- Scrape loop
- Save results
- Cleanup

---

## 🔐 Authentication

### Storage State (แนะนำ)
บันทึก login session ใน `storage-states/{platform}.json`

**วิธีสร้าง:**
1. รัน scraper ครั้งแรก (browser จะเปิด)
2. Login ด้วยตัวเอง
3. ปิด browser
4. Storage state จะถูกบันทึกอัตโนมัติ

---

## 📊 Output Format

```json
[
  {
    "platform": "tiktok",
    "username": "user123",
    "comment": "Hello world!",
    "timestamp": "2026-03-30T02:00:00.000Z"
  }
]
```

---

## 🚨 Troubleshooting

### ❌ ไม่เจอคอมเมนต์
- ตรวจสอบว่า Live เปิดอยู่
- ลอง Live อื่นที่มีคนคอมเมนต์เยอะๆ
- เช็ค selectors ใน `selectors.json`

### ❌ Authentication Failed
- ลบ `storage-states/{platform}.json`
- รันใหม่แล้ว login ด้วยตัวเอง

### ❌ Browser Crash
- ลด duration หรือเพิ่ม interval
- เปิด headless mode

---

## 🎯 Roadmap

**Phase 1 (Done):**
- ✅ Core Engine + Interface
- ✅ TikTok, Shopee, Lazada
- ✅ Web UI

**Phase 2 (TODO):**
- ⬜ AI Auto-Reply
- ⬜ Webhook Integration
- ⬜ Facebook/Instagram Live
- ⬜ Analytics Dashboard

**Phase 3 (Future):**
- ⬜ Mobile App
- ⬜ Cloud Deployment
- ⬜ Multi-Account Support

---

## 📝 License

MIT License

---

**Created by:** ดา (OpenClaw AI) 💝  
**Date:** 2026-03-30  
**Version:** 1.0.0
