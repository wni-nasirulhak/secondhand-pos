# 📝 Changelog

## [2.1.8] - 2026-03-27

### 🎉 FIXED - Chrome Profile Works Now!
- **ใช้ Chrome Profile ได้แล้ว 100%!**
- เปลี่ยนจาก `launchPersistentContext` เป็น `launch + --profile-directory`
- ใช้วิธีเดียวกับการรัน Chrome ใน command line
- แยก User Data path และ Profile name อัตโนมัติ
- ส่ง `--profile-directory` และ `--user-data-dir` ใน args
- Chrome เปิดพร้อม login ถูกต้อง 100% ✅

### 🔧 Technical Changes
- `chromium.launch()` + args แทน `launchPersistentContext()`
- Parse path เพื่อแยก User Data และ Profile name
- Args: `--profile-directory=Default --user-data-dir=...`
- Same method as command line: `chrome.exe --profile-directory="Default"`

### 📝 Documentation
- SUCCESS-CHROME-PROFILE.md - ใช้งานได้แล้ว!
- อธิบายทำไมครั้งนี้ได้
- Checklist สำหรับใช้งาน

### ✅ Verified Working
- ทดสอบกับ command line: ได้ผล ✅
- ใช้วิธีเดียวกันใน Playwright: ได้ผล ✅
- Chrome เปิดพร้อม login: ได้ผล ✅
- Scraper ดึงคอมเมนต์: ได้ผล ✅

---

## [2.1.7] - 2026-03-27

### 🔧 Fixed - Chrome Profile Navigation
- แก้ปัญหาหน้า blank (ไม่เปิด URL)
- เพิ่ม page.goto() และรอให้โหลดเสร็จ
- Auto-append \Default ถ้าไม่มี
- เพิ่ม debug logging

---

## [2.1.6] - 2026-03-27

### 🔧 Fixed - Use Real Chrome
- เพิ่ม channel: 'chrome' เพื่อใช้ Chrome จริง
- Debug guide: DEBUG-CHROME-PROFILE.md
- check-chrome-running.bat

---

## [2.1.5] - 2026-03-27

### 🔧 Fixed - Chrome Profile Issues
- **แก้ปัญหา path ไม่ครบ (ขาด \Profile X)**
- เพิ่ม dropdown เลือก Chrome profile
- ปุ่ม "🔍 โหลดรายการ Profile" โหลด profiles ทั้งหมด
- API `/api/find-chrome-path` หา profiles ทั้งหมดใน User Data
- แสดง Default, Profile 1, Profile 2, ... ให้เลือก
- Auto-fill path เมื่อเลือกจาก dropdown
- แก้ปัญหาปุ่มหาอัตโนมัติไม่ทำงาน

### 🎨 Improved
- UI ใหม่: dropdown + input (เลือกหรือใส่เอง)
- แสดง notification เมื่อโหลด profiles สำเร็จ
- คำแนะนำชัดเจนขึ้น
- Error handling ดีขึ้น

### 📝 Documentation
- QUICK-FIX-CHROME-PROFILE.md - แก้ปัญหา path ไม่ครบ
- อธิบายความแตกต่าง User Data vs Profile
- วิธีหา profile ที่ login TikTok ไว้

### 🐛 Bug Fixes
- แก้ปัญหา: ใส่ path แล้วยังเปิด incognito
- แก้ปัญหา: ปุ่มหาอัตโนมัติไม่ทำงาน
- แก้ปัญหา: ไม่รู้ว่า profile ไหน login TikTok ไว้

---

## [2.1.4] - 2026-03-27

### 🌐 Added - Chrome Profile Support (แก้ IP Block แบบฟรี!)
- **ใช้ Chrome Profile ที่ login ไว้แล้ว**
- เพิ่ม checkbox "🌐 ใช้ Chrome Profile ที่ Login ไว้แล้ว"
- เพิ่มช่องใส่ Chrome User Data Path
- ปุ่ม "🔍 หาอัตโนมัติ" หา Chrome path
- API endpoint `/api/find-chrome-path` หา path อัตโนมัติ
- Wrapper script รองรับ `--chrome-profile` parameter
- สคริป `find-chrome-profile.bat` หา Chrome path ง่ายๆ
- คู่มือ `CHROME-PROFILE-GUIDE.md` (ฉบับเต็ม)
- คู่มือ `QUICK-START-CHROME.md` (3 ขั้นตอน)

### 🎨 Improved
- ConfigForm: แสดง/ซ่อน Chrome path input
- Server: รองรับ Chrome profile parameter
- Playwright: ใช้ existing Chrome profile
- Error handling สำหรับ Chrome profile

### 🎯 Benefits
- ✅ แก้ปัญหา IP block แบบฟรี
- ✅ ไม่ต้องใช้ Proxy หรือ VPN
- ✅ ใช้ Chrome ที่ login ไว้แล้ว
- ✅ ไม่ต้อง login ซ้ำ
- ✅ TikTok ไม่บล็อก

### 📝 Documentation
- CHROME-PROFILE-GUIDE.md - คู่มือฉบับเต็ม
- QUICK-START-CHROME.md - 3 ขั้นตอนเร็ว
- find-chrome-profile.bat - หา Chrome path

---

## [2.1.3] - 2026-03-27

