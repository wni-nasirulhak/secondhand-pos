# 🤖 AI Prompts for UI Development
## Prompts สำหรับให้ AI ช่วยพัฒนา UI ของ EcomScraper Hub

---

## 📋 Table of Contents
1. [Quick Start Prompt](#quick-start-prompt-เริ่มต้นเร็ว)
2. [Detailed Setup Prompt](#detailed-setup-prompt-เริ่มงานจริงจัง)
3. [Phase-by-Phase Prompts](#phase-by-phase-prompts)
4. [Component Development Prompts](#component-development-prompts)
5. [Troubleshooting Prompts](#troubleshooting-prompts)

---

## 🚀 Quick Start Prompt (เริ่มต้นเร็ว)

### ภาษาไทย

```
คุณเป็น Senior Frontend Developer ที่เชี่ยวชาญ React, TypeScript, Tailwind CSS และ shadcn/ui

ฉันมีโปรเจกต์ EcomScraper Hub ซึ่งเป็นระบบ Multi-Platform E-commerce Scraper ที่รองรับ TikTok, Shopee, และ Lazada

ฉันได้เตรียมเอกสาร UI Design Brief ไว้แล้วที่โฟลเดอร์ ecom-scraper-plan/:
- UI-DESIGN-BRIEF-TH.md (ภาษาไทย, 50KB, ละเอียดมาก)
- UI-DESIGN-BRIEF-EN.md (ภาษาอังกฤษ)
- COMPONENT-CHECKLIST.md (รายการ components 100+ items)

งานที่ต้องการ:
ช่วยพัฒนา Frontend UI ตามเอกสาร Design Brief โดยเริ่มจาก Phase 2.5 Week 1

เริ่มต้นด้วยการ:
1. อ่านเอกสาร UI-DESIGN-BRIEF-TH.md ให้เข้าใจโครงสร้างและความต้องการ
2. Setup โปรเจกต์ React + Vite + TypeScript + Tailwind CSS + shadcn/ui
3. สร้าง Design System (colors, typography, spacing) ตามเอกสาร
4. Build Core Components พื้นฐาน: Button, Input, Card, Modal, Toast
5. สร้าง Layout: AppLayout, TopNavigation, Sidebar

โปรดทำทีละขั้นตอน และถามฉันถ้ามีข้อสงสัย
```

### English Version

```
You are a Senior Frontend Developer expert in React, TypeScript, Tailwind CSS, and shadcn/ui

I have a project called EcomScraper Hub - a Multi-Platform E-commerce Scraper supporting TikTok, Shopee, and Lazada

I've prepared comprehensive UI Design Brief documents in the ecom-scraper-plan/ folder:
- UI-DESIGN-BRIEF-TH.md (Thai, 50KB, very detailed)
- UI-DESIGN-BRIEF-EN.md (English version)
- COMPONENT-CHECKLIST.md (100+ components list)

Your task:
Help me develop the Frontend UI according to the Design Brief, starting with Phase 2.5 Week 1

Start by:
1. Reading UI-DESIGN-BRIEF-EN.md to understand the structure and requirements
2. Setup React + Vite + TypeScript + Tailwind CSS + shadcn/ui project
3. Create Design System (colors, typography, spacing) from the documentation
4. Build Core Components: Button, Input, Card, Modal, Toast
5. Create Layout: AppLayout, TopNavigation, Sidebar

Please work step-by-step and ask me if you have any questions
```

---

## 📖 Detailed Setup Prompt (เริ่มงานจริงจัง)

### ภาษาไทย (แบบละเอียด)

```
# Context: โปรเจกต์ EcomScraper Hub

คุณเป็น Senior Frontend Developer ที่มีความเชี่ยวชาญใน:
- React 18+ with TypeScript
- Vite (Build Tool)
- Tailwind CSS + shadcn/ui (UI Library)
- Zustand (State Management)
- React Query (Data Fetching)
- Socket.io-client (Real-time)
- Recharts (Data Visualization)

## โปรเจกต์: EcomScraper Hub

**ระบบคืออะไร?**
- Multi-Platform E-commerce Scraper
- รองรับ 3 platforms: TikTok (Live + Shop), Shopee, Lazada
- สามารถดึงข้อมูล Products, Shops, Reviews แบบ real-time
- มี Webhook integration, Scheduled scraping, Rate limiting

**Backend ที่มีอยู่แล้ว:**
- Node.js + Express
- SQLite database (10 tables)
- RESTful API (30+ endpoints)
- WebSocket สำหรับ real-time updates
- Path: C:\Users\Winon\.openclaw\workspace\All Project\tiktok-live-scraper

**เอกสารที่เตรียมไว้:**
ในโฟลเดอร์ `ecom-scraper-plan/` มี:

1. **UI-DESIGN-BRIEF-TH.md** (50KB)
   - ภาพรวมโปรเจกต์และ User Personas
   - โครงสร้าง Navigation และ Layout
   - Wireframes ของทุกหน้า (Dashboard, Scraper, Data, Webhooks, Settings, Logs)
   - Component Library และ Design System
   - User Flow Diagrams
   - Phase 2.5 Implementation Plan (3-4 สัปดาห์)

2. **UI-DESIGN-BRIEF-EN.md** (30KB)
   - English version

3. **COMPONENT-CHECKLIST.md** (11KB)
   - รายการ UI Components ทั้งหมด 100+ items
   - แบ่งตาม Priority (High/Medium/Low)
   - Guidelines สำหรับการพัฒนา

## งานที่ต้องการ: Phase 2.5 - UI Development

**Timeline:** 3-4 สัปดาห์

### Week 1: Setup & Core Components (เริ่มที่นี่)

**Day 1-2: Project Setup**
1. อ่านเอกสาร UI-DESIGN-BRIEF-TH.md ทั้งหมดให้เข้าใจก่อน
2. สร้างโปรเจกต์ React + Vite + TypeScript
3. ติดตั้ง dependencies:
   - Tailwind CSS
   - shadcn/ui (components)
   - React Router
   - Axios (HTTP client)
   - Zustand (state)
   - React Query (data fetching)
   - Socket.io-client (real-time)
   - Recharts (charts)
   - Lucide React (icons)
   - date-fns (date utilities)
   - react-hot-toast (notifications)

4. Setup project structure:
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── dashboard/
│   │   ├── scraper/
│   │   ├── data/
│   │   ├── webhooks/
│   │   ├── settings/
│   │   └── layout/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── stores/
│   ├── types/
│   └── App.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

**Day 3-5: Design System & Components**

1. สร้าง Design System ตามเอกสาร (ดูในส่วน Component Library):
   - Colors: Primary colors สำหรับแต่ละ platform (TikTok pink, Shopee orange, Lazada blue)
   - Typography: Headings (H1-H4), Body (Large, Regular, Small)
   - Spacing: ใช้ Tailwind spacing scale
   - Border radius: 8px สำหรับ cards, 6px สำหรับ inputs

2. Build Core Components (ดู COMPONENT-CHECKLIST.md):
   - Button (Primary, Secondary, Danger, Icon, Text variants)
   - Input (Text input with validation states)
   - Card (Content card with header, body, footer)
   - Modal/Dialog (Modal component)
   - Toast (Notification system using react-hot-toast)
   - Badge (Status badges with platform colors)
   - ProgressBar (Progress indicator)
   - LoadingSpinner (Loading state)
   - Table (Data table with sorting)

**Day 6-7: Layout & Navigation**

1. สร้าง Layout Components:
   - AppLayout (Main layout with sidebar + top nav)
   - TopNavigation (Logo, menu, user dropdown)
   - Sidebar (Collapsible navigation menu)
   - PageHeader (Reusable page header)

2. Setup React Router:
   - Dashboard: /
   - Scraper: /scraper/*
   - Data: /data/*
   - Webhooks: /webhooks
   - Settings: /settings/*
   - Logs: /logs

3. Test responsive design (Desktop, Tablet, Mobile)

## ขั้นตอนการทำงาน:

**เริ่มต้น:**
1. อ่านเอกสาร UI-DESIGN-BRIEF-TH.md ทั้งหมด
2. ถามฉันถ้ามีข้อสงสัยเกี่ยวกับ Design หรือ Requirements
3. เริ่ม Setup โปรเจกต์

**ระหว่างทำ:**
- ทำทีละขั้นตอน ไม่ต้องรีบ
- แสดงโค้ดที่สร้างให้ฉันดู
- ถามถ้าไม่แน่ใจ
- Test แต่ละ component หลังจากสร้างเสร็จ

**หลังจากจบ Week 1:**
- ควรมี Core Components พร้อมใช้งาน
- Layout พร้อมใช้งาน
- Responsive design ทำงานได้
- พร้อมเริ่ม Week 2: Dashboard & Scraper Pages

## Backend API Endpoints (สำหรับ integration ภายหลัง):

Base URL: `http://localhost:3000/api`

**Health & Status:**
- GET /health
- GET /scraper/status

**Scraping:**
- POST /scraper/start
- POST /scraper/stop/:jobId
- GET /scraper/jobs
- GET /scraper/jobs/:jobId

**Data:**
- GET /data/products
- GET /data/products/:id
- GET /data/shops
- GET /data/reviews

**Webhooks:**
- GET /webhooks
- POST /webhooks
- PUT /webhooks/:id
- DELETE /webhooks/:id
- POST /webhooks/:id/test

**Settings:**
- GET /auth/check-cookies
- POST /auth/update-cookies

## คำถามเบื้องต้น:

ก่อนเริ่มงาน ช่วยตอบคำถามเหล่านี้:
1. ต้องการให้ใช้ pnpm, npm, หรือ yarn?
2. ต้องการ Dark Mode ไหม?
3. ต้องการ Storybook สำหรับ Component Library ไหม?
4. ต้องการ ESLint + Prettier ไหม?
5. ต้องการ Unit Tests (Vitest + Testing Library) ไหม?

พร้อมเริ่มงานเมื่อไหร่ก็บอกได้เลย!
```

### English Version (Detailed)

```
# Context: EcomScraper Hub Project

You are a Senior Frontend Developer with expertise in:
- React 18+ with TypeScript
- Vite (Build Tool)
- Tailwind CSS + shadcn/ui (UI Library)
- Zustand (State Management)
- React Query (Data Fetching)
- Socket.io-client (Real-time)
- Recharts (Data Visualization)

## Project: EcomScraper Hub

**What is the system?**
- Multi-Platform E-commerce Scraper
- Supports 3 platforms: TikTok (Live + Shop), Shopee, Lazada
- Can scrape Products, Shops, Reviews in real-time
- Has Webhook integration, Scheduled scraping, Rate limiting

**Existing Backend:**
- Node.js + Express
- SQLite database (10 tables)
- RESTful API (30+ endpoints)
- WebSocket for real-time updates
- Path: C:\Users\Winon\.openclaw\workspace\All Project\tiktok-live-scraper

**Documentation Prepared:**
In the `ecom-scraper-plan/` folder:

1. **UI-DESIGN-BRIEF-EN.md** (30KB)
   - Project overview and User Personas
   - Navigation and Layout structure
   - Wireframes for all pages (Dashboard, Scraper, Data, Webhooks, Settings, Logs)
   - Component Library and Design System
   - User Flow Diagrams
   - Phase 2.5 Implementation Plan (3-4 weeks)

2. **UI-DESIGN-BRIEF-TH.md** (50KB)
   - Thai version (more detailed)

3. **COMPONENT-CHECKLIST.md** (11KB)
   - Complete UI Components list (100+ items)
   - Prioritized (High/Medium/Low)
   - Development guidelines

## Task: Phase 2.5 - UI Development

**Timeline:** 3-4 weeks

### Week 1: Setup & Core Components (START HERE)

**Day 1-2: Project Setup**
1. Read UI-DESIGN-BRIEF-EN.md thoroughly first
2. Create React + Vite + TypeScript project
3. Install dependencies:
   - Tailwind CSS
   - shadcn/ui (components)
   - React Router
   - Axios (HTTP client)
   - Zustand (state)
   - React Query (data fetching)
   - Socket.io-client (real-time)
   - Recharts (charts)
   - Lucide React (icons)
   - date-fns (date utilities)
   - react-hot-toast (notifications)

4. Setup project structure:
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── dashboard/
│   │   ├── scraper/
│   │   ├── data/
│   │   ├── webhooks/
│   │   ├── settings/
│   │   └── layout/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── stores/
│   ├── types/
│   └── App.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

**Day 3-5: Design System & Components**

1. Create Design System according to documentation:
   - Colors: Primary colors for each platform (TikTok pink, Shopee orange, Lazada blue)
   - Typography: Headings (H1-H4), Body (Large, Regular, Small)
   - Spacing: Use Tailwind spacing scale
   - Border radius: 8px for cards, 6px for inputs

2. Build Core Components (see COMPONENT-CHECKLIST.md):
   - Button (Primary, Secondary, Danger, Icon, Text variants)
   - Input (Text input with validation states)
   - Card (Content card with header, body, footer)
   - Modal/Dialog (Modal component)
   - Toast (Notification system using react-hot-toast)
   - Badge (Status badges with platform colors)
   - ProgressBar (Progress indicator)
   - LoadingSpinner (Loading state)
   - Table (Data table with sorting)

**Day 6-7: Layout & Navigation**

1. Create Layout Components:
   - AppLayout (Main layout with sidebar + top nav)
   - TopNavigation (Logo, menu, user dropdown)
   - Sidebar (Collapsible navigation menu)
   - PageHeader (Reusable page header)

2. Setup React Router:
   - Dashboard: /
   - Scraper: /scraper/*
   - Data: /data/*
   - Webhooks: /webhooks
   - Settings: /settings/*
   - Logs: /logs

3. Test responsive design (Desktop, Tablet, Mobile)

## Working Process:

**Getting Started:**
1. Read the entire UI-DESIGN-BRIEF-EN.md
2. Ask me if you have any questions about Design or Requirements
3. Start with Project Setup

**During Development:**
- Work step-by-step, no rush
- Show me the code you create
- Ask if you're unsure
- Test each component after creation

**After Week 1:**
- Should have Core Components ready
- Layout ready to use
- Responsive design working
- Ready to start Week 2: Dashboard & Scraper Pages

## Backend API Endpoints (for later integration):

Base URL: `http://localhost:3000/api`

**Health & Status:**
- GET /health
- GET /scraper/status

**Scraping:**
- POST /scraper/start
- POST /scraper/stop/:jobId
- GET /scraper/jobs
- GET /scraper/jobs/:jobId

**Data:**
- GET /data/products
- GET /data/products/:id
- GET /data/shops
- GET /data/reviews

**Webhooks:**
- GET /webhooks
- POST /webhooks
- PUT /webhooks/:id
- DELETE /webhooks/:id
- POST /webhooks/:id/test

**Settings:**
- GET /auth/check-cookies
- POST /auth/update-cookies

## Initial Questions:

Before starting, please answer:
1. Prefer pnpm, npm, or yarn?
2. Need Dark Mode?
3. Need Storybook for Component Library?
4. Need ESLint + Prettier?
5. Need Unit Tests (Vitest + Testing Library)?

Ready to start when you are!
```

---

## 📦 Phase-by-Phase Prompts

### Phase 1: Project Setup (Day 1-2)

```
วันนี้เราจะ Setup โปรเจกต์:

1. สร้างโปรเจกต์ใหม่:
   npm create vite@latest ecom-scraper-ui -- --template react-ts

2. เข้าไปในโฟลเดอร์:
   cd ecom-scraper-ui

3. ติดตั้ง Tailwind CSS:
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p

4. ติดตั้ง shadcn/ui:
   npx shadcn-ui@latest init

5. ติดตั้ง dependencies อื่นๆ:
   npm install react-router-dom axios zustand @tanstack/react-query socket.io-client recharts lucide-react date-fns react-hot-toast

6. สร้างโครงสร้างโฟลเดอร์ตามเอกสาร

7. Config Tailwind และ Vite

ช่วยทำตามขั้นตอนเหล่านี้ให้หน่อย และ generate โค้ด config files ที่จำเป็น
```

### Phase 2: Design System (Day 3)

```
ตอนนี้เราจะสร้าง Design System:

1. อ่านส่วน "Component Library" ในไฟล์ UI-DESIGN-BRIEF-TH.md

2. สร้างไฟล์ src/styles/design-tokens.css ที่มี:
   - CSS Variables สำหรับ colors (TikTok pink, Shopee orange, Lazada blue, status colors)
   - Typography scale
   - Spacing scale
   - Border radius values

3. สร้างไฟล์ tailwind.config.js ที่ extend กับ design tokens

4. สร้างไฟล์ src/lib/constants/colors.ts สำหรับ export color values

ช่วย generate โค้ดเหล่านี้ตามเอกสาร Design System
```

### Phase 3: Core Components (Day 4-5)

```
เราจะสร้าง Core Components:

อ้างอิงจาก COMPONENT-CHECKLIST.md ส่วน "Core Components"

สร้าง Components เหล่านี้ที่ src/components/ui/:

1. Button.tsx - มี variants: primary, secondary, danger, text, icon
2. Input.tsx - Text input with label, error state, help text
3. Card.tsx - Card with header, body, footer slots
4. Modal.tsx - Modal dialog with overlay
5. Badge.tsx - Platform badges และ status badges
6. ProgressBar.tsx - Progress indicator

แต่ละ component ต้องมี:
- TypeScript interface สำหรับ props
- Tailwind styling
- Responsive design
- Accessible (ARIA labels)

เริ่มจาก Button component ก่อน ช่วย generate โค้ดให้หน่อย
```

### Phase 4: Layout (Day 6-7)

```
เราจะสร้าง Layout Components:

อ้างอิงจาก Wireframes ในเอกสาร UI-DESIGN-BRIEF-TH.md

1. AppLayout.tsx - Main layout:
   - Top Navigation (height 64px)
   - Sidebar (width 256px, collapsible)
   - Main Content Area
   - Responsive (sidebar collapse on mobile)

2. TopNavigation.tsx:
   - Logo (left)
   - Navigation menu (center)
   - User dropdown (right)

3. Sidebar.tsx:
   - Navigation links
   - Active state highlighting
   - Collapse button

4. PageHeader.tsx:
   - Page title
   - Breadcrumbs
   - Action buttons

ช่วยสร้าง AppLayout component พร้อม routing setup ด้วย React Router
```

---

## 🎨 Component Development Prompts

### สร้าง Dashboard Page

```
ตอนนี้เราจะสร้าง Dashboard Page:

อ้างอิงจากส่วน "Dashboard" ใน UI-DESIGN-BRIEF-TH.md

สร้างหน้า Dashboard ที่ src/pages/Dashboard.tsx ที่มี:

1. Platform Stats Cards (3 cards: TikTok, Shopee, Lazada)
   - แสดง total jobs, active jobs, trend
   - สี card ตาม platform

2. Activity Chart
   - Multi-line chart (Recharts)
   - แสดง scraping activity 24 ชั่วโมงที่ผ่านมา

3. Active Jobs Widget
   - List ของ jobs ที่กำลัง running
   - แสดง progress bar, status, actions

4. Recent Activities Widget
   - Feed ของ activities ล่าสุด
   - แสดง icon, message, timestamp

5. Quick Actions Panel
   - Buttons สำหรับ quick actions

Layout ตาม wireframe ในเอกสาร
ใช้ Grid layout (responsive)

ช่วยสร้าง Dashboard page พร้อม mock data ให้ทดสอบหน่อย
```

### สร้าง Scraper Wizard

```
เราจะสร้าง Scraper Wizard (Multi-step form):

อ้างอิงจากส่วน "Scraper" ใน UI-DESIGN-BRIEF-TH.md

สร้าง ScraperWizard.tsx ที่มี 5 steps:

1. Select Platform (TikTok / Shopee / Lazada)
2. Select Scraping Type
3. Configure Scraping (URLs, keywords, etc.)
4. Advanced Options (Rate limiting, retry, webhooks)
5. Schedule (Immediate / Later / Recurring)

Features:
- Step indicator ด้านบน
- Validation แต่ละ step
- Back/Next buttons
- Final summary ก่อน submit

ใช้ Zustand สำหรับ manage wizard state

ช่วยสร้าง wizard structure และ step 1 (Platform selector) ก่อน
```

### สร้าง Data Table

```
สร้าง ProductTable component สำหรับ Data Browser:

อ้างอิงจากส่วน "Data Browser" ในเอกสาร

Features ที่ต้องมี:
- Columns: Checkbox, Image, Product Name, Price, Platform, Actions
- Sorting (click column header)
- Pagination
- Row selection (checkbox)
- Bulk actions (delete, export selected)
- Search and filters

ใช้ Headless UI หรือ TanStack Table ก็ได้

Component props:
- data: Product[]
- loading: boolean
- onSort: (column, direction) => void
- onPageChange: (page) => void
- onSelect: (ids) => void

ช่วยสร้าง ProductTable component พร้อม mock data
```

---

## 🔧 Troubleshooting Prompts

### เมื่อ Components ไม่ทำงาน

```
Component [ชื่อ component] ไม่ทำงานตามที่คาดหวัง:

ปัญหา:
[อธิบายปัญหา]

Error message (ถ้ามี):
[paste error]

Code ที่เกี่ยวข้อง:
[paste code]

ช่วยหาสาเหตุและแก้ไขให้หน่อย
```

### เมื่อต้องการ Refactor

```
ผมต้องการ refactor component [ชื่อ] ให้ดีขึ้น:

ปัญหาปัจจุบัน:
- [ระบุปัญหา เช่น code ยาวเกินไป, ซ้ำซ้อน, performance ไม่ดี]

ต้องการ:
- [ระบุสิ่งที่ต้องการปรับปรุง]

Code ปัจจุบัน:
[paste code]

ช่วย suggest วิธี refactor และ implement ให้หน่อย
```

### เมื่อติดปัญหา Styling

```
Component [ชื่อ] มีปัญหาเรื่อง styling:

ปัญหา:
- [เช่น responsive ไม่ทำงาน, colors ไม่ถูกต้อง, layout พัง]

Screenshot หรืออธิบาย:
[อธิบายปัญหา]

Code:
[paste code]

ต้องการให้มันดูแบบนี้:
[อธิบายหรืออ้างอิง wireframe จากเอกสาร]

ช่วยแก้ไข Tailwind classes ให้หน่อย
```

---

## 💡 Tips for Using These Prompts

### For Best Results:

1. **Always provide context first**
   - ให้ AI รู้ว่ากำลังทำอะไร
   - อ้างอิงเอกสารที่เกี่ยวข้อง

2. **Be specific**
   - บอกชัดว่าต้องการอะไร
   - ระบุ requirements และ constraints

3. **Work incrementally**
   - ทำทีละขั้นตอน
   - Test แต่ละส่วนก่อนไปต่อ

4. **Show examples**
   - ใช้ wireframes จากเอกสาร
   - แสดง mockups หรือ screenshots

5. **Iterate**
   - Review และปรับปรุงตาม feedback
   - ถามคำถามเพิ่มเติมเมื่อไม่แน่ใจ

---

## 📋 Prompt Templates

### Template: Create New Component

```
สร้าง [Component Name] component:

**Purpose:** [อธิบายว่า component นี้ทำอะไร]

**Location:** src/components/[folder]/[ComponentName].tsx

**Props:**
```typescript
interface [ComponentName]Props {
  // list props here
}
```

**Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Design Reference:**
- ดูจาก [section name] ใน UI-DESIGN-BRIEF-TH.md
- [อธิบายหรือแนบ wireframe]

**Requirements:**
- TypeScript
- Tailwind CSS styling
- Responsive design
- Accessible (ARIA)

ช่วยสร้าง component นี้ให้หน่อย
```

### Template: Integrate API

```
เชื่อม [Component/Page] กับ Backend API:

**Component:** [ชื่อ component]

**API Endpoint:** 
- Method: [GET/POST/PUT/DELETE]
- URL: /api/[endpoint]
- Request body (ถ้ามี): [structure]
- Response: [structure]

**Requirements:**
- ใช้ React Query (useQuery/useMutation)
- Loading state
- Error handling
- Success notification (toast)

**Current Code:**
[paste component code]

ช่วยเพิ่ม API integration code ให้หน่อย
```

### Template: Add Real-time Updates

```
เพิ่ม Real-time updates ให้ [Component]:

**Component:** [ชื่อ component]

**WebSocket Event:** [event name]

**Event Data Structure:**
```typescript
interface EventData {
  // structure
}
```

**What to Update:**
- [อธิบายว่าต้อง update UI อย่างไร]

**Requirements:**
- ใช้ Socket.io-client
- Subscribe on mount, unsubscribe on unmount
- Update state เมื่อได้ event
- Handle reconnection

ช่วย implement WebSocket integration ให้หน่อย
```

---

## 🚀 Getting Started Checklist

เมื่อเริ่มใช้ Prompts เหล่านี้:

- [ ] อ่านเอกสาร UI-DESIGN-BRIEF-TH.md ทั้งหมดก่อน
- [ ] เข้าใจโครงสร้างของระบบ
- [ ] เตรียม Backend API ให้พร้อม (หรือใช้ mock data)
- [ ] ตัดสินใจเลือก Tech Stack
- [ ] เตรียม development environment
- [ ] Clone/ดาวน์โหลดโปรเจกต์
- [ ] เปิด Terminal และ Code Editor พร้อม

**Ready to start!** 🎉

เริ่มจาก **Detailed Setup Prompt** เลย แล้วทำตาม Phase-by-Phase

---

## 📞 Need Help?

ถ้าติดปัญหาระหว่างทำ:

1. กลับมาอ่านเอกสาร UI-DESIGN-BRIEF-TH.md อีกครั้ง
2. ดูที่ COMPONENT-CHECKLIST.md เพื่อ check progress
3. ใช้ Troubleshooting Prompts ด้านบน
4. ถามคำถามเฉพาะเจาะจง

**สนุกกับการพัฒนา UI นะ!** 💝🚀

---

*Prompts Version: 1.0*
*Last Updated: 2024-03-28*
*Compatible with: Claude, GPT-4, Gemini, other coding-capable AI models*
