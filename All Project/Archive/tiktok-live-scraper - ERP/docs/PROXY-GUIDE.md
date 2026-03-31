# 🌐 คู่มือใช้ Proxy เพื่อแก้ IP Block

## ❌ ปัญหา: IP ถูก TikTok บล็อก

**อาการ:**
- "Maximum number of attempts reached"
- เข้า TikTok ไม่ได้เลย
- Login ไม่สำเร็จ

**สาเหตุ:** IP ของคุณถูก TikTok บล็อกชั่วคราว

---

## ✅ วิธีแก้: ใช้ Proxy

Proxy = เซิร์ฟเวอร์ตัวกลางที่ช่วยเปลี่ยน IP ให้คุณ

**ข้อดี:**
- ✅ เปลี่ยน IP ได้ทันที
- ✅ ไม่ต้องรอ TikTok ปลดบล็อก
- ✅ ใช้งานได้ต่อเนื่อง

---

## 🎯 วิธีใช้งาน (3 ขั้นตอน)

### 1️⃣ หา Proxy Server

#### **A. Proxy ฟรี (ทดลองใช้)**
- https://free-proxy-list.net/
- https://www.proxy-list.download/
- https://www.sslproxies.org/

**⚠️ ข้อเสีย:**
- ช้า
- ไม่เสถียร
- อาจถูกบล็อกเหมือนกัน

#### **B. Proxy เสียเงิน (แนะนำ!)**

**Residential Proxy (ดีที่สุด):**
- Bright Data (Luminati) - https://brightdata.com
- Smartproxy - https://smartproxy.com
- Oxylabs - https://oxylabs.io
- Geonode - https://geonode.com

**Datacenter Proxy (ถูกกว่า):**
- WebShare - https://www.webshare.io/
- ProxyRack - https://www.proxyrack.com/
- Storm Proxies - https://stormproxies.com/

**💰 ราคา:**
- Residential: ~$50-200/เดือน (10GB-50GB)
- Datacenter: ~$10-30/เดือน (unlimited)

---

### 2️⃣ ใส่ Proxy ใน UI

1. เปิด http://localhost:3000
2. ในส่วน **"⚙️ การตั้งค่า"** จะเห็นช่อง:
   ```
   🌐 Proxy Server (ถ้าต้องการ)
   ```
3. ใส่ Proxy URL ตามรูปแบบ:

**HTTP Proxy:**
```
http://proxy-server:port
http://username:password@proxy-server:port
```

**HTTPS Proxy:**
```
https://proxy-server:port
https://username:password@proxy-server:port
```

**SOCKS5 Proxy:**
```
socks5://proxy-server:port
socks5://username:password@proxy-server:port
```

**ตัวอย่าง:**
```
http://123.45.67.89:8080
http://user123:pass456@proxy.example.com:3128
socks5://proxy.smartproxy.com:1000
```

---

### 3️⃣ เริ่มใช้งาน

1. ใส่ Proxy URL แล้ว
2. กดปุ่ม **"▶️ เริ่มดึงคอมเมนต์"**
3. Scraper จะใช้ Proxy เชื่อมต่อ TikTok
4. ✅ Login และใช้งานได้ปกติ!

---

## 📋 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: Proxy ฟรี
```
Proxy: http://123.45.67.89:8080
```

### ตัวอย่างที่ 2: Smartproxy (Residential)
```
Proxy: http://user-sp123456:pass789@gate.smartproxy.com:7000
```

### ตัวอย่างที่ 3: Bright Data
```
Proxy: http://brd-customer-hl_12345678:abcdefgh@brd.superproxy.io:22225
```

### ตัวอย่างที่ 4: WebShare (Datacenter)
```
Proxy: http://username:password@proxy.webshare.io:80
```

---

## 🧪 ทดสอบ Proxy

### วิธีที่ 1: ใช้ curl (Command Line)
```bash
# HTTP Proxy
curl -x http://proxy:port https://api.ipify.org?format=json

# SOCKS5 Proxy
curl --socks5 socks5://proxy:port https://api.ipify.org?format=json
```

### วิธีที่ 2: เว็บไซต์
1. ใช้ proxy ใน browser
2. ไป https://whatismyipaddress.com
3. ดู IP ว่าเปลี่ยนหรือไม่

---

## 💡 Tips การเลือก Proxy

### ✅ Residential Proxy (แนะนำ!)
**ข้อดี:**
- IP จากบ้านจริง (ไม่ใช่ datacenter)
- TikTok ไม่บล็อก
- เสถียรมาก

**ข้อเสีย:**
- แพงกว่า
- จำกัด bandwidth

