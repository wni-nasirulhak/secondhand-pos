# TikTok LIVE Comment Scraper

## 🚀 ติดตั้ง

### 1. ติดตั้ง Python dependencies
```bash
pip install -r requirements.txt
```

### 2. ติดตั้ง Playwright browsers
```bash
playwright install chromium
```

## ⚙️ ตั้งค่า

แก้ไข `config/scraper_config.json`:

```json
{
  "webhook": {
    "url": "https://your-api.com/webhook"  // ใส่ URL ของ API
  }
}
```

## ▶️ วิธีรัน

```bash
cd C:\Users\Winon\.openclaw\workspace
python scripts/scrape_live.py
```

## 🛑 หยุดการทำงาน

กด `Ctrl+C` เพื่อหยุดและบันทึกข้อมูล

## 📁 ข้อมูลที่เก็บ

Comments จะถูกบันทึกใน:
```
data/comments/2026-03-11.json
```

## 🔧 Troubleshooting

### ถ้าเจอ Error: "playwright not found"
```bash
pip install playwright
playwright install chromium
```

### ถ้า TikTok ขึ้นว่า "Login Required"
- เปลี่ยน `headless: false` เพื่อเห็นหน้าจอ
- Login ด้วยมือครั้งแรก
- หรือใช้ Cookie authentication (ต้องเพิ่ม code)

### ถ้า Selectors ไม่ทำงาน
- TikTok อาจเปลี่ยน class names
- เปิด Developer Tools (F12) แล้วหา selector ใหม่
- อัปเดตใน `config/scraper_config.json`
