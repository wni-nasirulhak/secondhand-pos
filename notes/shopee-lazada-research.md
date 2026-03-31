# 🔍 Shopee & Lazada Live Scraping - Research

## Objective
สามารถ scrape คอมเมนต์จาก Shopee และ Lazada Live ได้หรือไม่

---

## 🧪 Experiment 1: Web Browser Test

### Shopee Live URLs
- หน้าหลัก Live: https://shopee.co.th/live
- Live แต่ละร้าน: https://shopee.co.th/@{shop_name}/live
- Video replay: https://shopee.co.th/live/{video_id}

### Lazada Live URLs  
- หน้าหลัก: https://pages.lazada.co.th/wow/live/live-event
- ร้านค้า: https://www.lazada.co.th/{shop}/live

**TODO:**
1. เปิด URL ข้างบนด้วย Playwright
2. ดูว่ามีคอมเมนต์แสดงหรือไม่
3. ตรวจสอบ HTML structure
4. ดู Network tab (WebSocket/API calls)

---

## 🔬 Experiment 2: API Reverse Engineering

### เครื่องมือที่ต้องใช้
```bash
# ติดตั้ง mitmproxy
pip install mitmproxy

# รัน proxy
mitmweb
```

### ขั้นตอน
1. เปิด mitmproxy (port 8080)
2. ตั้งค่า WiFi บน Android ให้ใช้ proxy (IP:8080)
3. ติดตั้ง mitmproxy certificate บน Android
4. เปิด Shopee/Lazada app → ดู Live
5. สังเกต API calls ใน mitmproxy

**สิ่งที่ต้องหา:**
- API endpoint สำหรับดึงคอมเมนต์
- Request headers (Authorization, User-Agent)
- Request parameters
- Response format

---

## 📱 Experiment 3: Mobile Automation

### Option A: Appium
```python
# Install
pip install Appium-Python-Client

# Setup Android emulator
# Install Shopee/Lazada app
# Write Appium script to open Live and scrape
```

### Option B: OpenClaw Nodes (Android)
```python
# If Android device paired with OpenClaw
from openclaw import nodes

# Screen capture
nodes.screen_record(node="android", durationMs=10000)

# UI Automation (via adb)
nodes.invoke(node="android", command="adb shell input tap x y")
```

---

## 🎯 Expected Challenges

### Shopee
- ✅ มี Web version ของ Live (อาจ scrape ได้)
- ⚠️ WebSocket อาจ encrypted
- ⚠️ Anti-bot protection

### Lazada
- ⚠️ Live อาจเปิดผ่าน app เท่านั้น
- ⚠️ API อาจมี signature/encryption

---

## 📝 Next Steps

1. [ ] ลอง Playwright กับ Shopee/Lazada web
2. [ ] ดู Network tab → หา API
3. [ ] ถ้า web ไม่ได้ → ลอง mitmproxy
4. [ ] เขียน POC script

---

**Status:** 🔬 Research Phase  
**Priority:** High  
**Difficulty:** Medium-Hard
