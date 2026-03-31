# ⚡ Quick Start - EcomScraper Hub UI
## เริ่มต้นพัฒนา UI ภายใน 5 นาที

---

## 🎯 คุณต้องการอะไร?

### 1️⃣ ให้ AI ทำให้ (แนะนำ!)

```markdown
1. เปิดไฟล์: AI-PROMPTS.md
2. Scroll ไปที่: "Detailed Setup Prompt (ภาษาไทย)"
3. Copy ทั้งหมด (Ctrl+A, Ctrl+C)
4. Paste ให้ AI:
   - Claude: https://claude.ai
   - ChatGPT: https://chat.openai.com
   - Gemini: https://gemini.google.com
5. ตอบคำถามที่ AI ถาม แล้วให้มันทำไป!
```

**เวลา:** 5 นาที setup + ให้ AI ทำต่อ
**ผลลัพธ์:** AI จะสร้าง UI ให้ทีละขั้นตอน

---

### 2️⃣ ทำเอง (สำหรับ Developer)

```bash
# 1. Setup Project (5 นาที)
npm create vite@latest ecom-scraper-ui -- --template react-ts
cd ecom-scraper-ui

# 2. Install Everything (3 นาที)
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init

# 3. Install Deps (2 นาที)
npm install react-router-dom axios zustand @tanstack/react-query socket.io-client recharts lucide-react date-fns react-hot-toast

# 4. Start Dev (1 นาที)
npm run dev
```

**เวลา:** 10-15 นาที พร้อมใช้งาน
**ต่อไป:** อ่าน UI-DESIGN-BRIEF-TH.md แล้วเริ่มสร้าง Components

---

### 3️⃣ ดู Design ก่อน (สำหรับ Designer)

```markdown
1. เปิดไฟล์: UI-DESIGN-BRIEF-TH.md
2. Scroll ดู Wireframes ของแต่ละหน้า:
   - Dashboard (หน้าหลัก)
   - Scraper (จัดการ Jobs)
   - Data Browser (ดูข้อมูล)
   - Webhooks
   - Settings
   - Logs
3. ดูส่วน "Component Library" เพื่อดู Design System
4. ใช้ Figma สร้าง High-fidelity Mockups
```

**เวลา:** 30-60 นาที อ่านเข้าใจ
**ผลลัพธ์:** เข้าใจระบบและพร้อมออกแบบ

---

## 📋 Files Overview

| ไฟล์ | ขนาด | ใช้เมื่อไหร่ |
|------|------|-------------|
| **README.md** | 9 KB | อ่านภาพรวมทั้งหมด |
| **QUICK-START.md** | นี่ไง | เริ่มต้นเร็ว 5 นาที |
| **UI-DESIGN-BRIEF-TH.md** | 50 KB | ดู Design และ Wireframes |
| **UI-DESIGN-BRIEF-EN.md** | 30 KB | English version |
| **COMPONENT-CHECKLIST.md** | 11 KB | Check progress |
| **AI-PROMPTS.md** | 20 KB | ให้ AI ช่วยทำ |

---

## 🚀 3 Steps to Start

### Step 1: อ่าน (5 นาที)
- เปิด **README.md** อ่านภาพรวม
- เปิด **UI-DESIGN-BRIEF-TH.md** scroll ดู wireframes

### Step 2: เลือกวิธี (1 นาที)
- ✅ ให้ AI ทำ → ไปที่ **AI-PROMPTS.md**
- ✅ ทำเอง → เริ่ม setup project ข้างบน

### Step 3: เริ่มทำ!
- Follow instructions ทีละขั้นตอน
- ไม่เข้าใจกลับมาอ่านเอกสาร

---

## 🎨 Design System TL;DR

```css
/* Colors */
🎵 TikTok:  #FE2C55 (Pink)
🛒 Shopee:  #EE4D2D (Orange)
📦 Lazada:  #0F146D (Blue)
✅ Success: #10B981 (Green)
⚠️ Warning: #F59E0B (Yellow)
❌ Error:   #EF4444 (Red)

/* Typography */
Font: Inter, sans-serif
H1: 32px Bold
H2: 24px Bold
Body: 14px Regular

/* Spacing */
Padding: 16px
Gap: 16px
Border Radius: 8px (cards), 6px (inputs)
```

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router
- Zustand (state)
- React Query (data)
- Socket.io (real-time)
- Recharts (charts)

