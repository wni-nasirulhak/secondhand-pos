# 🔧 Troubleshooting Guide

แนวทางแก้ปัญหาที่พบบ่อย

---

## ❌ ปัญหา: กด START.bat แล้วขึ้น error เรื่อง encoding

**อาการ:**
```
'═══╝' is not recognized as an internal or external command
'╔═══' is not recognized as an internal or external command
```

**สาเหตุ:** 
- Windows encoding ไม่รองรับตัวอักษรพิเศษ (box drawing characters)
- Terminal encoding ไม่ตรงกัน

**วิธีแก้:**

### วิธีที่ 1: ใช้ไฟล์ SIMPLE version (แนะนำ!)
```
Double-click → START-SIMPLE.bat
```
✅ ไม่มีตัวอักษรพิเศษ รันได้แน่นอน!

### วิธีที่ 2: รันด้วย Command Prompt โดยตรง
```bash
cd "C:\Users\Winon\.openclaw\workspace\All Project\ecommerce-live-scraper"
node server.js
```
จากนั้นเปิดบราวเซอร์: http://localhost:3000

### วิธีที่ 3: ใช้ PowerShell
```powershell
cd "C:\Users\Winon\.openclaw\workspace\All Project\ecommerce-live-scraper"
.\scripts\start.ps1
```

### วิธีที่ 4: ใช้ VBS (ไม่มีหน้าต่าง)
```
Double-click → scripts\START-SILENT.vbs
```

---

## 📋 รายการไฟล์ที่ใช้เปิด Server:

| ไฟล์ | ความยาก | คำอธิบาย |
|------|---------|----------|
| **START-SIMPLE.bat** | ⭐ | แนะนำ! ง่ายที่สุด ไม่มี error |
| 🚀 START.bat | ⭐⭐ | สวยแต่อาจมีปัญหา encoding |
| scripts\start.bat | ⭐⭐⭐ | รันพร้อม logs |
| scripts\start.ps1 | ⭐⭐⭐ | PowerShell (advanced) |
| scripts\START-SILENT.vbs | ⭐⭐ | รันแบบเงียบ |

---

## ❌ ปัญหา: Port 3000 ถูกใช้งานอยู่แล้ว

**อาการ:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**วิธีแก้:**

### วิธีที่ 1: ใช้ STOP.bat
```
Double-click → STOP-SIMPLE.bat
```
หรือ
```
Double-click → 🛑 STOP.bat
```

### วิธีที่ 2: หยุด process ด้วยตัวเอง
```bash
# ดู process ที่กำลังรัน
netstat -ano | findstr :3000

# หยุด process (แทน PID ด้วยตัวเลขที่เจอ)
taskkill /PID <PID> /F
```

### วิธีที่ 3: หยุดทุก Node.js process
```bash
taskkill /F /IM node.exe
```

---

## ❌ ปัญหา: บราวเซอร์ไม่เปิดอัตโนมัติ

**วิธีแก้:**
เปิดด้วยตัวเอง: http://localhost:3000

หรือรัน command:
```bash
start http://localhost:3000
```

---

## ❌ ปัญหา: Server รันไม่ได้เลย

**ตรวจสอบ:**

### 1. มี Node.js หรือยัง?
```bash
node --version
```
ถ้าไม่มี → ดาวน์โหลด: https://nodejs.org/

### 2. ติดตั้ง dependencies แล้วหรือยัง?
```bash
npm install
```

### 3. มี Playwright browsers หรือยัง?
```bash
npx playwright install chromium
```

---

## ❌ ปัญหา: แก้โค้ดแล้วไม่อัพเดท

**วิธีแก้:**
1. หยุด server (Ctrl+C หรือ STOP.bat)
2. เริ่มใหม่ (START-SIMPLE.bat)

---

## ❌ ปัญหา: Playwright browser crash

**วิธีแก้:**

### 1. เปิด Headless mode
ใน Web UI → เปิด "Headless Mode" checkbox

### 2. ลด Duration / เพิ่ม Interval
- Duration: 30 วินาที (แทน 60)
- Interval: 5 วินาที (แทน 3)

### 3. ติดตั้ง Playwright ใหม่
```bash
npx playwright install chromium --force
```

---

## ❌ ปัญหา: ไม่เจอคอมเมนต์

**วิธีแก้:**

### 1. ตรวจสอบ Live เปิดอยู่จริง
ดูว่า Live ยังเปิดอยู่หรือไม่

### 2. ลองไลฟ์อื่น
หาไลฟ์ที่มีคนคอมเมนต์เยอะๆ

### 3. Login ก่อนใช้งาน
1. ปิด "Headless Mode"
2. เริ่มรับคอมเมนต์
3. Browser จะเปิด → Login ด้วยตัวเอง
4. ครั้งต่อไปจะจำอัตโนมัติ

---

## 💡 เคล็ดลับ

### เปิด DevTools Console
กด `F12` ใน browser → Console tab
ดู error messages (ถ้ามี)

### ดู Server Logs
รัน server ด้วย `scripts\start.bat` (มี logs)

### ล้าง Cache
ลบโฟลเดอร์:
- `storage-states/` - ล้าง cookies/session
- `data/comments/` - ล้างคอมเมนต์เก่า

---

## 📞 ยังแก้ไม่ได้?

1. อ่าน [README.md](README.md)
2. ดู [QUICKSTART.md](docs/QUICKSTART.md)
3. ตรวจสอบ logs ใน command prompt
4. ลองรัน test files: `node tests/test-api.js`

---

**Last Updated:** 2026-03-30 14:06 GMT+7
