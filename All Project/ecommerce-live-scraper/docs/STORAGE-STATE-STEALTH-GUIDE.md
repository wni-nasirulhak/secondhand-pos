# 🎯 StorageState + Stealth Mode Guide (v2.3.0)

## ✨ ฟีเจอร์ใหม่

### 1. **StorageState Mode** (แนะนำ!)
- Login TikTok ครั้งเดียว
- บันทึก cookies/storage
- ใช้ซ้ำใน incognito mode
- **ความแน่นอนของผลลัพธ์** + ไม่โดน IP block

### 2. **Stealth Mode** (Anti-detection)
- ป้องกัน bot detection
- เลียนแบบ browser จริง
- ลด chance ถูกบล็อก

---

## 🚀 วิธีใช้งาน

### ขั้นตอนที่ 1: ติดตั้ง Dependencies ใหม่

```bash
npm install
```

(จะติดตั้ง playwright-extra และ stealth plugin)

---

### ขั้นตอนที่ 2: Restart Server

```bash
Ctrl+C
npm start
```

---

### ขั้นตอนที่ 3: เลือก Mode

เปิด http://localhost:3000

ในส่วน **"⚙️ การตั้งค่า"** จะเห็น dropdown:

```
🔐 โหมด Authentication
┌─────────────────────────────────────┐
│ StorageState (แนะนำ!) - บันทึก cookies │
└─────────────────────────────────────┘
```

**เลือก:**
- `StorageState` - Login ครั้งเดียว, ใช้ซ้ำ (แนะนำ!)
- `Persistent Context` - เก็บ session
- `Chrome Profile` - ใช้ Chrome ที่ login ไว้
- `ไม่ใช้` - Incognito ปกติ

**และติ๊ก:**
```
☑️ 🥷 Stealth Mode (ป้องกัน bot detection)
```

---

### ขั้นตอนที่ 4: Login ครั้งแรก (StorageState Mode)

**ครั้งแรก:**
1. เลือก "StorageState"
2. **ปิด Headless Mode** (เพื่อเห็น browser)
3. กดเริ่ม
4. **Browser จะเปิดขึ้นมา → Login TikTok ด้วยตัวเอง**
5. Login สำเร็จ → Scraper จะบันทึก cookies อัตโนมัติ
6. ครั้งต่อไปไม่ต้อง login ใหม่!

**ครั้งที่ 2 เป็นต้นไป:**
1. เลือก "StorageState"
2. เปิด Headless Mode ได้ (ไม่ต้องเห็น browser)
3. กดเริ่ม
4. **Browser จะโหลด cookies ที่บันทึกไว้**
5. **มี login อยู่แล้ว!** ไม่ต้องทำอะไร ✅

---

## 🎯 เปรียบเทียบ Modes

| Mode | Login ต้องทำ | Cookies | Incognito | Anti-detect | แนะนำ |
|------|-------------|---------|-----------|-------------|--------|
| **StorageState** ✨ | ครั้งแรก | บันทึกไว้ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Persistent | ทุกครั้ง | เก็บ | ❌ | ✅ | ⭐⭐⭐⭐ |
| Chrome Profile | ครั้งแรก | ใช้ Chrome | ❌ | ❌ | ⭐⭐⭐ |
| ไม่ใช้ | ไม่มี | ไม่มี | ✅ | ❌ | ⭐ |

---

## 💡 ทำไม StorageState ดีที่สุด?

### ข้อดี:
1. ✅ **Incognito Mode** - ความแน่นอนของผลลัพธ์
2. ✅ **Login ครั้งเดียว** - บันทึก cookies ไว้ใช้ซ้ำ
3. ✅ **ไม่โดน IP block** - มี login อยู่แล้ว
4. ✅ **Stealth** - ป้องกัน bot detection
5. ✅ **ง่าย** - ไม่ต้องจัดการ Chrome Profile

### เทียบกับวิธีอื่น:

**vs Chrome Profile:**
- StorageState = Incognito + มี cookies
- Chrome Profile = ใช้ Chrome ของคุณ (ไม่ Incognito)

**vs Persistent:**
- StorageState = Incognito + cookies ที่บันทึกไว้
- Persistent = เก็บทั้ง profile (ไม่ Incognito)

**vs Mobile Hotspot:**
- StorageState = ไม่ต้องเปลี่ยน IP, ใช้ login
- Mobile Hotspot = เปลี่ยน IP แต่ไม่มี login

---

## 🥷 Stealth Mode

**เปิดอะไร:**
- ซ่อน `navigator.webdriver`
- ปลอม user agent
- ซ่อน automation indicators
- เลียนแบบ browser จริง

**ข้อดี:**
- TikTok ตรวจจับได้ยากขึ้น
- ลด chance ถูกบล็อก
- ทำงานเหมือน user จริง

**แนะนำ:** เปิดไว้เสมอ!

---

## 📂 ไฟล์ที่สร้าง

**StorageState Mode:**
```
storage-states/
└── tiktok-state.json    # Cookies/storage ที่บันทึกไว้
```

**⚠️ ไม่ควร commit ไฟล์นี้** - มี cookies ของคุณ!

---

## 🔄 Reset/Login ใหม่

**ถ้าต้องการ login ใหม่:**

```bash
# ลบ storage state
rmdir /s /q storage-states

# หรือ
rm -rf storage-states
```

แล้วรันใหม่ → จะขอ login อีกครั้ง

---

## 🎯 Use Cases

### 1. Bot/Scraper ส่วนตัว
```
✅ StorageState + Stealth
```

### 2. ระบบที่ Login ยาก
```
✅ StorageState + Stealth
```

### 3. Testing/Development
```
✅ StorageState (เร็ว, ไม่ต้อง login ซ้ำ)
```

### 4. Production (24/7)
```
✅ StorageState + Stealth + Proxy
```

---

## 📝 Checklist

```
□ npm install (ติดตั้ง dependencies ใหม่)
□ Restart server
□ เลือก "StorageState" mode
□ ติ๊ก "Stealth Mode"
□ ครั้งแรก: ปิด Headless, Login TikTok ด้วยตัวเอง
□ ครั้งต่อไป: เปิด Headless ได้, ไม่ต้อง login
□ ✅ เสร็จ!
```

---

## 🆘 Troubleshooting

### ❌ Cookies หมดอายุ
→ ลบ `storage-states/` แล้ว login ใหม่

### ❌ ยังโดนบล็อก
→ ใช้ Proxy + StorageState + Stealth

### ❌ Browser ไม่เปิด
→ ตรวจสอบว่าติดตั้ง playwright browsers แล้ว

---

**Version:** 2.3.0  
**Status:** 🎉 StorageState + Stealth Ready!  
**Date:** 2026-03-27  
**Recommended:** StorageState + Stealth = วิธีที่ดีที่สุด! ⭐⭐⭐⭐⭐
