# 📁 TikTok Live Auto Reply System - โครงสร้างโปรเจค

อัพเดท: 2026-03-12

---

## 🎯 ไฟล์หลัก (ใช้งานจริง)

### 🤖 Core System
- **`auto_reply_system.py`** - ระบบหลัก (Scraper + Webhook + Reply Bot รวมกัน)
- **`webhook_server.py`** - Webhook Server (AI response)
- **`comment_filter.py`** - Comment Filter (กรองคอมเมนต์)

### ⚙️ Configuration
- **`filter_config.json`** - ตั้งค่า Filter (cooldown, rate limit, keywords)
- **`config/scraper_config.json`** - ตั้งค่าระบบหลัก (Live URL, webhook, etc.)
- **`.env`** - Credentials (username/password) - ไม่ใช้แล้วถ้าล็อคอินเอง

### 🚀 Quick Start
- **`run_auto_reply.bat`** - รันระบบด่วน (Windows)
- **`test_webhook.py`** - ทดสอบ Webhook

### 📖 Documentation
- **`README.md`** - คู่มือหลัก
- **`LOGIN_README.md`** - คู่มือ Login
- **`QUICK_START.md`** - คู่มือเริ่มต้นด่วน
- **`PROJECT_STRUCTURE.md`** - ไฟล์นี้

---

## 📂 โครงสร้างโปรเจค (ใหม่)

```
tiktok-live-scraper/
│
├── 🤖 scripts/python/           # รวมไฟล์ Python ทั้งหมด
│   ├── auto_reply_system.py       # ระบบหลัก ⭐
│   ├── webhook_server.py           # Webhook Server
│   ├── comment_filter.py           # Comment Filter
│   ├── test_webhook.py             # Testing tool
│   └── requirements.txt            # Python dependencies
│
├── ⚙️ config/                   # ไฟล์ตั้งค่า
│   ├── scraper_config.json         # Main config
│   └── filter_config.json          # Filter config
│
├── 🚀 bin/                      # ไฟล์รันระบบ (Executable/Batch)
│   └── run_auto_reply.bat          # Quick start
│
├── 📖 docs/                     # คู่มือการใช้งาน
│   ├── LOGIN_README.md
│   ├── QUICK_START.md
│   └── PROJECT_STRUCTURE.md        # ไฟล์นี้
│
├── 💾 data/                     # ข้อมูลที่สร้างอัตโนมัติ
│   └── comments/                   # ประวัติคอมเมนต์
│
├── 📝 logs/                     # ประวัติ Log
│
├── 🌐 public/                   # Frontend UI (Web interface)
├── 📦 node_modules/             # Node.js dependencies
├── server.js                   # Main Node.js Server ⭐
├── package.json                # Node.js config
└── README.md                   # หน้าหลักโปรเจค
```

---

## 🚀 วิธีใช้งาน

### 1. เปิด Webhook Server
```bash
python scripts/python/webhook_server.py
```

### 2. รัน Auto Reply System
```bash
python scripts/python/auto_reply_system.py --duration 600 --visible
```

หรือใช้ batch file:
```bash
bin/run_auto_reply.bat
```

---

## 🔧 การปรับแต่ง

### ปรับ Filter (กรองคอมเมนต์)
แก้ไข: **`config/filter_config.json`**

```json
{
  "cooldown_seconds": 120,        // ตอบคนเดิมทุก 2 นาที
  "max_replies_per_round": 2,     // ตอบไม่เกิน 2 คนต่อรอบ
  "priority_keywords": ["ราคา", "?"]
}
```

### ปรับ AI Replies
แก้ไข: **`scripts/python/webhook_server.py`** → ฟังก์ชัน `generate_reply()`

### ปรับ Live URL
แก้ไข: **`config/scraper_config.json`**

```json
{
  "tiktok": {
    "url": "https://www.tiktok.com/@your_username/live"
  }
}
```

---

## 📊 ไฟล์ที่สร้างขึ้นอัตโนมัติ

### Comments Database
```
data/comments/2026-03-12.json
```

Format:
```json
[
  {
    "timestamp": "2026-03-12T09:37:00Z",
    "username": "testuser",
    "comment": "สวัสดีครับ"
  }
]
```

### Log Files
```
logs/auto_reply_2026-03-12.log
```

---

## 🗑️ ไฟล์ที่ย้ายไป Archive

**ไฟล์เก่าที่ไม่ใช้แล้ว** (ย้ายไป `archive/` แล้ว):

- `reply_bot.py` - ถูกรวมเข้า `auto_reply_system.py`
- `scrape_with_login.py` - ถูกรวมเข้า `auto_reply_system.py`
- `scrape_live_working.py` - ถูกรวมเข้า `auto_reply_system.py`
- `run_working.bat` - ใช้ `run_auto_reply.bat` แทน

**เหตุผล:** ทำให้โปรเจคเรียบง่าย ใช้ไฟล์เดียว (`auto_reply_system.py`) รวมทุกอย่าง

---

## ✨ Features

### ✅ ระบบหลัก
- ✅ Scrape คอมเมนต์จาก TikTok Live
- ✅ ส่งไปยัง Webhook (AI)
- ✅ รับคำตอบกลับ
- ✅ ตอบคอมเมนต์ใน Live อัตโนมัติ

### 🔍 Comment Filter
- ✅ Cooldown per user (ไม่ตอบคนเดิมบ่อยเกินไป)
- ✅ Rate limiting (จำกัดการตอบต่อรอบ)
- ✅ Smart filter (กรอง emoji, คำสั้น, ซ้ำ)
- ✅ Priority filter (ให้ priority คำถาม/keyword)

### 🤖 AI Replies
- ✅ Rule-based replies
- ✅ Customizable keywords
- ✅ Context-aware responses

---

## 🎯 Workflow

```
TikTok Live Comment
       ↓
  📥 Scraper (auto_reply_system.py)
       ↓
  🔍 Filter (comment_filter.py)
       ↓ (ผ่าน)
  🌐 Webhook (webhook_server.py)
       ↓
  💬 AI Reply
       ↓
  📤 Send to Live (auto_reply_system.py)
```

---

## 📝 Version History

### v1.0.0 (2026-03-12)
- ✅ ระบบ Auto Reply ครบวงจร
- ✅ Comment Filter (cooldown, rate limit, smart filter)
- ✅ Webhook integration
- ✅ แยกไฟล์ให้แก้ไขง่าย
- ✅ ย้ายไฟล์เก่าไป archive/

---

**Created by:** ดา 💝  
**Project:** TikTok Live Auto Reply System  
**Status:** Production Ready ✅
