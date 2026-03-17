# 🔑 Auto Login - คู่มือใช้งาน

ฟีเจอร์ Auto Login จะทำการ login TikTok อัตโนมัติก่อนเริ่ม scrape

---

## 🚀 Quick Start

### 1. สร้างไฟล์ `.env`

```bash
# Copy ไฟล์ตัวอย่าง
copy .env.example .env
```

### 2. แก้ไขไฟล์ `.env`

เปิดไฟล์ `.env` ด้วย Notepad แล้วกรอก:

```
TIKTOK_USERNAME=your_email_or_username
TIKTOK_PASSWORD=your_password
```

**ตัวอย่าง:**
```
TIKTOK_USERNAME=myemail@gmail.com
TIKTOK_PASSWORD=MySecretPassword123
```

### 3. รัน

```bash
run_with_login.bat
```

หรือ

```bash
python scripts/scrape_with_login.py --duration 120 --visible
```

**เท่านี้เอง!** 🎉

---

## 🔐 ความปลอดภัย

### ⚠️ สำคัญ!

1. **อย่า commit `.env` ขึ้น Git!**
   - ไฟล์ `.gitignore` บล็อกอยู่แล้ว
   - แต่ให้ระวังอย่าแชร์ไฟล์นี้ออกไป

2. **ใช้รหัสผ่านปกติ ไม่ใช่ App Password**
   - ใช้รหัสผ่านที่ใช้ login TikTok ปกติ

3. **ถ้ามี 2FA (Two-Factor Authentication)**
   - Auto login จะ**ไม่ทำงาน**
   - ต้อง login ด้วยตัวเอง (script จะรอให้)

---

## 📝 ขั้นตอนการ Login

Script จะทำขั้นตอนเหล่านี้อัตโนมัติ:

```
1. เปิด TikTok.com
2. คลิก "Log in" button
3. คลิก "Use phone / email / username"
4. คลิก "Use email or username"
5. กรอก username/email
6. กรอก password
7. คลิก "Log in"
8. ตรวจจับ CAPTCHA (ถ้ามี):
   - แสดงข้อความบอก user
   - รอให้ user ทำ CAPTCHA เสร็จ (สูงสุด 60 วินาที)
   - ตรวจสอบทุกวินาทีว่า login สำเร็จหรือยัง
9. รอจนกว่า login สำเร็จ
10. ไปที่ Live URL
11. เริ่ม scrape!
```

---

## 🤖 CAPTCHA Handling (ใหม่!)

**สิ่งที่เพิ่มเข้ามา:**

1. **ตรวจจับ CAPTCHA อัตโนมัติ**
   - Script จะรู้ว่ามี CAPTCHA หรือไม่
   - ไม่ต้องกังวลว่า script จะวิ่งต่อทันที

2. **รอให้ user ทำ CAPTCHA**
   - Script จะ**หยุดรอ**จนกว่า C จะทำ CAPTCHA เสร็จ
   - รอสูงสุด **60 วินาที**
   - ตรวจสอบทุก 1 วินาทีว่า login สำเร็จหรือยัง

3. **ทำงานต่ออัตโนมัติ**
   - เมื่อ C ทำ CAPTCHA เสร็จ → script ตรวจพบทันที
   - ทำงานต่อโดยไม่ต้องรันใหม่ ✅

**Output ที่จะเห็น:**

```bash
[6/6] Clicking 'Log in' button...
⏳ Waiting for login to complete...
🤖 CAPTCHA detected! Please solve it...
⏳ Waiting for you to complete CAPTCHA (max 60 seconds)...

# <-- C ทำ CAPTCHA ตรงนี้ -->

✅ CAPTCHA completed! Login successful! (took 15s)
✅ Ready to scrape!
```

---

## ⚙️ Options

### รันโดยไม่ login อัตโนมัติ

```bash
python scripts/scrape_with_login.py --duration 120 --visible --no-login
```

### Headless mode (ไม่เห็น browser)

```bash
python scripts/scrape_with_login.py --duration 300 --headless
```

### ระยะเวลาอื่นๆ

```bash
# 10 นาที
python scripts/scrape_with_login.py --duration 600 --visible

# 1 ชั่วโมง
python scripts/scrape_with_login.py --duration 3600 --visible
```

---

## 🚨 Troubleshooting

### ❌ Login ไม่สำเร็จ

**สาเหตุที่เป็นไปได้:**

1. **Username/Password ผิด**
   - เช็คไฟล์ `.env` อีกครั้ง
   - ลอง login ด้วยตัวเองใน browser ปกติ

2. **TikTok ขึ้น CAPTCHA** ✅ แก้ไขแล้ว!
   - Script จะ**ตรวจจับ CAPTCHA อัตโนมัติ**
   - แสดงข้อความ: `🤖 CAPTCHA detected! Please solve it...`
   - **รอให้ C ทำ CAPTCHA เสร็จ** (สูงสุด 60 วินาที)
   - หลังจาก C ทำเสร็จ → script จะทำงานต่ออัตโนมัติ ✅

3. **มี 2FA (Two-Factor Authentication)**
   - Auto login ไม่ทำงานกับ 2FA
   - ให้ปิด 2FA ชั่วคราว หรือ login ด้วยตัวเอง

4. **TikTok เปลี่ยน UI**
   - Selectors ใน code อาจล้าสมัย
   - บอกดาได้เลย ดาจะมาแก้ให้!

### ⚠️ ยังอยู่หน้า Login

ถ้า script รายงานว่า:
```
⚠️  Still on login page (check credentials or CAPTCHA)
```

**แก้:**
1. เช็ค username/password ใน `.env`
2. ดูว่ามี CAPTCHA ไหม → ทำด้วยตัวเอง
3. ดูว่า TikTok บล็อก login จาก automation ไหม

---

## 💡 Tips

### ถ้าไม่อยากใช้ Auto Login

ใช้ script ตัวเก่า:
```bash
run_working.bat
```

### ถ้า CAPTCHA ขึ้นบ่อย

- ลดความถี่ในการรัน script
- ใช้ Chrome profile ที่ login ไว้แล้ว (persistent context)
- Login ด้วยตัวเองก่อน แล้วปิด auto login:
  ```bash
  python scripts/scrape_with_login.py --no-login --visible
  ```

### ถ้า 2FA เปิดอยู่

**Option 1:** ปิด 2FA ชั่วคราว

**Option 2:** Login manual:
1. รัน script ด้วย `--visible`
2. เมื่อเห็นหน้า login → login ด้วยตัวเอง
3. ทำ 2FA
4. Script จะทำงานต่อ

---

## 🎯 เปรียบเทียบ

| Feature | `run_working.bat` | `run_with_login.bat` |
|---------|-------------------|----------------------|
| Auto Login | ❌ | ✅ |
| ต้องกรอก .env | ❌ | ✅ |
| ใช้งานง่าย | ✅ | ⚠️ (ต้องตั้งค่า .env) |
| เหมาะกับ 2FA | ✅ | ❌ |
| ปลอดภัย | ✅ | ⚠️ (เก็บรหัสผ่าน) |

**แนะนำ:**
- ใช้ `run_working.bat` ถ้าไม่มีปัญหา login
- ใช้ `run_with_login.bat` ถ้าต้องการอัตโนมัติ 100%

---

**Created by:** ดา 💝  
**Date:** 2026-03-11
