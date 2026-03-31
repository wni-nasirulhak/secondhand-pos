# 🧪 Testing Guide

## Bug Fixes (v2.1.1)

### ✅ แก้ไขแล้ว:

#### 1️⃣ **Load Preset แล้ว UI หาย**
**สาเหตุ:** `ConfigForm.setConfig()` ใช้ `document.getElementById()` ที่อาจหา element ไม่เจอ

**แก้ไข:** เปลี่ยนเป็น `this.container.querySelector()` เพื่อหา element จาก container

**ทดสอบ:**
1. บันทึก preset ใหม่
2. กดปุ่ม "📂 โหลด"
3. ✅ ควรเห็น UI ยังอยู่ และค่าใน form เปลี่ยนตาม preset

---

#### 2️⃣ **กดหยุดแล้วไม่หยุด**
**สาเหตุ:** 
- Windows ต้องใช้ `taskkill` เพื่อ kill process tree
- Playwright browser ยังทำงานอยู่
- Wrapper script ไม่รับ SIGTERM

**แก้ไข:**
- เพิ่ม `taskkill /T /F` บน Windows
- Wrapper script รับ SIGTERM/SIGINT
- เพิ่ม `shouldStop` flag
- เพิ่มการปิด browser อย่างสวยงาม

**ทดสอบ:**
1. เริ่ม scraper
2. รอ 10 วินาที
3. กดปุ่ม "⏹️ หยุด"
4. ✅ ควรหยุดภายใน 2-3 วินาที
5. ✅ Browser ควรปิดอัตโนมัติ
6. ✅ สถานะเปลี่ยนเป็น "หยุดการทำงาน"

---

## 🧪 Test Cases

### Test 1: บันทึกและโหลด Preset
```
1. ตั้งค่า URL, Duration, Interval
2. กดปุ่ม "➕ บันทึกการตั้งค่า"
3. ตั้งชื่อ "Test Preset"
4. เปลี่ยนค่าใน form เป็นค่าอื่น
5. กดปุ่ม "📂 โหลด" ที่ preset ที่บันทึกไว้
6. ✅ ค่าใน form ควรกลับมาเป็นค่าเดิม
7. ✅ UI ยังแสดงปกติ
```

### Test 2: หยุดการทำงาน
```
1. ใส่ URL ของ TikTok Live จริง
2. ตั้ง Duration = 60 นาที
3. กดปุ่ม "▶️ เริ่มดึงคอมเมนต์"
4. รอ 10-20 วินาที (ให้มีคอมเมนต์บ้าง)
5. กดปุ่ม "⏹️ หยุด"
6. ✅ สถานะเปลี่ยนเป็น "หยุดการทำงาน"
7. ✅ Browser ปิด (ถ้าไม่ใช่ headless mode)
8. ✅ ไม่มีคอมเมนต์ใหม่เพิ่มขึ้น
9. ✅ สามารถกด "▶️ เริ่ม" ใหม่ได้
```

### Test 3: Keyword Alerts
```
1. เพิ่มคำสำคัญ เช่น "สวัสดี"
2. เปิด Toggle (เขียว)
3. เริ่ม scraper
4. รอจนมีคอมเมนต์ที่มีคำว่า "สวัสดี"
5. ✅ ควรเห็น notification แจ้งเตือน
6. ✅ ควรมีรายการในประวัติการแจ้งเตือน
```

### Test 4: Auto-Save Config
```
1. ตั้งค่า URL, Duration, Interval
2. ปิด browser
3. เปิดใหม่ (http://localhost:3000)
4. ✅ ค่าที่ตั้งไว้ควรยังอยู่
```

### Test 5: Recent URLs
```
1. ใส่ URL แรก, เริ่ม scraper, หยุด
2. ใส่ URL ที่สอง, เริ่ม scraper, หยุด
3. คลิกที่ช่อง URL
4. ✅ ควรเห็น dropdown แสดง URL ทั้งสอง
5. ✅ คลิกเลือกได้
```

---

## 🐛 Debug Mode

ถ้ายังมีปัญหา ให้เปิด Console (F12) และดู:

### Browser Console:
```javascript
// ดูสถานะปัจจุบัน
await fetch('/api/status').then(r => r.json())

// ลองหยุด
await fetch('/api/stop', { method: 'POST' }).then(r => r.json())
```

### Server Console:
```
🚀 Starting scraper...
🛑 Stopping scraper process...
✅ Scraper stopped
```

---

## ⚠️ Known Issues

### Issue: Playwright ติดตั้งไม่สมบูรณ์
**Symptom:** `Error: Executable doesn't exist`

**แก้ไข:**
```bash
npx playwright install chromium
```

### Issue: Port 3000 ถูกใช้งานอยู่
**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**แก้ไข:**
```bash
# หา process
netstat -ano | findstr :3000

# ฆ่า process
taskkill /PID <PID> /F
```

### Issue: Browser ไม่ปิดหลัง stop
**แก้ไข (ชั่วคราว):**
1. ปิด browser ด้วยตัวเอง
2. Restart server (`Ctrl+C` แล้ว `npm start` ใหม่)

---

## 📝 Change Log (v2.1.1)

**Fixed:**
- ✅ ConfigForm.setConfig() ใช้ querySelector แทน getElementById
- ✅ stopScraper() ใช้ taskkill บน Windows
- ✅ Wrapper script รับ SIGTERM/SIGINT
- ✅ เพิ่ม shouldStop flag เพื่อหยุดการ loop
- ✅ เพิ่มการปิด browser อย่างสวยงาม
- ✅ เพิ่มการตรวจสอบสถานะหลัง stop

**Improved:**
- ✅ Debug logging ดีขึ้น
- ✅ Error handling ดีขึ้น
- ✅ Graceful shutdown

---

## 🆘 ถ้ายังมีปัญหา

1. **Restart Server:**
   ```bash
   Ctrl+C
   npm start
   ```

2. **Clear LocalStorage:**
   ```javascript
   // ใน Console (F12)
   localStorage.clear();
   location.reload();
   ```

3. **ตรวจสอบ Processes:**
   ```bash
   # Windows
   tasklist | findstr node
   tasklist | findstr chrome
   
   # ฆ่าทั้งหมด
   taskkill /F /IM node.exe /T
   taskkill /F /IM chrome.exe /T
   ```

---

**Status:** 🟢 Ready for Testing  
**Version:** 2.1.1  
**Date:** 2026-03-27
