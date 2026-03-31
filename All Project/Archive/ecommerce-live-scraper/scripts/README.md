# 🚀 Scripts Directory

สคริปต์เสริมสำหรับการรัน server

---

## 📁 ไฟล์ในโฟลเดอร์นี้

### 📝 [start.bat](start.bat)
- เปิด server พร้อมแสดง logs
- แสดงข้อมูลการทำงานแบบละเอียด
- กด Ctrl+C เพื่อหยุด

**วิธีใช้:**
```
Double-click → start.bat
```

---

### 💻 [start.ps1](start.ps1)
- เปิด server ด้วย PowerShell
- แสดง Process ID
- ควบคุมได้ละเอียด

**วิธีใช้:**
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```
หรือ Right-click → "Run with PowerShell"

---

### 🔇 [START-SILENT.vbs](START-SILENT.vbs)
- เปิด server แบบเงียบสนิท
- ไม่แสดงหน้าต่าง command prompt
- แสดง popup แจ้งเตือนสั้นๆ

**วิธีใช้:**
```
Double-click → START-SILENT.vbs
```

**เหมาะสำหรับ:**
- ใช้งานจริง (production)
- ไม่ต้องการ console รบกวน
- รัน background

---

## ⚠️ หมายเหตุ

สคริปต์หลัก (ที่ใช้บ่อย) อยู่ที่ root directory:
- `🚀 START.bat` - เปิด server (แนะนำ)
- `🛑 STOP.bat` - หยุด server

สคริปต์ในโฟลเดอร์นี้เป็นตัวเลือกเสริม สำหรับผู้ที่ต้องการ:
- ดู logs แบบละเอียด
- ใช้ PowerShell
- รัน background

---

## 📚 เอกสารเพิ่มเติม

- [QUICKSTART.md](../docs/QUICKSTART.md) - วิธีเริ่มต้นใช้งาน
- [HOW-TO-RUN.md](../docs/HOW-TO-RUN.md) - คู่มือการใช้งานทั้งหมด

---

**Last Updated:** 2026-03-30 14:00 GMT+7
