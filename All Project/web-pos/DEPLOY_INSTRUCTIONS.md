# 🚀 Deploy Instructions

## ทางที่ 1: Static Export (แนะนำ)

### Cloudflare Pages Settings:
```
Build command: npm run build
Build output directory: out
```

### ทดสอบ Local:
```bash
npm install
npm run build
```

---

## ทางที่ 2: OpenNext (สำหรับ SSR)

### 1. แก้ next.config.js:
ลบ `output: 'export'` ออก

### 2. Install OpenNext:
```bash
npm install --save-dev @opennextjs/cloudflare
```

### 3. Cloudflare Pages Settings:
```
Build command: npx @opennextjs/cloudflare
Build output directory: .worker-next
```

---

## 📝 หมายเหตุ
- ถ้า deploy ไม่ได้ ให้ตรวจสอบว่า Root Directory ตั้งค่าถูกต้อง
- ถ้าใช้ monorepo อาจต้องระบุ path ที่มี package.json
