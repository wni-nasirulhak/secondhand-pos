# 🚀 แก้ปัญหา "Maximum number of attempts" เร็วที่สุด!

## ❌ ปัญหา
```
Maximum number of attempts reached. Try again later.
```

## ✅ วิธีแก้ (3 ขั้นตอน)

### 1️⃣ เปิดใช้ Persistent Mode
- ใน UI จะมี checkbox: `☑️ 🔐 ใช้ Session ที่ Login ไว้`
- **ติ๊กให้เปิด** (เปิดอยู่แล้วตั้งแต่แรก)

### 2️⃣ ปิด Headless Mode (ครั้งแรก)
- ถอดติ๊ก `👻 Headless Mode` เพื่อเห็น browser

### 3️⃣ Login ด้วยตัวเอง
1. กดปุ่ม **"▶️ เริ่มดึงคอมเมนต์"**
2. Browser จะเปิด → **Login TikTok ตามปกติ**
3. Login สำเร็จ → Scraper จะเริ่มทำงาน
4. **ครั้งต่อไปไม่ต้อง login ใหม่!** 🎉

---

## 🎯 ครั้งต่อไป

- เปิด Headless Mode กลับได้
- Session ที่ login ไว้จะถูกเก็บไว้
- ไม่ต้อง login ซ้ำ

---

## 🔄 ต้องการ Login ใหม่?

```bash
# ลบโฟลเดอร์ user-data
rmdir /s /q user-data
```

แล้วเริ่มใหม่ตามขั้นตอนที่ 2-3

---

## 📚 คู่มือฉบับเต็ม

อ่านเพิ่มเติม: `LOGIN-GUIDE.md`

---

**เวอร์ชัน:** 2.1.2  
**สถานะ:** ✅ ใช้งานได้แล้ว!
