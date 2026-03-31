# 🔐 คู่มือแก้ปัญหา Login TikTok

## ❌ ปัญหา: "Maximum number of attempts reached. Try again later."

TikTok ตรวจจับว่าเป็น automation/bot และบล็อกการ login อัตโนมัติ

---

## ✅ วิธีแก้ไข: ใช้ Persistent Browser Context

### 🎯 **คืออะไร?**

Persistent Context = บันทึก cookies/session ของ browser ไว้ใช้ซ้ำ

**ประโยชน์:**
- ✅ Login ด้วยตัวเองครั้งเดียว
- ✅ ครั้งต่อไปไม่ต้อง login ใหม่
- ✅ TikTok ไม่บล็อก เพราะไม่ได้ auto-login
- ✅ ใช้ session เดิมที่ login ไว้แล้ว

---

## 📝 วิธีใช้งาน (ง่ายมาก!)

### ขั้นตอนที่ 1: เปิดใช้งาน Persistent Mode

1. เปิด UI (http://localhost:3000)
2. ในส่วน **"⚙️ การตั้งค่า"** จะเห็น checkbox:
   ```
   ☑️ 🔐 ใช้ Session ที่ Login ไว้ (แนะนำ)
   ```
3. **ติ๊กให้เปิด** (เปิดอยู่แล้วตั้งแต่แรก)

### ขั้นตอนที่ 2: Login ด้วยตัวเองครั้งแรก

1. **ปิด Headless Mode** (ถอดติ๊กออก) เพื่อเห็น browser
2. ใส่ URL TikTok Live
3. กดปุ่ม **"▶️ เริ่มดึงคอมเมนต์"**
4. Browser จะเปิดขึ้นมา → **Login TikTok ด้วยตัวเอง**
   - ใช้ Email/Phone/QR Code
   - ทำตามขั้นตอนปกติ
   - Verify 2FA ถ้ามี
5. หลัง login สำเร็จ → scraper จะเริ่มทำงาน
6. **ครั้งต่อไปไม่ต้อง login ใหม่!** 🎉

### ขั้นตอนที่ 3: ใช้งานต่อไป

- เปิด Headless Mode กลับได้ (ไม่แสดง browser)
- Session ที่ login ไว้จะถูกเก็บไว้ใน `user-data/`
- ไม่ต้อง login ซ้ำทุกครั้ง

---

## 📂 ข้อมูลที่เก็บ

```
tiktok-live-scraper/
├── user-data/          # ← Browser profile (cookies/session)
│   ├── Default/
│   └── ...
```

**ข้อมูลนี้อยู่ในเครื่องเท่านั้น** - ไม่ได้ส่งออกไปไหน

**อย่าลบ `user-data/`** ถ้าไม่อยากต้อง login ใหม่!

---

## 🔄 เคลียร์ Session (ถ้าต้องการ Login ใหม่)

### วิธีที่ 1: ลบโฟลเดอร์
```bash
# Windows
rmdir /s /q user-data

# Mac/Linux
rm -rf user-data
```

### วิธีที่ 2: Logout ใน Browser
1. เปิด scraper (ปิด Headless)
2. Logout TikTok ในหน้าเว็บ
3. Login บัญชีใหม่

---

## ⚙️ Advanced: ใช้ Chrome Profile จากเครื่อง

ถ้าอยากใช้ Chrome ที่ login TikTok ไว้แล้วในเครื่อง:

### Windows:
```javascript
// แก้ใน server.js (ฟังก์ชัน ensureWrapperScript)
const userDataDir = 'C:\\\\Users\\\\YourName\\\\AppData\\\\Local\\\\Google\\\\Chrome\\\\User Data';
```

### Mac:
```javascript
const userDataDir = '/Users/YourName/Library/Application Support/Google/Chrome';
```

**⚠️ คำเตือน:**
- ปิด Chrome ทั้งหมดก่อน
- อาจมีปัญหาถ้า Chrome กำลังเปิดอยู่

---

## 🐛 Troubleshooting

### ❌ ยังขึ้น "Maximum number of attempts" หลัง login

**สาเหตุ:** IP ถูกบล็อกชั่วคราว

**แก้ไข:**
1. รอ 1-2 ชั่วโมง
2. เปลี่ยน IP (รีสตาร์ทเราเตอร์)
3. ใช้ VPN
4. Login ผ่าน mobile app ก่อน แล้วค่อยใช้ web

---

### ❌ Browser ไม่เปิดหน้า Login

**สาเหตุ:** ติ๊ก Headless Mode อยู่

**แก้ไข:**
1. ถอดติ๊ก Headless Mode
2. เริ่มใหม่

---

### ❌ Session หมดอายุ (ต้อง login ใหม่)

**สาเหตุ:** TikTok logout อัตโนมัติหลังไม่ได้ใช้นาน

**แก้ไข:**
1. Login ใหม่ตามขั้นตอนที่ 2
2. ถ้าเกิดบ่อย → ติ๊ก "Remember me" ตอน login

---

### ❌ หลาย Account (ต้องการสลับ)

**วิธี 1:** ลบ `user-data/` แล้ว login ใหม่

**วิธี 2:** สร้าง user-data แยก
```javascript
// แก้ config ให้แต่ละ account มี folder ต่างกัน
const userDataDir = path.join(__dirname, '..', 'user-data-account1');
```

---

## 💡 Tips

### 🔒 ความปลอดภัย
- `user-data/` มีข้อมูล session → **ห้ามแชร์ให้คนอื่น**
- ข้อมูลอยู่ในเครื่องเท่านั้น
- Backup `user-data/` ถ้าไม่อยากต้อง login ซ้ำ

### ⚡ Performance
- Persistent mode เร็วกว่า (ไม่ต้อง login ทุกครั้ง)
- แนะนำให้เปิดไว้เสมอ

### 📱 Mobile vs Desktop
- TikTok อาจให้ login ง่ายกว่าบน mobile
- ถ้า desktop บล็อก ลอง login ผ่าน app ก่อน

---

## 📊 เปรียบเทียบ

| Mode | Login | Session | Speed | แนะนำ |
|------|-------|---------|-------|-------|
| **Persistent** ✅ | ครั้งแรกเท่านั้น | เก็บไว้ใช้ซ้ำ | เร็ว | ⭐⭐⭐⭐⭐ |
| Normal | ทุกครั้ง | ไม่เก็บ | ช้า | ⭐ |

---

## 🆘 ยังแก้ไม่ได้?

1. **ลบ user-data/ แล้วเริ่มใหม่:**
   ```bash
   rmdir /s /q user-data
   npm start
   ```

2. **ใช้ Live ที่ไม่ต้อง login:**
   - Live บางอันดูได้โดยไม่ต้อง login
   - ลองหา Live ที่เป็น public

3. **รอ TikTok ปลดบล็อก:**
   - รอ 1-2 ชั่วโมง
   - TikTok จะปลดบล็อกอัตโนมัติ

4. **ใช้อุปกรณ์อื่น:**
   - ลองใช้คอมเครื่องอื่น
   - หรือใช้ VPS/Cloud

---

**Status:** 🟢 Solution Verified  
**Version:** 2.1.2  
**Date:** 2026-03-27

---

**สรุป:**
✅ เปิด Persistent Mode (checkbox)  
✅ Login ด้วยตัวเองครั้งแรก  
✅ ครั้งต่อไปไม่ต้อง login ใหม่  
✅ แก้ปัญหา "Maximum attempts" ได้! 🎉
