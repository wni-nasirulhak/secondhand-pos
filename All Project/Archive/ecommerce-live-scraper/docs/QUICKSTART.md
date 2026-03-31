# 🚀 Quick Start Guide

**Get started with E-commerce Live Scraper in 3 minutes!**

---

## ⚡ วิธีที่ง่ายที่สุด! (10 วินาที)

### 🎯 แค่ Double-Click!

**Windows:**
```
Double-click → 🚀 START.bat
```

✅ เสร็จแล้ว! Server + Browser จะเปิดอัตโนมัติ!

---

## 📋 วิธีอื่นๆ

### 1. 🚀 START.bat (แนะนำ)
- Double-click เพื่อเปิด
- รอ 2-3 วินาที
- Browser จะเปิดเอง → http://localhost:3000

### 2. start.bat (สำหรับดู Logs)
- Double-click เพื่อเปิด
- เห็น server logs แบบละเอียด
- กด Ctrl+C เพื่อหยุด

### 3. START-SILENT.vbs (เงียบสนิท)
- Double-click เพื่อเปิด
- ไม่แสดงหน้าต่าง command prompt
- เหมาะสำหรับใช้งานจริง

### 4. PowerShell (Advanced)
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

### 5. Manual (แบบดั้งเดิม)
```bash
cd C:\Users\Winon\.openclaw\workspace\All Project\ecommerce-live-scraper
npm start
```
จากนั้นเปิดบราวเซอร์: http://localhost:3000

---

## 🛑 วิธีหยุด Server

### วิธีที่ 1: Double-click
```
🛑 STOP.bat
```

### วิธีที่ 2: ใน Command Prompt
กด `Ctrl+C`

### วิธีที่ 3: ปิดหน้าต่าง
ปิด command prompt window

---

## 🎯 การใช้งาน (2 นาที)

### 3. Configure & Start

1. **Select Platform:** Choose TikTok, Shopee, or Lazada
2. **Enter Live URL:** Paste the live stream URL
3. **Set Duration:** How long to scrape (e.g., 60 seconds)
4. **Set Interval:** How often to check (e.g., 3 seconds)
5. **Click "Start Scraping"**

### 4. Watch Results

Comments will appear in real-time in the "Live Comments" section!

---

## 📝 Example URLs

### TikTok Live
```
https://www.tiktok.com/@username/live
```

### Shopee Live
```
https://live.shopee.co.th/...
```

### Lazada Live
```
https://pages.lazada.co.th/wow/...
```

---

## 🎨 Features

- ✅ **Real-time scraping** - See comments as they appear
- ✅ **Multi-platform** - TikTok, Shopee, Lazada support
- ✅ **Auto-deduplication** - No duplicate comments
- ✅ **History** - Save and view past scraping sessions
- ✅ **Beautiful UI** - Modern, responsive design

---

## 🔧 Tips

### Headless Mode
- ✅ Checked = Browser hidden (faster)
- ❌ Unchecked = Browser visible (see what's happening)

### Duration & Interval
- **Duration:** Total scraping time
- **Interval:** Check frequency
- Recommended: Duration=60s, Interval=3s

### First-Time Login
If you haven't logged in before:
1. Keep "Headless" unchecked
2. Browser will open
3. Log in manually
4. Next time it will remember!

---

## 🆘 Troubleshooting

### ❌ "No comments found"
- Make sure the live stream is active
- Try a different live with more comments
- Check if you need to log in

### ❌ Browser crashes
- Enable headless mode
- Reduce duration
- Increase interval

### ❌ Server won't start
- Check if port 3000 is free
- Kill any existing node processes

---

## 🎉 That's It!

You're ready to scrape live comments from TikTok, Shopee, and Lazada!

For more details, see [README.md](README.md)

---

**Questions?** Check the [TESTING-RESULTS.md](TESTING-RESULTS.md) for test coverage and architecture details.

**Created by:** ดา (OpenClaw AI) 💝
