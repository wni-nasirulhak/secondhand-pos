# 🧪 Tests Directory

ไฟล์ทดสอบและสคริปต์ทดลอง

---

## 📁 ไฟล์ในโฟลเดอร์นี้

### 🔬 [test-api.js](test-api.js)
- ทดสอบ API endpoints
- ตรวจสอบ server responses
- Validate data structure

**วิธีใช้:**
```bash
node tests/test-api.js
```

---

### 🧪 [test-manual.js](test-manual.js)
- ทดสอบแบบ manual
- Debug specific features
- Development testing

**วิธีใช้:**
```bash
node tests/test-manual.js
```

---

### 🎯 [test-v2.js](test-v2.js)
- ทดสอบ Version 2 features
- UI V2 validation
- Component testing

**วิธีใช้:**
```bash
node tests/test-v2.js
```

---

## 🚀 วิธีรันทดสอบ

### ทดสอบทีละไฟล์:
```bash
# ทดสอบ API
node tests/test-api.js

# ทดสอบ Manual
node tests/test-manual.js

# ทดสอบ V2
node tests/test-v2.js
```

### ทดสอบทั้งหมด (ถ้ามี test runner):
```bash
npm test
```

---

## 📝 หมายเหตุ

- ไฟล์ test ควร run ก่อน deploy
- ตรวจสอบว่า server ทำงานก่อนทดสอบ
- อ่าน [TESTING-RESULTS.md](../docs/TESTING-RESULTS.md) สำหรับผลการทดสอบล่าสุด

---

## 🔧 เพิ่มการทดสอบใหม่

สร้างไฟล์ใหม่:
```javascript
// tests/test-new-feature.js
const API = require('../path/to/api');

async function testNewFeature() {
  console.log('Testing new feature...');
  // Your test code here
}

testNewFeature();
```

---

## 📚 เอกสารเพิ่มเติม

- [TESTING-RESULTS.md](../docs/TESTING-RESULTS.md) - ผลการทดสอบ
- [COMPONENT-ANALYSIS.md](../docs/COMPONENT-ANALYSIS.md) - วิเคราะห์ Component

---

**Last Updated:** 2026-03-30 14:00 GMT+7
