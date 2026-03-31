# 🎨 TikTok Live Scraper - Web UI

**Version 2.1.3** - ระบบดึงคอมเมนต์ TikTok Live พร้อม Proxy Support!

![Status](https://img.shields.io/badge/status-production-green)
![Version](https://img.shields.io/badge/version-2.1.3-blue)

---

## ✨ Features

- 🎨 **Web UI สวยงาม** - ไม่ต้องแก้ไฟล์หรือรัน command line
- ⚡ **Real-time Updates** - เห็นคอมเมนต์ใหม่ทันที
- 🔍 **Search & Filter** - ค้นหาคอมเมนต์ได้ง่าย
- 💾 **Export** - ดาวน์โหลดเป็น JSON หรือ CSV
- 📊 **Statistics** - ดูสถิติคอมเมนต์แบบ real-time
- 📱 **Responsive** - ใช้งานได้ทั้ง desktop และ mobile
- 💾 **Config Presets** - บันทึกการตั้งค่าที่ใช้บ่อย
- 🔔 **Keyword Alerts** - แจ้งเตือนเมื่อมีคำสำคัญ
- 📝 **Auto-Save** - บันทึกการตั้งค่าล่าสุดอัตโนมัติ
- 🔗 **Recent URLs** - จำ URL ที่เคยใช้
- 🔐 **Persistent Login** - Login ครั้งเดียว ใช้ได้ตลอด
- 🌐 **Proxy Support** - แก้ปัญหา IP ถูกบล็อก ✨ NEW!

---

## 🚀 Quick Start

### 1️⃣ ติดตั้ง Dependencies

```bash
npm install
```

### 2️⃣ เริ่มใช้งาน

```bash
npm start
```

### 3️⃣ เปิด Browser

```
http://localhost:3000
```

---

## 📖 วิธีใช้งาน

### ขั้นตอนที่ 1: ตั้งค่า

1. **ใส่ TikTok Live URL**
   ```
   https://www.tiktok.com/@username/live
   ```

2. **เลือกระยะเวลา** (1-180 นาที)
   - แนะนำ: 10-30 นาที สำหรับ Live ปกติ

3. **เลือกความถี่ในการดึง** (1-10 วินาที)
   - แนะนำ: 3-5 วินาที เพื่อไม่โหลด TikTok มาก

4. **Headless Mode** (ถ้าต้องการ)
   - ☑️ เปิด = ไม่แสดง browser
   - ☐ ปิด = เห็น browser ทำงาน (แนะนำสำหรับครั้งแรก)

### ขั้นตอนที่ 2: เริ่มดึงคอมเมนต์

1. กดปุ่ม **"▶️ เริ่มดึงคอมเมนต์"**
2. รอ browser เปิด (ถ้าไม่ใช่ headless mode)
3. คอมเมนต์จะแสดงแบบ real-time

### ขั้นตอนที่ 3: ดูผลลัพธ์

- 💬 **รายการคอมเมนต์** - แสดงด้านขวา
- 🔍 **ค้นหา** - พิมพ์ชื่อผู้ใช้หรือข้อความ
- 📊 **สถิติ** - ดูจำนวนคอมเมนต์ และอัตราต่อนาที

### ขั้นตอนที่ 4: ดาวน์โหลด

- 💾 **JSON** - สำหรับประมวลผลต่อ
- 📊 **CSV** - เปิดใน Excel ได้เลย

---

## 🎯 ฟีเจอร์ใหม่ (v2.1)

### 💾 Config Presets - บันทึกการตั้งค่า

**ทำไมต้องมี?**
- ไม่ต้องตั้งค่า URL ใหม่ทุกครั้ง
- สะดวกถ้ามีหลาย Live ที่ดูประจำ
- เก็บการตั้งค่าแบบ "ชุด" ไว้ใช้ได้เลย

**วิธีใช้:**
1. ตั้งค่า URL, Duration, Interval ตามปกติ
2. กดปุ่ม **"➕ บันทึกการตั้งค่า"**
3. ตั้งชื่อ เช่น "Live ประจำวัน", "Event พิเศษ"
4. ครั้งต่อไปกด **"📂 โหลด"** ได้เลย!

**Presets แสดง:**
- 🔗 Username ของ Live
- ⏱️ ระยะเวลา
- 🔄 ความถี่การดึง
- 📅 วันที่อัปเดตล่าสุด

### 🔔 Keyword Alerts - แจ้งเตือนคำสำคัญ

**ทำไมต้องมี?**
- ติดตามคำถามที่สำคัญ
- ไม่พลาดคอมเมนต์ที่ต้องตอบ
- รู้ทันทีเมื่อมีคนพูดถึงสินค้า/หัวข้อที่สนใจ

**วิธีใช้:**
1. พิมพ์คำสำคัญ เช่น "ราคา", "สั่งซื้อ", "ส่งฟรี"
2. กด **Enter** หรือปุ่ม **"➕ เพิ่ม"**
3. เปิด/ปิดการแจ้งเตือนด้วย Toggle Switch
4. เมื่อมีคอมเมนต์ที่ตรงกัน จะแสดง:
   - 🔔 Notification บนหน้าจอ
   - 📱 Browser Notification (ถ้าอนุญาต)
   - 📜 ประวัติการแจ้งเตือน

**ตัวอย่างการใช้:**
- **ร้านค้า:** "ราคา", "สต็อก", "ส่งฟรี", "โอนเงิน"
- **Influencer:** ชื่อตัวเอง, แบรนด์ที่สนับสนุน
- **Event:** "คำถาม", "ของรางวัล", "ชิงโชค"

### 📝 Auto-Save & Recent URLs

**Auto-Save:**
- บันทึกการตั้งค่าล่าสุดอัตโนมัติ
- เปิดใหม่ไม่ต้องตั้งค่าซ้ำ
- ใช้ LocalStorage (ข้อมูลอยู่ในเครื่อง)

**Recent URLs:**
- จำ URL ที่เคยใช้ไว้ 10 รายการ
- แสดงเป็น Dropdown ตอนพิมพ์
- คลิกเลือกได้เลย ไม่ต้องคัดลอก-วาง

### 🌐 Proxy Support - แก้ IP Block

**ทำไมต้องใช้?**
- แก้ปัญหา "Maximum number of attempts reached"
- TikTok บล็อก IP → ใช้ Proxy เปลี่ยน IP
- ใช้งานต่อเนื่องโดยไม่โดนบล็อก

**วิธีใช้:**
1. ใส่ Proxy URL ในช่อง "🌐 Proxy Server"
   ```
   http://username:password@proxy-server:port
   ```
2. เริ่ม scraper ตามปกติ
3. ✅ เปลี่ยน IP สำเร็จ!

**Proxy ที่แนะนำ:**
- **Residential Proxy:** Bright Data, Smartproxy (ดีที่สุด)
- **Datacenter Proxy:** WebShare (ถูกกว่า)
- **VPN:** NordVPN, ProtonVPN (ทางเลือก)

**คู่มือฉบับเต็ม:**
- `PROXY-GUIDE.md` - วิธีใช้ proxy
- `QUICK-FIX-IP-BLOCK.md` - แก้ IP block 5 วิธี

---

## 🎯 UI Components

โปรเจคนี้ออกแบบเป็น **Component-Based Architecture** เพื่อง่ายต่อการจัดการ:

```
public/
├── index.html              # หน้าหลัก
├── css/
│   └── style.css          # สไตล์ทั้งหมด
└── js/
    ├── app.js             # Main application
    ├── components/
    │   ├── ConfigForm.js      # ฟอร์มตั้งค่า
    │   ├── ControlPanel.js    # ปุ่มควบคุม
    │   ├── CommentList.js     # แสดงรายการคอมเมนต์
    │   └── StatusBar.js       # แถบสถานะ
    └── utils/
        └── api.js         # API utility
```

### การแก้ไข Components

**เพิ่มฟีเจอร์ใหม่:**
1. แก้ไข component ที่เกี่ยวข้อง
2. เพิ่ม API endpoint ใน `server.js` (ถ้าต้องการ)
3. Refresh browser

**ตัวอย่าง - เพิ่มปุ่มใหม่:**
```javascript
// แก้ใน public/js/components/ControlPanel.js
render() {
    this.container.innerHTML = `
        ...
        <button id="btn-new" class="btn btn-primary">
            <span class="btn-icon">✨</span>
            ฟีเจอร์ใหม่
        </button>
    `;
}
```

---

## 🔧 API Endpoints

Server มี REST API สำหรับติดต่อกับ scraper:

### POST `/api/start`
เริ่มดึงคอมเมนต์

**Request:**
```json
{
  "url": "https://www.tiktok.com/@username/live",
  "duration": 600,
  "interval": 3,
  "headless": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scraper started successfully",
  "config": { ... }
}
```

### POST `/api/stop`
หยุดการทำงาน

**Response:**
```json
{
  "success": true,
  "message": "Scraper stopped successfully",
  "commentsCount": 42
}
```

### GET `/api/status`
ดึงสถานะปัจจุบัน

**Response:**
```json
{
  "running": true,
  "config": { ... },
  "commentsCount": 42,
  "uptime": 123
}
```

### GET `/api/comments?limit=100`
ดึงรายการคอมเมนต์

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "timestamp": "2026-03-27T09:30:00.000Z",
      "username": "user123",
      "comment": "สวัสดีค่ะ!"
    }
  ],
  "total": 42
}
```

### GET `/api/download?format=json|csv`
ดาวน์โหลดคอมเมนต์

---

## 📂 โครงสร้างไฟล์

```
tiktok-live-scraper/
├── public/                 # Frontend files
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── components/     # UI Components
│       └── utils/          # Utilities
├── scripts/                # Scraper scripts
│   └── scraper_wrapper.js  # Auto-generated
├── data/                   # Saved data
│   └── comments/
├── config/                 # Configurations
├── server.js               # Express server
├── package.json
└── README-UI.md            # This file
```

---

## ⚙️ Configuration

### เปลี่ยน Port

แก้ไฟล์ `server.js`:
```javascript
const PORT = 3000; // เปลี่ยนเป็นพอร์ตที่ต้องการ
```

### Custom Styling

แก้ไฟล์ `public/css/style.css`:
```css
:root {
    --primary-color: #fe2c55;    /* สีหลัก */
    --secondary-color: #25f4ee;  /* สีรอง */
    --bg-dark: #0f0f0f;          /* สีพื้นหลัง */
}
```

---

## 🐛 Troubleshooting

### ❌ Port already in use
```bash
# หา process ที่ใช้พอร์ต
netstat -ano | findstr :3000

