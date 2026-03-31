# 🔴 TikTok LIVE Comment Scraper

**สถานะ:** ✅ พร้อมใช้งาน (อัพเดท 2026-03-26)

ระบบสำหรับสกัดคอมเมนต์จาก TikTok LIVE แบบ real-time และระบบตอบอัตโนมัติ

---

## 📁 โครงสร้างโปรเจค

```
tiktok-live-scraper/
├── scripts/
│   ├── scrape_tiktok_live.js       # Scraper ใช้ CDP (Chrome DevTools)
│   ├── scrape_tiktok_comments.js   # Script สกัดคอมเมนต์ (client-side)
│   ├── tiktok_scraper_relay.js     # Scraper ใช้ OpenClaw Browser Relay
│   └── scrape_loop.ps1             # PowerShell loop (Windows)
├── config/
│   └── tiktok_live_config.json     # การตั้งค่า URL และรอบ
├── archive/
│   └── run_working.bat             # Batch file เก่า
├── run_auto_reply.bat              # Quick start batch file
├── package.json                    # Node.js dependencies
└── README.md                       # คู่มือนี้
```

---

## 🚀 วิธีใช้งาน

### Option 1: ใช้ CDP (Chrome DevTools Protocol)

**ต้องการ:**
- Chrome/Edge เปิดด้วย `--remote-debugging-port=9222`
- Node.js + `chrome-remote-interface`

**ขั้นตอน:**

1. เปิด Chrome ด้วย Remote Debugging:
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

2. เปิดหน้า TikTok LIVE ที่ต้องการสกัด

3. หา Target ID:
   - เปิด `http://localhost:9222/json` ใน browser
   - คัดลอก `id` ของ tab TikTok LIVE
   - แก้ไข `TARGET_ID` ใน `scripts/scrape_tiktok_live.js`

4. รัน:
```bash
npm install
node scripts/scrape_tiktok_live.js
```

### Option 2: ใช้ OpenClaw Browser Relay ⭐ แนะนำ

**ต้องการ:**
- OpenClaw Gateway ทำงานอยู่
- Chrome Extension "Browser Relay" ติดตั้งแล้ว
- Tab TikTok LIVE attach กับ extension (badge เป็น ON)

**ขั้นตอน:**

1. เปิด TikTok LIVE ใน Chrome
2. คลิก Browser Relay extension → attach tab
3. หา Target ID:
```bash
# ผ่าน OpenClaw CLI
openclaw browser tabs --profile chrome
```

4. แก้ `TARGET_ID` ใน `scripts/tiktok_scraper_relay.js`

5. รัน:
```bash
node scripts/tiktok_scraper_relay.js
```

### Option 3: ใช้ PowerShell Loop (Windows)

```powershell
cd "C:\Users\Winon\.openclaw\workspace\All Project\tiktok-live-scraper"
.\scripts\scrape_loop.ps1 -Duration 60 -Interval 3
```

---

## ⚙️ การตั้งค่า

### แก้ไข URL

แก้ไข `config/tiktok_live_config.json`:

```json
{
  "url": "https://www.tiktok.com/@username/live",
  "runCount": 0,
  "maxRuns": 10
}
```

### ปรับระยะเวลาและ Interval

แก้ตัวแปรใน script:

```javascript
const DURATION = 60; // วินาที - รันนานแค่ไหน
const INTERVAL = 3;  // วินาที - เช็คทุกๆ กี่วินาที
```

**แนะนำ:**
- INTERVAL: 3-5 วินาที (เร็วเกินไป TikTok อาจบล็อก)
- DURATION: 60-300 วินาที (1-5 นาที)

---

## 📊 ผลลัพธ์

Output จะเป็น JSON array:

```json
[
  {
    "timestamp": "26/3/2026 09:42:00",
    "username": "user123",
    "comment": "สวัสดีครับ"
  },
  {
    "timestamp": "26/3/2026 09:42:03",
    "username": "user456",
    "comment": "สินค้าราคาเท่าไหร่"
  }
]
```

**Features:**
- ✅ กรองคอมเมนต์ซ้า (track ด้วย `username:comment`)
- ✅ Timestamp แต่ละคอมเมนต์
- ✅ รองรับภาษาไทย + Emoji
- ✅ ทำงานแบบ real-time

---

## 🛠️ Dependencies

### Node.js (CDP version)

```bash
npm install chrome-remote-interface
```

### OpenClaw (Relay version)

```bash
npm install -g openclaw
```

---

## 🎯 Selectors

Script ใช้ multiple selectors เพื่อรองรับ TikTok UI ที่เปลี่ยนบ่อย:

```javascript
const selectors = {
  container: [
    '[data-e2e="comment-item"]',
    '.comment-item',
    '[class*="Comment"]'
  ],
  username: [
    '[data-e2e="comment-username"]',
    '.comment-username'
  ],
  text: [
    '[data-e2e="comment-text"]',
    '.comment-text-content'
  ]
};
```

ถ้า TikTok เปลี่ยน UI → แก้ selectors ตรงนี้

---

## 🚨 Troubleshooting

### ❌ ไม่เจอคอมเมนต์

**สาเหตุ:**
- Selectors เปลี่ยน (TikTok อัพเดท UI)
- LIVE ปิดไปแล้ว
- ยังไม่มีคนคอมเมนต์

**วิธีแก้:**
1. Inspect Element ใน Chrome
2. หา class/attribute ใหม่ของคอมเมนต์
3. อัพเดท selectors

### ❌ Connection refused (CDP)

**สาเหตุ:**
- Chrome ไม่ได้เปิดด้วย `--remote-debugging-port`

**วิธีแก้:**
```bash
# ปิด Chrome ทั้งหมดก่อน แล้วเปิดใหม่ด้วยคำสั่งด้านบน
```

### ❌ Target ID not found

**สาเหตุ:**
- Tab ถูกปิดไปแล้ว
- ID ผิด

**วิธีแก้:**
- ดู `http://localhost:9222/json` (CDP)
- ใช้ `openclaw browser tabs` (Relay)

---

## 💡 Tips

### 1. หา Target ID ง่ายๆ

**CDP:**
```bash
curl http://localhost:9222/json | ConvertFrom-Json | Select-Object id, title, url
```

**OpenClaw:**
```bash
openclaw browser tabs --profile chrome
```

### 2. ทดสอบ Selectors

Paste script `scrape_tiktok_comments.js` ใน Console ของ TikTok LIVE tab:
```javascript
// Paste เนื้อหาไฟล์ scrape_tiktok_comments.js
```

### 3. Auto-login

ถ้าต้องการ login อัตโนมัติ → ใช้ Puppeteer แทน CDP

---

## 📝 To-Do

- [ ] Auto-reply system (webhook integration)
- [ ] Save to database (SQLite/JSON)
- [ ] Web dashboard (real-time view)
- [ ] Multi-stream support
- [ ] Sentiment analysis
- [ ] Keyword alerts

---

## ⚠️ Legal & Ethics

- ✅ ใช้เพื่อการศึกษา / ธุรกิจของตัวเอง
- ❌ ห้ามใช้สแปม / โกง / ทำอันตราย
- ⚠️ TikTok อาจเปลี่ยน ToS → ใช้ด้วยความระมัดระวัง

---

**สร้างโดย:** ดา 💝  
**อัพเดท:** 2026-03-26  
**Version:** 1.0.0