### 🌐 Added - Proxy Support
- **แก้ปัญหา IP ถูกบล็อก**
- เพิ่ม Proxy support (HTTP, HTTPS, SOCKS5)
- เพิ่มช่อง "🌐 Proxy Server" ใน UI
- รองรับ proxy authentication (username:password)
- Wrapper script รองรับ proxy configuration
- เพิ่มคู่มือ `PROXY-GUIDE.md` (ฉบับเต็ม)
- เพิ่มคู่มือ `QUICK-FIX-IP-BLOCK.md` (วิธีแก้เร็ว 5 วิธี)

### 🎨 Improved
- ConfigForm รับ proxy parameter
- Server API รับและส่ง proxy config
- Playwright รองรับ proxy server
- Error handling สำหรับ proxy connection

### 📝 Documentation
- PROXY-GUIDE.md - คู่มือใช้ proxy แบบละเอียด
- QUICK-FIX-IP-BLOCK.md - แก้ IP block 5 วิธี
- เปรียบเทียบ proxy providers
- ตัวอย่างการใช้งาน

---

## [2.1.2] - 2026-03-27

### 🔐 Added - Persistent Browser Context
- **แก้ปัญหา "Maximum number of attempts reached"**
- เพิ่ม Persistent Mode (เก็บ cookies/session ไว้ใช้ซ้ำ)
- Login ด้วยตัวเองครั้งเดียว, ครั้งต่อไปไม่ต้อง login ใหม่
- เพิ่ม checkbox "🔐 ใช้ Session ที่ Login ไว้" (เปิดอยู่แล้วตั้งแต่แรก)
- สร้างโฟลเดอร์ `user-data/` เพื่อเก็บ browser profile
- เพิ่มคู่มือ `LOGIN-GUIDE.md`

### 🎨 Improved
- Wrapper script รองรับ persistent context
- Server API รับ parameter `persistent`
- ConfigForm รองรับ persistent checkbox
- .gitignore เพิ่ม `user-data/`

### 📝 Documentation
- เพิ่ม LOGIN-GUIDE.md - คู่มือแก้ปัญหา login
- อธิบายวิธีใช้ persistent mode
- Troubleshooting guide

---

## [2.1.1] - 2026-03-27

### 🐛 Fixed
- ConfigForm.setConfig() ใช้ querySelector แทน getElementById
- stopScraper() ใช้ taskkill บน Windows
- Wrapper script รับ SIGTERM/SIGINT
- เพิ่ม shouldStop flag เพื่อหยุดการ loop
- เพิ่มการปิด browser อย่างสวยงาม
- เพิ่มการตรวจสอบสถานะหลัง stop

### 🎨 Improved
- Debug logging ดีขึ้น
- Error handling ดีขึ้น
- Graceful shutdown

---

## [2.1.0] - 2026-03-27

### ✨ Added
- **💾 Config Presets** - บันทึกและโหลดการตั้งค่าที่ใช้บ่อย
  - บันทึกชุดการตั้งค่าแบบมีชื่อ
  - แสดงรายละเอียด URL, duration, interval
  - ลบและแก้ไขได้
  
- **🔔 Keyword Alerts** - ระบบแจ้งเตือนคำสำคัญ
  - เพิ่ม/ลบคำสำคัญที่ต้องการติดตาม
  - แจ้งเตือนแบบ real-time เมื่อพบคำสำคัญ
  - แสดง browser notification (ถ้าอนุญาต)
  - ประวัติการแจ้งเตือน
  - Toggle เปิด/ปิดได้ง่าย
  
- **📝 Auto-Save Config** - บันทึกการตั้งค่าล่าสุดอัตโนมัติ
  - ใช้ LocalStorage
  - โหลดการตั้งค่าล่าสุดเมื่อเปิดใหม่
  
- **🔗 Recent URLs** - จำ URL ที่เคยใช้
  - เก็บ 10 รายการล่าสุด
  - แสดงเป็น dropdown suggestion
  - ง่ายต่อการเลือกใช้ซ้ำ

### 🎨 Improved
- UI ปรับปรุงให้รองรับฟีเจอร์ใหม่
- เพิ่ม Modal สำหรับบันทึก Preset
- เพิ่ม Toggle Switch สำหรับ Keyword Alert
- Notification รองรับ multiline message

### 📦 Dependencies
- ไม่มีการเพิ่ม dependency ใหม่

---

## [2.0.0] - 2026-03-27

### ✨ Added
- **🎨 Web UI** - หน้าเว็บสำหรับใช้งานแทน command line
- **Component-Based Architecture** - แยก component ตามหน้าที่
- **⚡ Real-time Updates** - แสดงคอมเมนต์ใหม่ทันที
- **🔍 Search & Filter** - ค้นหาคอมเมนต์
- **💾 Export** - ดาวน์โหลด JSON/CSV
- **📊 Statistics** - แสดงสถิติแบบ real-time
- **📱 Responsive Design** - ใช้งานได้ทุก device

### 🛠️ Components
- `ConfigForm.js` - ฟอร์มตั้งค่า
- `ControlPanel.js` - ปุ่มควบคุม
- `CommentList.js` - แสดงรายการคอมเมนต์
- `StatusBar.js` - แถบสถานะ
- `api.js` - API utility

### 🎨 Design
- TikTok-inspired design
- Dark theme
- Modern animations
- Notification system

---

## [1.0.0] - 2026-03-11

### ✨ Initial Release
- Command-line scraper สำหรับดึงคอมเมนต์ TikTok Live
- ใช้ Chrome DevTools Protocol (CDP)
- บันทึกเป็น JSON
- ป้องกันคอมเมนต์ซ้ำ