# ฆ่า process
taskkill /PID <PID> /F

# หรือเปลี่ยน PORT ใน server.js
```

### ❌ Browser ไม่เปิด
```bash
# ติดตั้ง Playwright browsers
npx playwright install chromium
```

### ❌ ไม่เจอคอมเมนต์
- ตรวจสอบว่า Live เปิดอยู่จริง
- มีคนคอมเมนต์อยู่หรือไม่
- ลองปิด Headless Mode เพื่อดู browser

---

## 🎨 Customization

### เพิ่ม Theme ใหม่

1. สร้างไฟล์ `public/css/themes/dark.css`
2. Override CSS variables
3. Import ใน `index.html`

### เพิ่ม Language

1. สร้างไฟล์ `public/js/i18n/th.js`
2. Export translation object
3. Import และใช้ใน components

---

## 🚢 Deployment

### Local Network
```bash
# เปิดให้เครื่องอื่นเข้าได้
npm start
# เข้าผ่าน http://<your-ip>:3000
```

### Production
```bash
# ใช้ PM2 เพื่อรันต่อเนื่อง
npm install -g pm2
pm2 start server.js --name tiktok-scraper
pm2 save
```

---

## 📝 License

MIT License - ดา (OpenClaw AI) 💝

---

## 🙏 Credits

- **UI Design** - Inspired by TikTok's design language
- **Built with** - Express.js, Playwright, Vanilla JS
- **Created by** - ดา (OpenClaw AI)

---

**Happy Scraping! 🎉**
