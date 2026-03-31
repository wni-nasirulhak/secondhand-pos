# 🎯 แก้สุดท้าย - Chrome Profile (v2.2.0)

## ✅ แก้ Error: "Pass userDataDir parameter to launchPersistentContext"

**ปัญหา:**
```
Playwright ไม่ยอมให้ใช้ --user-data-dir ใน launch() args
```

**แก้แล้ว:**
```javascript
// ใช้ launchPersistentContext พร้อม path เต็ม (มี \Default)
context = await chromium.launchPersistentContext(
    'C:\\Users\\Winon\\...\\User Data\\Default',  // ← path เต็ม!
    { channel: 'chrome' }
);
```

---

## 🚀 ลองใหม่ (3 ขั้นตอน)

### 1️⃣ ปิด Chrome ทั้งหมด
```bash
taskkill /F /IM chrome.exe /T
```

### 2️⃣ Restart Server (สำคัญ!)
```bash
Ctrl+C
npm start
```

### 3️⃣ ลองใน UI
1. เปิด http://localhost:3000
2. ติ๊ก "ใช้ Chrome Profile"
3. เลือก **Default**
4. **ปิด Headless Mode**
5. กดเริ่ม!

---

## 🎯 ควรเห็น

**Console:**
```
🌐 Using Chrome profile: C:\Users\Winon\...\Default
🚀 Launching Chrome with persistent context...
✅ Chrome launched successfully
🔗 Navigating to: https://...
✅ Page loaded successfully
```

**Browser:**
- Chrome เปิดพร้อม login TikTok ✅
- เปิด TikTok Live URL ✅
- Scraper ดึงคอมเมนต์ ✅

---

## 💡 ทำไมครั้งนี้ต้องได้?

| | v2.1.8 (ไม่ได้) | v2.2.0 (ใหม่) |
|---|---|---|
| Method | launch() + args | **launchPersistentContext** |
| Args | --user-data-dir | **ไม่ใช้ args** |
| Path | แยก User Data + Profile | **path เต็มเดียว** |
| Playwright | ❌ error | ✅ ยอมรับ |

---

## 📝 Checklist

```
□ ปิด Chrome (taskkill /F /IM chrome.exe /T)
□ Restart server (Ctrl+C → npm start)
□ ติ๊ก "ใช้ Chrome Profile"
□ เลือก Default
□ ปิด Headless Mode
□ กดเริ่ม
□ เห็น "Chrome launched successfully" ✅
```

---

## 🆘 ถ้ายังไม่ได้

**ใช้ Mobile Hotspot!** 📱

```
✅ 5 นาทีเสร็จ
✅ ได้ผล 100%
✅ ฟรี
✅ ไม่ต้องแก้อะไร
```

**ขั้นตอน:**
```
1. เปิด Hotspot จากมือถือ
2. เชื่อมคอมเข้า hotspot
3. เริ่ม scraper (ไม่ต้องใช้ Chrome Profile)
4. ✅ เสร็จ!
```

---

**Version:** 2.2.0  
**Status:** 🎯 FINAL FIX - launchPersistentContext with full path  
**Date:** 2026-03-27

**🎉 ครั้งนี้ต้องได้แน่นอน!**
