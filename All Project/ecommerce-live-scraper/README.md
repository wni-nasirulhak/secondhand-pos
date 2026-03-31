# 🔴 TikTok Live Comment Scraper

**สถานะ:** ✅ ใช้งานได้ (Tested 2026-03-11)

---

   ```

2. รัน:
   ```bash
   run_working.bat
   ```

### ทางเลือก 2: มี Auto Login 🔑

1. สร้างไฟล์ `.env`:
   ```bash
   copy .env.example .env
   ```

2. แก้ไข `.env`:
   ```
   TIKTOK_USERNAME=your_email_or_username
   TIKTOK_PASSWORD=your_password
   ```

3. รัน:
   ```bash
   run_with_login.bat
   ```

**ดูรายละเอียดเพิ่มเติม:** [LOGIN_README.md](LOGIN_README.md)

---

## 📁 โครงสร้างไฟล์

```
tiktok-live-scraper/
├── scripts/
│   └── scrape_live_working.py    # Script หลัก
├── config/
│   └── scraper_config.json       # การตั้งค่า
├── data/
│   └── comments/                 # คอมเมนต์ที่ดึงได้
├── logs/                         # Log files
├── run_working.bat               # รันคลิกเดียว
├── requirements.txt              # Python dependencies
└── README.md                     # คู่มือนี้
```

---

## ⚙️ การตั้งค่า

### ปรับระยะเวลา Scrape

```bash
# 5 นาที
python scripts/scrape_live_working.py --duration 300 --visible

# 1 ชั่วโมง
python scripts/scrape_live_working.py --duration 3600 --visible

# Headless mode
python scripts/scrape_live_working.py --duration 600 --headless
```

### ปรับ Interval

แก้ใน `config/scraper_config.json`:

```json
{
  "tiktok": {
    "scrape_interval_seconds": 3
  }
}
```

**แนะนำ:** 3-5 วินาที

---

## 📊 ผลลัพธ์

**ไฟล์:** `data/comments/YYYY-MM-DD.json`

```json
[
  {
    "timestamp": "2026-03-11T08:41:01.927Z",
    "username": "user123",
    "comment": "hello world"
  }
]
```

**Features:**
- ✅ ไม่ซ้ำ (track ด้วย username:comment)
- ✅ บันทึกอัตโนมัติทุก 3 วินาที
- ✅ รองรับ UTF-8 (ภาษาไทย, อีโมจิ)

---

## ⚠️ สิ่งสำคัญ

1. **ไม่ต้องปิด Chrome** - Script จะเปิด browser ใหม่เอง
2. **อาจต้อง login TikTok** - ถ้า TikTok ขึ้นหน้า login ให้ login ด้วยตัวเอง
3. **Live ต้องเปิดอยู่** - ตรวจสอบ URL ใน config ว่าถูกต้อง

---

## 🚨 Troubleshooting

### ❌ ไม่เจอคอมเมนต์

- ตรวจสอบว่า Live เปิดอยู่จริงหรือเปล่า
- มีคนคอมเมนต์อยู่หรือเปล่า
- ลอง Live อื่นที่มีคนเยอะๆ

### ❌ Error ตอนรัน

ดู log file:
```bash
type logs\scraper_YYYY-MM-DD.log
```

---

## 📦 Requirements

- Python 3.10+
- Playwright

**ติดตั้ง:**
```bash
pip install -r requirements.txt
playwright install chromium
```

---

**Created by:** ดา (OpenClaw AI) 💝  
**Date:** 2026-03-11  
**Status:** Production Ready
