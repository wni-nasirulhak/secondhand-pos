# 🚀 วิธีเปิดใช้งาน E-commerce Live Scraper

## ⚡ วิธีที่ง่ายที่สุด (แนะนำ!)

**Double-click ที่ไฟล์นี้:**
```
🚀 START.bat
```

✅ จะเปิด server + browser ให้อัตโนมัติ!

---

## 📋 วิธีใช้งานทั้งหมด

### 1. 🚀 START.bat
**ใช้เมื่อ:** ต้องการเปิดโปรแกรมแบบง่ายๆ
- ✅ เปิด server
- ✅ เปิดบราวเซอร์ทันที (http://localhost:3000)
- ⏹️ ปิดหน้าต่างเพื่อหยุด

### 2. start.bat
**ใช้เมื่อ:** ต้องการดู logs แบบละเอียด
- ✅ เปิด server
- ✅ เปิดบราวเซอร์
- 📝 แสดง server logs
- ⏹️ กด Ctrl+C เพื่อหยุด

### 3. start.ps1 (PowerShell)
**ใช้เมื่อ:** ต้องการควบคุมแบบละเอียด
- ✅ เปิด server
- ✅ เปิดบราวเซอร์
- 🔢 แสดง Process ID
- ⏹️ กด Ctrl+C เพื่อหยุด

**วิธีรัน:**
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

หรือ right-click → "Run with PowerShell"

### 4. 🛑 STOP.bat
**ใช้เมื่อ:** ต้องการปิด server ที่ค้างอยู่
- ⏹️ หยุด server ทั้งหมด
- 🧹 ล้าง process ที่ค้าง

---

## 🎯 วิธีใช้งานแบบละเอียด

### เปิดครั้งแรก:

1. **Double-click:** `🚀 START.bat`
2. **รอ 2-3 วินาที** → บราวเซอร์จะเปิดเอง
3. **เริ่มใช้งานได้เลย!**

### หยุดการทำงาน:

**วิธีที่ 1:** ปิดหน้าต่าง command prompt
**วิธีที่ 2:** กด `Ctrl+C` ใน command prompt
**วิธีที่ 3:** Double-click `🛑 STOP.bat`

---

## 🔧 แก้ปัญหา

### ❌ Port 3000 ถูกใช้งานอยู่แล้ว
```
1. Double-click 🛑 STOP.bat
2. รอ 2 วินาที
3. Double-click 🚀 START.bat อีกครั้ง
```

### ❌ บราวเซอร์ไม่เปิด
- เปิดด้วยตัวเอง: http://localhost:3000

### ❌ Server ไม่ทำงาน
```bash
# ตรวจสอบว่ามี Node.js หรือยัง
node --version

# ถ้ายังไม่มี ต้องติดตั้งก่อน
# Download: https://nodejs.org/
```

### ❌ แก้ไขโค้ดแล้วไม่อัพเดท
```
1. หยุด server (Ctrl+C)
2. เปิดใหม่ (🚀 START.bat)
```

---

## 💡 Tips

### เปิดบราวเซอร์หลายแท็บพร้อมกัน
แก้ไข `start.bat`:
```batch
start http://localhost:3000
start http://localhost:3000/#/stats
start http://localhost:3000/#/mock-rules
```

### เปลี่ยน Port
แก้ไข `server.js`:
```javascript
const PORT = 3000; // เปลี่ยนเป็น 8080 หรืออื่นๆ
```

### Auto-restart เมื่อแก้โค้ด
ติดตั้ง nodemon:
```bash
npm install -g nodemon
nodemon server.js
```

---

## 📞 ติดปัญหา?

1. อ่าน `README.md`
2. เช็ค `FIXPLAN.md`
3. ดู logs ใน command prompt

---

**สร้างเมื่อ:** 2026-03-30
**Version:** 2.0
**Happy Coding!** 💝✨