**Backend (มีแล้ว):**
- Node.js + Express
- SQLite
- 30+ API endpoints
- WebSocket

---

## ⏱️ Timeline

| Week | งาน | Output |
|------|-----|--------|
| 1 | Setup + Components + Layout | โปรเจกต์พร้อม + Components พื้นฐาน |
| 2 | Dashboard + Scraper | หน้าหลักใช้งานได้ |
| 3 | Data + Webhooks + Settings | ครบทุกหน้า |
| 4 | Polish + Test | พร้อม production |

**รวม:** 3-4 สัปดาห์

---

## 📊 Main Pages

### 1. Dashboard
- Platform stats (TikTok, Shopee, Lazada)
- Activity chart (24h)
- Active jobs widget
- Recent activities feed

### 2. Scraper
- New job wizard (5 steps)
- Active jobs list
- Job history

### 3. Data Browser
- Products table
- Filters & search
- Export functionality

### 4. Webhooks
- Webhook list
- Add/Edit/Test webhooks
- Delivery logs

### 5. Settings
- Authentication (cookies)
- Rate limiting
- Proxy settings
- API keys

### 6. Logs
- Real-time log viewer
- System health metrics

---

## 💡 Pro Tips

### ถ้าใช้ AI:
- ✅ Copy prompt ทั้งก้อน
- ✅ ให้ AI ทำทีละ component
- ✅ Review code ที่ AI generate
- ✅ Test ทุกครั้ง

### ถ้าทำเอง:
- ✅ สร้าง components เล็กๆ ก่อน
- ✅ Test responsive design เลย
- ✅ ใช้ Tailwind เต็มที่
- ✅ Commit บ่อยๆ

### Design:
- ✅ ใช้ shadcn/ui components
- ✅ Follow design system
- ✅ Mobile-first approach
- ✅ Accessibility matters

---

## 🎯 Success Checklist

### Week 1
- [ ] Project setup เสร็จ
- [ ] Design system พร้อม
- [ ] Core components สร้างแล้ว (Button, Input, Card, Modal)
- [ ] Layout ทำงานได้ (TopNav, Sidebar)

### Week 2
- [ ] Dashboard หน้าแรกเสร็จ
- [ ] Scraper wizard ทำงานได้
- [ ] Chart แสดงผล
- [ ] Active jobs แสดงได้

### Week 3
- [ ] Data browser ทำงาน
- [ ] Webhook management เสร็จ
- [ ] Settings pages พร้อม
- [ ] API integration เริ่มต้น

### Week 4
- [ ] Logs viewer ทำงาน
- [ ] Real-time updates ทำงาน
- [ ] Responsive ทุกหน้า
- [ ] Bug fixes + polish
- [ ] Ready for testing!

---

## 🆘 Need Help?

### ติดที่ไหน?
1. **Setup:** ดูคำสั่ง setup ข้างบน
2. **Design:** เปิด UI-DESIGN-BRIEF-TH.md
3. **Components:** เปิด COMPONENT-CHECKLIST.md
4. **AI:** เปิด AI-PROMPTS.md ส่วน Troubleshooting

### คำถามที่พบบ่อย

**Q: ต้องเริ่มจากไหน?**
A: อ่าน README.md → เลือกให้ AI ทำหรือทำเอง → Follow steps

**Q: ไม่เคยใช้ React?**
A: ใช้ AI ช่วยทำ (AI-PROMPTS.md) หรือหาคนช่วย

**Q: Backend พร้อมหรือยัง?**
A: พร้อมแล้ว! มี 30+ API endpoints อยู่

**Q: Mock data มีไหม?**
A: ยังไม่มี แต่ AI จะสร้างให้เวลาทำ UI

**Q: Dark mode ต้องทำไหม?**
A: Optional! ทำภายหลังก็ได้

---

## 🚀 Let's Go!

**Ready?** เลือก 1 ใน 3:

1. 🤖 **AI ทำให้** → เปิด `AI-PROMPTS.md`
2. 💻 **ทำเอง** → Run คำสั่ง setup ข้างบน
3. 🎨 **Design ก่อน** → เปิด `UI-DESIGN-BRIEF-TH.md`

**พร้อมแล้ว!** ไปเลย! 🚀✨

---

*Quick Start Version: 1.0*
*For full details: Read README.md*
*Last Updated: 2024-03-28*
