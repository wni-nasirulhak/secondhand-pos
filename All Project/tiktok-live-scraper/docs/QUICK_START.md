# 🚀 TikTok Live Auto Reply System - Quick Start Guide

## 📋 ข้อกำหนดเบื้องต้น

✅ Python 3.10+  
✅ Playwright ติดตั้งแล้ว  
✅ Flask ติดตั้งแล้ว  
✅ Login TikTok บนเครื่องนี้ได้

---

## ⚡ เริ่มต้นใช้งานด่วน

### Step 1: เปิด Terminal สองหน้าต่าง

#### 📍 Terminal 1 - Webhook Server

```bash
cd C:\Users\Winon\.openclaw\workspace\tiktok-live-scraper
python webhook_server.py
```

**Output ที่ควรเห็น:**
```
======================================================================
🌐 TikTok Live Webhook Server
======================================================================
📍 Server running on: http://localhost:3000
🔗 Webhook endpoint: http://localhost:3000/webhook
💚 Health check: http://localhost:3000/health
======================================================================
```

#### 📍 Terminal 2 - Auto Reply System

```bash
cd C:\Users\Winon\.openclaw\workspace\tiktok-live-scraper
python auto_reply_system.py --duration 600 --visible
```

**หรือใช้ Batch File:**
```bash
run_auto_reply.bat
```

---

## 🎛️ ตัวเลือกเพิ่มเติม

### ปรับระยะเวลาทำงาน

```bash
# 5 นาที (300 วินาที)
python auto_reply_system.py --duration 300 --visible

# 1 ชั่วโมง (3600 วินาที)
python auto_reply_system.py --duration 3600 --visible

# ไม่จำกัดเวลา (ต้องกด Ctrl+C เพื่อหยุด)
python auto_reply_system.py --duration 999999 --visible
```

### Headless Mode (ไม่แสดง Browser)

```bash
python auto_reply_system.py --duration 600 --headless
```

---

## 🔧 การตั้งค่า

### แก้ไข Live URL

แก้ไขไฟล์: `config/scraper_config.json`

```json
{
  "tiktok": {
    "url": "https://www.tiktok.com/@your_username/live",
    ...
  }
}
```

### เปิด/ปิด Webhook

```json
{
  "webhook": {
    "enabled": true,  // เปลี่ยนเป็น false เพื่อปิด
    "url": "http://localhost:3000/webhook"
  }
}
```

### ปรับความถี่ Scrape

```json
{
  "tiktok": {
    "scrape_interval_seconds": 3  // เปลี่ยนเป็น 5, 10 ก็ได้
  }
}
```

---

## 📊 การดูผลลัพธ์

### 1. ดู Console Output

ระบบจะแสดงผลแบบนี้:
```
[Round  5 |  12s] Scraping... ✅ 2 new
     👤 username: สวัสดีครับ
     💬 Reply: สวัสดีครับคุณ username ยินดีต้อนรับ! 💝
     ✅ Sent to Live!
```

### 2. ดู Log Files

```bash
# Log วันนี้
type logs\auto_reply_2026-03-12.log

# Log ทั้งหมด
dir logs
```

### 3. ดูคอมเมนต์ที่เก็บไว้

```bash
type data\comments\2026-03-12.json
```

**Format:**
```json
[
  {
    "timestamp": "2026-03-12T09:37:00.000Z",
    "username": "testuser",
    "comment": "สวัสดีครับ"
  }
]
```

---

## 🛑 การหยุดระบบ

### หยุด Auto Reply System

กด `Ctrl + C` ใน Terminal ที่รัน `auto_reply_system.py`

### หยุด Webhook Server

กด `Ctrl + C` ใน Terminal ที่รัน `webhook_server.py`

---

## ⚙️ ปรับแต่ง AI Replies

แก้ไขไฟล์: `webhook_server.py`

ในฟังก์ชัน `generate_reply()`:

```python
def generate_reply(username: str, comment: str) -> str:
    """สร้างคำตอบจากคอมเมนต์"""
    
    comment_lower = comment.lower()
    
    # เพิ่ม rule ใหม่ตรงนี้
    if 'ราคา' in comment or 'เท่าไหร่' in comment:
        return "ราคาและรายละเอียดเช็คที่ลิงก์ใต้วิดีโอได้เลยครับ 🛒"
    
    # ... เพิ่มเติมได้ตามต้องการ
```

**หลังจากแก้แล้ว:**
1. กด `Ctrl + C` หยุด Webhook Server
2. รันใหม่: `python webhook_server.py`

---

## 🚨 Troubleshooting

### ❌ Webhook Server เชื่อมต่อไม่ได้

**ตรวจสอบ:**
```bash
# เช็คว่า server รันอยู่ไหม
curl http://localhost:3000/health

# หรือเปิด browser ไปที่
http://localhost:3000
```

### ❌ ส่งคอมเมนต์ไม่สำเร็จ

**สาเหตุที่เป็นไปได้:**
1. ยังไม่ได้ login TikTok
2. Live ปิดไปแล้ว
3. TikTok เปลี่ยน UI

**วิธีแก้:**
- ใช้ `--visible` mode แล้วเช็คหน้า browser
- Login TikTok ด้วยตัวเอง
- เช็ค log file ดู error

### ❌ ไม่เจอคอมเมนต์

**สาเหตุ:**
- Live ไม่มีคนคอมเมนต์
- Selector เปลี่ยน

**วิธีแก้:**
- ทดสอบกับ Live ที่มีคนคอมเมนต์เยอะๆ
- เช็ค log ดู error

---

## 📁 โครงสร้างไฟล์

```
tiktok-live-scraper/
├── auto_reply_system.py       # ← Script หลัก (รันอันนี้!)
├── webhook_server.py           # ← Webhook Server
├── reply_bot.py                # ← Reply Bot (standalone)
├── run_auto_reply.bat          # ← Batch file สำหรับรัน
├── config/
│   └── scraper_config.json     # ← การตั้งค่า
├── data/
│   └── comments/               # ← คอมเมนต์ที่เก็บไว้
├── logs/                       # ← Log files
└── QUICK_START.md              # ← คู่มือนี้
```

---

## 💡 Tips

### Tip 1: รัน 2 Terminal พร้อมกัน

แนะนำให้ใช้ **Windows Terminal** เพื่อเปิดหลาย tab:
- Tab 1: Webhook Server
- Tab 2: Auto Reply System

### Tip 2: ทดสอบ Webhook ก่อน

```bash
python test_webhook.py
```

### Tip 3: ดู Live Output แบบ Real-time

ใช้ `--visible` mode เสมอในช่วงทดสอบ

### Tip 4: Backup คอมเมนต์

คัดลอกไฟล์ใน `data/comments/` ไว้ก่อนลบ

---

## 🎯 Workflow แนะนำ

1. **เปิด Webhook Server ทิ้งไว้** (เปิดทั้งวันก็ได้)
2. **รัน Auto Reply เมื่อต้องการ** (ก่อน Live)
3. **ปิด Auto Reply หลัง Live เสร็จ** (Ctrl+C)
4. **Webhook Server ปิดตอนจบวัน** (หรือปล่อยทิ้งไว้ก็ได้)

---

**Created by:** ดา 💝  
**Date:** 2026-03-12  
**Version:** 1.0.0

ถ้ามีปัญหาหรือต้องการความช่วยเหลือ ติดต่อดาได้เสมอนะคะ! 🌸