**เหมาะกับ:**
- ใช้งานจริงจัง
- ต้องการความเสถียร

---

### ⚡ Datacenter Proxy
**ข้อดี:**
- ถูกกว่า
- เร็วกว่า
- Unlimited bandwidth

**ข้อเสีย:**
- อาจถูก TikTok บล็อก
- ไม่เสถียรเท่า

**เหมาะกับ:**
- ทดลองใช้
- งบน้อย

---

### 🚫 Proxy ฟรี
**ข้อดี:**
- ไม่เสียเงิน

**ข้อเสีย:**
- ช้ามาก
- ไม่เสถียร
- อาจถูกบล็อกแล้ว
- ไม่ปลอดภัย

**เหมาะกับ:**
- ทดลองเท่านั้น

---

## 🔐 Proxy + Persistent Mode

**แนะนำให้ใช้ทั้งสอง:**

1. ✅ เปิด **Persistent Mode** (เก็บ session)
2. ✅ ใส่ **Proxy URL**
3. Login ครั้งแรกผ่าน Proxy
4. ครั้งต่อไปใช้ session เดิม (ไม่ต้อง login ซ้ำ)

**ข้อดี:**
- เปลี่ยน IP ได้
- ไม่ต้อง login ทุกครั้ง
- เสถียรที่สุด

---

## 🐛 Troubleshooting

### ❌ Proxy ไม่ทำงาน

**ตรวจสอบ:**
1. ✅ รูปแบบ URL ถูกต้องหรือไม่
2. ✅ Username/Password ถูกต้องหรือไม่
3. ✅ Proxy online อยู่หรือไม่
4. ✅ มี bandwidth เหลืออยู่หรือไม่

**ทดสอบ Proxy ก่อนใช้:**
```bash
curl -x http://proxy:port https://api.ipify.org?format=json
```

---

### ❌ ยัง Login ไม่ได้

**สาเหตุ:** Proxy IP ก็ถูกบล็อกเหมือนกัน

**แก้ไข:**
1. เปลี่ยน Proxy server อื่น
2. ใช้ Residential Proxy แทน Datacenter
3. เปลี่ยนประเทศของ Proxy
4. รอ 24-48 ชั่วโมง

---

### ❌ ช้ามาก

**สาเหตุ:** Proxy ช้า หรือไกลเกินไป

**แก้ไข:**
1. เลือก Proxy ในประเทศใกล้เคียง (เช่น สิงคโปร์, ฮ่องกง)
2. เปลี่ยนเป็น Datacenter Proxy (เร็วกว่า)
3. เปลี่ยน Proxy provider

---

## 📊 เปรียบเทียบ

| ประเภท | ราคา | ความเร็ว | เสถียรภาพ | TikTok Block | แนะนำ |
|--------|------|----------|-----------|-------------|--------|
| **Residential** | 💰💰💰 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ❌ ไม่บล็อก | ⭐⭐⭐⭐⭐ |
| **Datacenter** | 💰 | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | ⚠️ บางทีบล็อก | ⭐⭐⭐ |
| **ฟรี** | ฟรี | ⚡ | ⭐ | ❌ บล็อกบ่อย | ⭐ |

---

## 🎯 สรุป

**ปัญหา:**
```
❌ IP ถูก TikTok บล็อก
❌ Login ไม่ได้
```

**วิธีแก้:**
```
1. หา Proxy Server
   - Residential (ดีที่สุด)
   - Datacenter (ถูกกว่า)
   - ฟรี (ทดลอง)

2. ใส่ใน UI
   - http://user:pass@proxy:port

3. เริ่มใช้งาน
   - เปลี่ยน IP ทันที
   - Login ได้ปกติ
```

**ผลลัพธ์:**
```
✅ เปลี่ยน IP สำเร็จ
✅ Login ได้แล้ว
✅ ใช้งานต่อเนื่อง
```

---

## 📚 ลิงก์เพิ่มเติม

**Proxy Providers (แนะนำ):**
- Bright Data: https://brightdata.com (Residential)
- Smartproxy: https://smartproxy.com (Residential)
- WebShare: https://www.webshare.io/ (Datacenter)

**ทดสอบ Proxy:**
- https://whatismyipaddress.com
- https://api.ipify.org?format=json

**Proxy List (ฟรี):**
- https://free-proxy-list.net/
- https://www.proxy-list.download/

---

**Version:** 2.1.3  
**Status:** 🟢 Proxy Support Enabled  
**Date:** 2026-03-27

---

💡 **คำแนะนำ:**  
ถ้างบพอ ควรใช้ Residential Proxy เพราะ:
- ไม่โดนบล็อก
- เสถียร
- คุ้มค่าในระยะยาว
