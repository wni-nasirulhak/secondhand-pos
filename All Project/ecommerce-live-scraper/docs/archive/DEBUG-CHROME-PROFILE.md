# 🔍 Debug Chrome Profile ไม่ทำงาน

## ❌ ปัญหา: เปิด Chrome แล้วกลายเป็น profile ว่าง (ไม่มี login)

**อาการ:**
- เลือก Default/Profile 5 แล้ว
- Chrome เปิดขึ้นมา
- แต่ไม่มี login TikTok
- เป็น profile ใหม่ว่างๆ

---

## 🔍 การวินิจฉัย (ตรวจสอบทีละข้อ)

### 1️⃣ **Chrome ยังเปิดอยู่หรือไม่?**

**รัน:**
```
check-chrome-running.bat
```

**ถ้าเจอ Chrome process:**
```
⚠️  พบ Chrome กำลังทำงานอยู่!
→ ต้องปิดก่อน!
```

**วิธีปิด:**
```bash
# วิธีที่ 1: ปิดด้วยคำสั่ง
taskkill /F /IM chrome.exe /T

# วิธีที่ 2: Task Manager
Ctrl+Shift+Esc → หา chrome.exe → End Task ทั้งหมด
```

---

### 2️⃣ **Path ถูกต้องหรือไม่?**

**ตรวจสอบ:**
1. เปิด Chrome **ที่ login TikTok ไว้**
2. พิมพ์: `chrome://version`
3. ดู **Profile Path:**

**ตัวอย่าง:**
```
Profile Path: C:\Users\Winon\AppData\Local\Google\Chrome\User Data\Default
```

**ใช้ path นี้ใน scraper** (คัดลอกทั้งหมด รวม `\Default`)

---

### 3️⃣ **Playwright ใช้ Chrome หรือ Chromium?**

**ดูใน console server:**

**ถ้าเห็น:**
```
🔧 Using Chrome (not Chromium) with channel: chrome
✅ ดี! ใช้ Chrome จริง
```

**ถ้าไม่เห็น:**
```
❌ ใช้ Chromium (อ่าน profile ไม่ได้)
```

**แก้:**
- Restart server
- ตรวจสอบว่าแก้ไขโค้ดแล้ว (v2.1.6)

---

### 4️⃣ **ติดตั้ง Chrome หรือยัง?**

Playwright channel `chrome` ต้องการ **Chrome ติดตั้งจริงๆ**

**ตรวจสอบ:**
```
C:\Program Files\Google\Chrome\Application\chrome.exe
```

**ถ้าไม่มี:**
→ ติดตั้ง Google Chrome: https://www.google.com/chrome/

---

### 5️⃣ **Profile ถูกล็อกหรือไม่?**

**อาการ:** Error "Failed to launch browser"

**สาเหตุ:** Chrome อื่นใช้ profile อยู่

**แก้:**
1. ปิด Chrome ทั้งหมด
2. รอ 5 วินาที
3. ลองใหม่

---

## 🔧 วิธีแก้ทีละขั้น

### ขั้นที่ 1: ยืนยันว่าปิด Chrome แล้ว

```bash
# รัน
check-chrome-running.bat

# ถ้ายังเจอ Chrome
taskkill /F /IM chrome.exe /T

# รอ 5 วินาที
```

---

### ขั้นที่ 2: Restart Server

```bash
# Stop
Ctrl+C

# Start
npm start
```

**ดูใน console ว่าเห็น:**
```
🔧 Using Chrome (not Chromium) with channel: chrome
```

---

### ขั้นที่ 3: ใส่ Path เต็ม

**จาก `chrome://version`:**
```
Profile Path: C:\Users\Winon\...\User Data\Default
```

**คัดลอกทั้งหมด ใส่ใน UI**

---

### ขั้นที่ 4: ทดสอบ

1. ปิด Headless Mode (เพื่อดู browser)
2. กดเริ่ม
3. ดู Chrome ที่เปิดขึ้นมา

**ถ้าไม่มี login:**
→ ใช้ profile ผิดตัว
→ ลอง profile อื่น

---

## 🎯 Checklist Debug

```
□ ปิด Chrome ทั้งหมด (check-chrome-running.bat)
□ Restart server (Ctrl+C → npm start)
□ เห็นข้อความ "Using Chrome with channel: chrome"
□ Path เต็ม รวม \Default หรือ \Profile X
□ ปิด Headless Mode เพื่อดู browser
□ Chrome เปิดมา ดูว่ามี TikTok icon บน bookmarks หรือไม่
```

---

## 🐛 Troubleshooting

### ❌ Error: "executable doesn't exist"

**สาเหตุ:** ไม่มี Chrome ติดตั้ง

**แก้:**
1. ติดตั้ง Google Chrome
2. หรือเอา `channel: 'chrome'` ออก (ใช้ Chromium แทน)

---

### ❌ ยังไม่มี login

**ลอง:**
1. เปลี่ยน profile (Default → Profile 1 → Profile 2...)
2. หรือใช้วิธีอื่น (Mobile Hotspot)

---

### ❌ "Profile in use"

**สาเหตุ:** Chrome ยังเปิดอยู่

**แก้:**
```bash
taskkill /F /IM chrome.exe /T
```

---

## 💡 วิธีทดสอบว่า Profile มี TikTok หรือไม่

**ไม่ต้องใช้ scraper:**

1. ปิด Chrome ทั้งหมด
2. กด Win+R
3. พิมพ์:
   ```
   chrome.exe --user-data-dir="C:\Users\Winon\AppData\Local\Google\Chrome\User Data" --profile-directory="Default"
   ```
4. ถ้า Chrome เปิดมาแล้วมี TikTok login ✅
5. ถ้าไม่มี → เปลี่ยน `Default` เป็น `Profile 1`, `Profile 2`...

---

## 📝 สรุปสาเหตุที่พบบ่อย

| ปัญหา | สาเหตุ | แก้ |
|-------|--------|-----|
| Profile ว่าง | Chrome ยังเปิดอยู่ | ปิด Chrome |
| Profile ว่าง | Path ไม่ครบ (ขาด \Default) | ใส่ path เต็ม |
| Profile ว่าง | Playwright ใช้ Chromium | ใช้ `channel: chrome` |
| Profile ว่าง | เลือก profile ผิด | ลอง profile อื่น |
| Error launch | Chrome ไม่ติดตั้ง | ติดตั้ง Chrome |

---

## 🆘 ยังไม่ได้อยู่ดี?

**ใช้วิธีอื่นแทน:**

### วิธีที่ 1: Mobile Hotspot (แนะนำ!)
```
✅ ฟรี
✅ ใช้ได้แน่นอน 100%
✅ ไม่ซับซ้อน
```

### วิธีที่ 2: VPN
```
✅ ง่าย
✅ ProtonVPN ฟรี
```

### วิธีที่ 3: Proxy
```
✅ มั่นคง
💰 ~$10-50/เดือน
```

---

**Version:** 2.1.6  
**Status:** 🔍 Debug Guide  
**Date:** 2026-03-27
