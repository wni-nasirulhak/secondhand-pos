# 🎨 UI Design Brief - EcomScraper Hub
## เอกสารออกแบบ UI สำหรับระบบ Multi-Platform E-commerce Scraper

---

## 📋 สารบัญ
1. [ภาพรวมโครงการ](#ภาพรวมโครงการ)
2. [วิเคราะห์ระบบและ User Personas](#วิเคราะห์ระบบและ-user-personas)
3. [โครงสร้าง UI/UX](#โครงสร้าง-uiux)
4. [รายละเอียดหน้าจอแต่ละส่วน](#รายละเอียดหน้าจอแต่ละส่วน)
5. [Component Library](#component-library)
6. [User Flow Diagrams](#user-flow-diagrams)
7. [Wireframes & Mockups](#wireframes--mockups)
8. [Technical Stack Recommendations](#technical-stack-recommendations)
9. [Phase Implementation Plan](#phase-implementation-plan)
10. [Next Steps](#next-steps)

---

## 🎯 ภาพรวมโครงการ

### ระบบคืออะไร?
**EcomScraper Hub** คือระบบ Multi-Platform E-commerce Scraper ที่รองรับการดึงข้อมูลจาก:
- 🎵 **TikTok** (Live Streaming + TikTok Shop)
- 🛒 **Shopee** (Products, Shops, Search)
- 📦 **Lazada** (Products, Shops, Search)

### ความสามารถหลักของระบบ
1. **Real-time Scraping**: ดึงข้อมูลแบบ real-time
2. **Scheduled Scraping**: ตั้งเวลาดึงข้อมูลอัตโนมัติ
3. **Webhook Integration**: ส่งข้อมูลไปยังระบบอื่นทันทีที่ scrape เสร็จ
4. **Data Normalization**: ปรับข้อมูลจากแต่ละ platform ให้เป็นรูปแบบเดียวกัน
5. **Rate Limiting & Retry**: จัดการ rate limit และ retry อัตโนมัติ
6. **Multi-Platform Management**: จัดการหลาย platform ในที่เดียว

### เป้าหมายของ UI
- **ง่ายต่อการใช้งาน**: ผู้ใช้ไม่ต้องรู้ code ก็ใช้งานได้
- **Visualize ข้อมูล**: แสดงข้อมูลที่ซับซ้อนให้เห็นง่าย
- **Real-time Monitoring**: เห็นสถานะการทำงานแบบ real-time
- **Professional & Modern**: ดูเป็นมืออาชีพ ใช้งานสะดวก

---

## 👥 วิเคราะห์ระบบและ User Personas

### User Personas

#### 1. **Data Analyst (นักวิเคราะห์ข้อมูล)**
- **เป้าหมาย**: ต้องการดึงข้อมูลจาก e-commerce มาวิเคราะห์ trend, ราคา, คู่แข่ง
- **Pain Points**: ดึงข้อมูลทีละ platform ยุ่งยาก, ข้อมูลไม่ตรงกัน
- **ความต้องการ**: Dashboard ที่เห็นภาพรวม, ดาวน์โหลดข้อมูลได้ง่าย, กราฟแสดงผล

#### 2. **E-commerce Business Owner (เจ้าของร้านค้าออนไลน์)**
- **เป้าหมาย**: ติดตามคู่แข่ง, ดูราคา, ดู review, หา trending products
- **Pain Points**: ต้องเปิดหลาย tab ดูข้อมูล, เสียเวลา
- **ความต้องการ**: Alert เมื่อราคาคู่แข่งเปลี่ยน, ดู trending products, เปรียบเทียบง่าย

#### 3. **Developer/Integrator (นักพัฒนา)**
- **เป้าหมาย**: เชื่อมต่อระบบ scraper กับระบบอื่น ผ่าน API/Webhook
- **Pain Points**: API documentation ไม่ชัด, webhook setup ยาก
- **ความต้องการ**: API playground, webhook testing, clear documentation

#### 4. **Marketing Team (ทีมการตลาด)**
- **เป้าหมาย**: หา trending products, influencer, viral content
- **Pain Points**: ต้องดูด้วยตนเอง, ไม่มีระบบแจ้งเตือน
- **ความต้องการ**: Dashboard แสดง viral content, trending products, save favorites

---

## 🏗️ โครงสร้าง UI/UX

### Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Top Navigation                        │
│  [Logo] [Dashboard] [Scraper] [Data] [Webhooks] [Settings]  │
└─────────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────────┐
│          │                                                  │
│  Side    │                                                  │
│  Menu    │              Main Content Area                   │
│          │                                                  │
│  - Quick │                                                  │
│    Actions│                                                 │
│  - Recent│                                                  │
│  - Stats │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### Navigation Structure

```
EcomScraper Hub
├── 📊 Dashboard (หน้าหลัก)
│   ├── Overview Stats
│   ├── Active Scraping Jobs
│   ├── Recent Activities
│   └── Quick Actions
│
├── 🔍 Scraper (จัดการการ Scrape)
│   ├── New Scraping Job
│   │   ├── TikTok Live
│   │   ├── TikTok Shop
│   │   ├── Shopee
│   │   └── Lazada
│   ├── Active Jobs
│   ├── Scheduled Jobs
│   └── Job History
│
├── 💾 Data (ดูข้อมูลที่ดึงมา)
│   ├── Products
│   ├── Shops/Sellers
│   ├── Reviews
│   ├── Live Streams
│   └── Export Data
│
├── 🔗 Webhooks (จัดการ Webhooks)
│   ├── Webhook List
│   ├── Add New Webhook
│   ├── Test Webhook
│   └── Delivery Logs
│
├── ⚙️ Settings (ตั้งค่า)
│   ├── Authentication
│   │   ├── TikTok Cookies
│   │   ├── Shopee Cookies
│   │   └── Lazada Cookies
│   ├── Rate Limiting
│   ├── Proxy Settings
│   ├── Notification Settings
│   └── API Keys
│
└── 📝 Logs & Monitoring (ติดตามการทำงาน)
    ├── Real-time Logs
    ├── Error Logs
    ├── Performance Metrics
    └── System Health
```

---

## 📱 รายละเอียดหน้าจอแต่ละส่วน

### 1. 📊 Dashboard (หน้าหลัก)

#### จุดประสงค์
แสดงภาพรวมของระบบ, สถานะการทำงาน, และข้อมูลสำคัญในทันที

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Dashboard                               [Refresh] [⚙️]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 🎵 TikTok    │ │ 🛒 Shopee    │ │ 📦 Lazada    │        │
│  │ 1,234 Jobs   │ │ 567 Jobs     │ │ 890 Jobs     │        │
│  │ ↑ 12% today  │ │ ↓ 5% today   │ │ ↑ 8% today   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📈 Scraping Activity (Last 24 Hours)                │    │
│  │                                                      │    │
│  │    [Line Chart: Jobs Over Time]                     │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────┐     │
│  │ ⚡ Active Jobs      │  │ 🔔 Recent Activities     │     │
│  │                     │  │                          │     │
│  │ TikTok Shop        │  │ ✅ Job #1234 completed   │     │
│  │ Status: Running    │  │ ⚠️ Rate limit warning   │     │
│  │ Progress: 45%      │  │ 📥 1.2k products saved   │     │
│  │ [View] [Stop]      │  │ 🔗 Webhook delivered     │     │
│  │                     │  │                          │     │
│  │ Shopee Search      │  │ [View All]               │     │
│  │ Status: Queued     │  │                          │     │
│  │ ETA: 5 mins        │  │                          │     │
│  │ [View] [Cancel]    │  │                          │     │
│  └─────────────────────┘  └──────────────────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🚀 Quick Actions                                      │   │
│  │                                                       │   │
│  │  [New TikTok Scrape] [New Shopee Scrape]            │   │
│  │  [New Lazada Scrape] [View All Data]                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Key Components

##### 📊 Platform Stats Cards
```
┌──────────────────────┐
│ 🎵 TikTok            │
│ 1,234 Total Jobs     │
│ 45 Active            │
│ ↑ 12% vs yesterday   │
│                      │
│ [View Details →]     │
└──────────────────────┘
```
- **ข้อมูลที่แสดง**: Total jobs, Active jobs, Growth trend
- **Interaction**: Click to filter dashboard by platform
- **Visual**: Icon + Number + Trend arrow + Sparkline

##### 📈 Activity Chart
- **Type**: Multi-line chart (one line per platform)
- **X-axis**: Time (24 hours)
- **Y-axis**: Number of jobs/products scraped
- **Interaction**: Hover to see exact numbers, Click to zoom
- **Colors**: TikTok (pink), Shopee (orange), Lazada (blue)

##### ⚡ Active Jobs Widget
```
┌─────────────────────────────────────┐
│ ⚡ Active Jobs (3)                  │
├─────────────────────────────────────┤
│ 🎵 TikTok Shop - Product Search     │
│ Status: Running 🟢                  │
│ Progress: ████████░░ 45%            │
│ Found: 234 products                 │
│ Time: 2m 34s                        │
│ [View Details] [Stop] [Logs]        │
│─────────────────────────────────────│
│ 🛒 Shopee - Product Scrape          │
│ Status: Queued 🟡                   │
│ Position: #2 in queue               │
│ ETA: ~5 minutes                     │
│ [View] [Cancel] [Edit]              │
└─────────────────────────────────────┘
```

##### 🔔 Recent Activities Feed
```
┌──────────────────────────────────────┐
│ 🔔 Recent Activities                 │
├──────────────────────────────────────┤
│ ✅ Job #1234 completed successfully  │
│    1,245 products saved              │
│    2 minutes ago                     │
│                                      │
│ ⚠️ Rate limit warning on TikTok     │
│    Auto-retry in 5 minutes           │
│    5 minutes ago                     │
│                                      │
│ 📥 Webhook delivered to endpoint #3  │
│    Status: 200 OK                    │
│    8 minutes ago                     │
│                                      │
│ 🔄 Scheduled job started             │
│    Daily Shopee trending scan        │
│    15 minutes ago                    │
│                                      │
│ [View All Activities →]              │
└──────────────────────────────────────┘
```

---

### 2. 🔍 Scraper (จัดการการ Scrape)

#### หน้า: New Scraping Job

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 New Scraping Job                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Select Platform                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ 🎵       │ │ 🛒       │ │ 📦       │                    │
│  │ TikTok   │ │ Shopee   │ │ Lazada   │                    │
│  │ [Select] │ │ [Select] │ │ [Select] │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Selected: 🎵 TikTok                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Step 2: Select Scraping Type                                │
│  ( ) TikTok Live - Scrape live streaming data               │
│  (●) TikTok Shop - Product/Shop data                        │
│  ( ) TikTok Search - Search results                         │
│                                                              │
│  Step 3: Configure Scraping                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Scraping Mode:                                        │  │
│  │ ( ) Single URL                                        │  │
│  │ (●) Multiple URLs                                     │  │
│  │ ( ) Search by Keyword                                 │  │
│  │ ( ) Scrape by Shop                                    │  │
│  │                                                       │  │
│  │ ─────────────────────────────────────────────────────│  │
│  │                                                       │  │
│  │ URLs to scrape (one per line):                       │  │
│  │ ┌─────────────────────────────────────────────────┐ │  │
│  │ │ https://shop.tiktok.com/view/product/1234      │ │  │
│  │ │ https://shop.tiktok.com/view/product/5678      │ │  │
│  │ │                                                 │ │  │
│  │ └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │ Or upload file: [Choose File] (.txt, .csv)          │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Step 4: Advanced Options (Optional)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [▼ Show Advanced Options]                            │  │
│  │                                                       │  │
│  │ Rate Limiting:                                        │  │
│  │ ├─ Max requests per minute: [30] ────────────────    │  │
│  │ ├─ Delay between requests: [2] seconds               │  │
│  │                                                       │  │
│  │ Retry Strategy:                                       │  │
│  │ ├─ Max retries: [3] ──────────                       │  │
│  │ ├─ Retry delay: [5] seconds                          │  │
│  │                                                       │  │
│  │ Data Options:                                         │  │
│  │ ☑ Scrape product images                              │  │
│  │ ☑ Scrape product reviews                             │  │
│  │ ☑ Scrape product variants                            │  │
│  │ ☐ Scrape shop information                            │  │
│  │                                                       │  │
│  │ Webhook:                                              │  │
│  │ ☑ Send to webhook when complete                      │  │
│  │ Webhook: [Select webhook ▼]                          │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Step 5: Schedule (Optional)                                 │
│  ( ) Run immediately                                         │
│  ( ) Schedule for later                                      │
│  ( ) Recurring schedule                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Cancel]                            [Start Scraping] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Key Features

##### Platform-Specific Templates
เมื่อเลือก platform จะแสดง template เฉพาะ:

**TikTok Shop Template:**
```
Input Options:
├─ Product URLs
├─ Shop URLs (@shopname)
├─ Search keywords
└─ Hashtag search

Data to Scrape:
☑ Product details (name, price, images)
☑ Product variants (size, color, etc.)
☑ Product reviews & ratings
☑ Shop information
☑ Related products
```

**Shopee Template:**
```
Input Options:
├─ Product URLs
├─ Shop URLs
├─ Category browse
└─ Search keywords

Data to Scrape:
☑ Product details
☑ Seller information
☑ Product ratings & reviews
☑ Similar products
☑ Price history (if available)
```

---

### 3. 💾 Data (ดูข้อมูลที่ดึงมา)

```
┌─────────────────────────────────────────────────────────────┐
│  💾 Data Browser                        [Export] [Filter]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters:                                                    │
│  Platform: [All ▼] | Type: [Products ▼] | Date: [Last 7d ▼]│
│  Search: [Search products...                          ] 🔍  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Found 1,234 products | Page 1 of 42     [< 1 2 3 >]  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ┌───┬─────────┬─────────────────┬────────┬─────────────┐││
│  │ │ ☐ │ Image   │ Product Name    │ Price  │ Platform    │││
│  │ ├───┼─────────┼─────────────────┼────────┼─────────────┤││
│  │ │ ☐ │ [IMG]   │ iPhone 15 Pro..│ $999   │ 🎵 TikTok   │││
│  │ │   │         │ Shop: TechStore│        │ 2h ago      │││
│  │ │   │         │ Rating: 4.8 ⭐ │        │ [View][Del] │││
│  │ ├───┼─────────┼─────────────────┼────────┼─────────────┤││
│  │ │ ☐ │ [IMG]   │ Samsung Galax..│ $849   │ 🛒 Shopee   │││
│  │ │   │         │ Shop: MobilePro│        │ 3h ago      │││
│  │ │   │         │ Rating: 4.6 ⭐ │        │ [View][Del] │││
│  │ ├───┼─────────┼─────────────────┼────────┼─────────────┤││
│  │ │ ☐ │ [IMG]   │ AirPods Pro 2..│ $249   │ 📦 Lazada   │││
│  │ │   │         │ Shop: AudioHub │        │ 5h ago      │││
│  │ │   │         │ Rating: 4.9 ⭐ │        │ [View][Del] │││
│  │ └───┴─────────┴─────────────────┴────────┴─────────────┘││
│  │                                                          ││
│  │ [☐ Select All] [Delete Selected] [Export Selected]      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Quick Stats:                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 1.2K    │ │ 567     │ │ 890     │ │ 4.5⭐   │           │
│  │ Products│ │ Shops   │ │ Reviews │ │ Avg Rate│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Product Detail Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Product Details                                    [✕ Close]│
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  iPhone 15 Pro Max 256GB                      │
│  │          │  Platform: 🎵 TikTok Shop                      │
│  │  [IMG]   │  Shop: @techstore_official                    │
│  │          │  Rating: 4.8 ⭐ (2,345 reviews)               │
│  │  [IMG]   │                                               │
│  │          │  Price: $999.00                               │
│  │  [IMG]   │  Original Price: $1,099.00 (-9%)             │
│  │          │  Stock: 245 units                             │
│  └──────────┘  Sold: 1,234 units                            │
│                                                              │
│  Description:                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Latest iPhone 15 Pro Max with A17 Pro chip...       │   │
│  │ - 256GB Storage                                      │   │
│  │ - Titanium Design                                    │   │
│  │ - 48MP Camera System                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Variants:                                                   │
│  Storage: [128GB] [256GB✓] [512GB] [1TB]                    │
│  Color: [Black] [White] [Blue✓] [Natural]                   │
│                                                              │
│  Recent Reviews: (Top 3)                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⭐⭐⭐⭐⭐ Great phone! Fast delivery.              │   │
│  │ by user123 | 2 days ago                              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ ⭐⭐⭐⭐☆ Good but expensive                        │   │
│  │ by shopaholic | 3 days ago                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  [View All Reviews →]                                        │
│                                                              │
│  Metadata:                                                   │
│  Scraped: 2024-03-28 07:30:15                                │
│  Job ID: #1234                                               │
│  URL: [Copy Link] [Open Original]                           │
│                                                              │
│  Actions:                                                    │
│  [Export JSON] [Export CSV] [Delete] [Re-scrape]            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. 🔗 Webhooks (จัดการ Webhooks)

```
┌─────────────────────────────────────────────────────────────┐
│  🔗 Webhooks                               [+ Add Webhook]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Active Webhooks (3)                                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 1. Slack Notifications                     [Edit] [Del]  ││
│  │    https://hooks.slack.com/services/...                  ││
│  │    Status: Active 🟢 | Last delivery: 2m ago             ││
│  │    Success rate: 98.5% (1,234/1,253)                     ││
│  │    [Test] [View Logs] [Disable]                          ││
│  │                                                           ││
│  │ 2. Discord Channel                         [Edit] [Del]  ││
│  │    https://discord.com/api/webhooks/...                  ││
│  │    Status: Active 🟢 | Last delivery: 5m ago             ││
│  │    Success rate: 100% (567/567)                          ││
│  │    [Test] [View Logs] [Disable]                          ││
│  │                                                           ││
│  │ 3. Custom API Endpoint                     [Edit] [Del]  ││
│  │    https://api.example.com/webhook                       ││
│  │    Status: Failing 🔴 | Last error: 10m ago              ││
│  │    Success rate: 45% (890/1,967)                         ││
│  │    Error: Connection timeout                             ││
│  │    [Test] [View Logs] [Fix]                              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Webhook Events:                                             │
│  ☑ Scraping job completed                                    │
│  ☑ Scraping job failed                                       │
│  ☑ New products found                                        │
│  ☐ Price changes detected                                    │
│  ☐ Stock changes detected                                    │
│  ☑ Rate limit warning                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Add Webhook Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Add New Webhook                                   [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Webhook Name: *                                             │
│  [Slack Production Alerts                              ]    │
│                                                              │
│  Webhook URL: *                                              │
│  [https://hooks.slack.com/services/...                 ]    │
│                                                              │
│  Method:                                                     │
│  (●) POST  ( ) GET  ( ) PUT                                 │
│                                                              │
│  Headers: (Optional)                                         │
│  ┌────────────────────┬────────────────────┐                │
│  │ Content-Type       │ application/json   │ [Remove]       │
│  │ Authorization      │ Bearer token...    │ [Remove]       │
│  └────────────────────┴────────────────────┘                │
│  [+ Add Header]                                              │
│                                                              │
│  Trigger Events: *                                           │
│  ☑ Job completed                                             │
│  ☑ Job failed                                                │
│  ☑ New products found                                        │
│  ☐ Price changes                                             │
│  ☐ Stock changes                                             │
│                                                              │
│  Filters: (Optional)                                         │
│  Platform: [All ▼]                                           │
│  Minimum products: [10] products                             │
│                                                              │
│  Payload Format:                                             │
│  ( ) Simple  (●) Full  ( ) Custom                           │
│                                                              │
│  Test Payload:                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ {                                                    │   │
│  │   "event": "job.completed",                          │   │
│  │   "job_id": "test-1234",                             │   │
│  │   "platform": "tiktok",                              │   │
│  │   "products_count": 245,                             │   │
│  │   "timestamp": "2024-03-28T07:30:00Z"                │   │
│  │ }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  [Send Test Webhook]                                         │
│                                                              │
│  [Cancel]                                  [Save Webhook]    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. ⚙️ Settings (ตั้งค่า)

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                                 │
├───────────────┬─────────────────────────────────────────────┤
│ Navigation:   │                                             │
│               │  🔐 Authentication                          │
│ 🔐 Auth       │  ┌────────────────────────────────────────┐ │
│ ⚡ Rate Limit │  │ TikTok Cookies                         │ │
│ 🌐 Proxy      │  │ Status: Valid ✅ | Expires in 7 days   │ │
│ 🔔 Alerts     │  │ Last checked: 2 hours ago              │ │
│ 🔑 API Keys   │  │                                        │ │
│ 🛠️ Advanced   │  │ Cookie String:                         │ │
│               │  │ ┌────────────────────────────────────┐ │ │
│               │  │ │ sessionid=abc123...                │ │ │
│               │  │ │ csrf_token=xyz789...               │ │ │
│               │  │ └────────────────────────────────────┘ │ │
│               │  │                                        │ │
│               │  │ [Update Cookies] [Test Connection]    │ │
│               │  │ [Clear Cookies]                       │ │
│               │  └────────────────────────────────────────┘ │
│               │                                             │
│               │  ┌────────────────────────────────────────┐ │
│               │  │ Shopee Cookies                         │ │
│               │  │ Status: Valid ✅ | Expires in 14 days  │ │
│               │  │ [Manage →]                             │ │
│               │  └────────────────────────────────────────┘ │
│               │                                             │
│               │  ┌────────────────────────────────────────┐ │
│               │  │ Lazada Cookies                         │ │
│               │  │ Status: Expired ❌                      │ │
│               │  │ [Update Now →]                         │ │
│               │  └────────────────────────────────────────┘ │
│               │                                             │
│               │  📚 Cookie Management Tips:                 │
│               │  • Use browser extension to export cookies │
│               │  • Keep cookies secure and private         │
│               │  • Update before expiration                │
│               │  [How to get cookies? →]                   │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

---

### 6. 📝 Logs & Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│  📝 Logs & Monitoring                    [Pause] [Clear]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters: [All Levels ▼] [All Platforms ▼] [Last 1h ▼]      │
│  Search: [Filter logs...                              ] 🔍  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🟢 07:44:23 | INFO  | TikTok | Job #1234 started        ││
│  │ 🟢 07:44:25 | INFO  | TikTok | Found 10 products        ││
│  │ 🟡 07:44:30 | WARN  | TikTok | Rate limit approaching   ││
│  │ 🟢 07:44:35 | INFO  | TikTok | Retrying in 5s...        ││
│  │ 🔴 07:44:40 | ERROR | Shopee | Connection timeout       ││
│  │    └─ Details: ETIMEDOUT at fetch()                     ││
│  │    └─ Stack: Error: timeout of 30000ms exceeded...      ││
│  │ 🟢 07:44:45 | INFO  | System | Webhook delivered        ││
│  │ 🟢 07:44:50 | INFO  | Lazada | Job #5678 completed      ││
│  │                                                          ││
│  │ [Auto-scroll ☑] [Export Logs]                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  System Health:                                              │
│  ┌───────────┬───────────┬───────────┬───────────┐          │
│  │ CPU       │ Memory    │ Disk I/O  │ Network   │          │
│  │ 12%       │ 256 MB    │ 1.2 MB/s  │ 45 KB/s   │          │
│  │ ▁▂▃▂▁     │ ▂▃▄▃▂     │ ▁▁▂▁▁     │ ▂▂▃▂▁     │          │
│  └───────────┴───────────┴───────────┴───────────┘          │
│                                                              │
│  Performance Metrics:                                        │
│  • Average scraping time: 2.3 seconds                        │
│  • Success rate: 94.5%                                       │
│  • Active connections: 12                                    │
│  • Queue length: 3 jobs                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Library

### Design System

#### Colors
```css
/* Primary */
--primary-pink: #FE2C55      /* TikTok Brand */
--primary-orange: #EE4D2D    /* Shopee Brand */
--primary-blue: #0F146D      /* Lazada Brand */

/* Status */
--success: #10B981           /* Green */
--warning: #F59E0B           /* Yellow */
--error: #EF4444             /* Red */
--info: #3B82F6              /* Blue */

/* Neutrals */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-600: #4B5563
--gray-900: #111827

/* Backgrounds */
--bg-primary: #FFFFFF
--bg-secondary: #F9FAFB
--bg-dark: #111827
```

#### Typography
```css
/* Headings */
H1: 32px, Bold, Line-height 1.2
H2: 24px, Bold, Line-height 1.3
H3: 20px, Semibold, Line-height 1.4
H4: 18px, Semibold, Line-height 1.4

/* Body */
Body Large: 16px, Regular, Line-height 1.5
Body: 14px, Regular, Line-height 1.5
Body Small: 12px, Regular, Line-height 1.5

/* Font Family */
Primary: 'Inter', 'Prompt', sans-serif
Monospace: 'Fira Code', monospace (for code/logs)
```

#### Components

##### Button
```
Primary:    [Start Scraping] 
            Background: --primary-blue
            Hover: darken(10%)
            
Secondary:  [Cancel]
            Background: --gray-200
            Color: --gray-900
            
Danger:     [Delete]
            Background: --error
            
Icon:       [🔍]
            Size: 32x32px, Icon only
            
Text:       [View Details →]
            No background, underline on hover
```

##### Card
```
┌──────────────────────────┐
│ Card Header              │
├──────────────────────────┤
│ Card Body                │
│ Lorem ipsum...           │
│                          │
│ [Action]                 │
└──────────────────────────┘

Background: --bg-primary
Border: 1px solid --gray-200
Border-radius: 8px
Padding: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
```

##### Input Field
```
Label:
[Input text here...                    ]
Helper text / Error message

Border: 1px solid --gray-300
Focus: 2px solid --primary-blue
Error: 2px solid --error
Border-radius: 6px
Padding: 8px 12px
```

##### Badge
```
Platform Badges:
🎵 TikTok   → Pink background
🛒 Shopee   → Orange background
📦 Lazada   → Blue background

Status Badges:
Running 🟢  → Green
Queued 🟡   → Yellow
Failed 🔴   → Red
Completed ✅ → Success green
```

##### Progress Bar
```
Progress: 45%
████████░░░░░░░░░░

Height: 8px
Border-radius: 4px
Background: --gray-200
Fill: --primary-blue (animated)
```

##### Table
```
┌────┬──────────┬──────────┬──────────┐
│ ☐  │ Column 1 │ Column 2 │ Actions  │
├────┼──────────┼──────────┼──────────┤
│ ☐  │ Data 1   │ Data 2   │ [Edit]   │
│ ☐  │ Data 3   │ Data 4   │ [Edit]   │
└────┴──────────┴──────────┴──────────┘

Header: Bold, --gray-600
Rows: Hover background --gray-50
Border: 1px solid --gray-200
```

---

## 🔄 User Flow Diagrams

### Flow 1: Quick Product Scrape

```
[User lands on Dashboard]
        ↓
[Click "New TikTok Scrape"]
        ↓
[Select Platform: TikTok]
        ↓
[Select Type: TikTok Shop]
        ↓
[Enter Product URL]
        ↓
[Click "Start Scraping"]
        ↓
[See Progress in Dashboard]
        ↓
[Job completes → Notification]
        ↓
[View Data in Data Browser]
        ↓
[Export or View Details]
```

### Flow 2: Setup Webhook Notification

```
[Go to Webhooks page]
        ↓
[Click "+ Add Webhook"]
        ↓
[Enter Webhook Details]
├─ Name: "Slack Alerts"
├─ URL: "https://hooks.slack.com/..."
├─ Events: Select triggers
└─ Headers: Add auth token
        ↓
[Test Webhook]
        ↓
[Save Webhook]
        ↓
[Webhook Active ✅]
        ↓
[Receive notifications on Slack]
```

### Flow 3: Monitor Live Scraping

```
[Dashboard shows Active Job]
        ↓
[Click "View Details"]
        ↓
[Real-time Progress Modal]
├─ Progress: 45%
├─ Products found: 234
├─ Time elapsed: 2m 34s
└─ Live Logs streaming
        ↓
[Job completes]
        ↓
[Modal updates: "Completed ✅"]
        ↓
[Button: "View Results"]
        ↓
[Navigate to Data Browser with filter]
```

---

## 🖼️ Wireframes & Mockups

### Wireframe: Dashboard (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] EcomScraper Hub              [Dashboard][Scraper][Data][Webhooks]   │
│                                       [Settings][Logs]        [User ▼]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐                     │
│  │ 🎵 TikTok              │  │ 🛒 Shopee              │                     │
│  │ ┌──────────────────┐   │  │ ┌──────────────────┐   │                     │
│  │ │   1,234          │   │  │ │    567           │   │                     │
│  │ │   Total Jobs     │   │  │ │    Total Jobs    │   │                     │
│  │ └──────────────────┘   │  │ └──────────────────┘   │                     │
│  │ ↑ 12% vs yesterday     │  │ ↓ 5% vs yesterday      │                     │
│  └────────────────────────┘  └────────────────────────┘                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 📈 Scraping Activity (Last 24 Hours)                                   │ │
│  │                                                                        │ │
│  │  [Multi-line Chart: TikTok, Shopee, Lazada over time]                 │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌──────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ ⚡ Active Jobs (3)           │  │ 🔔 Recent Activities                │  │
│  │                              │  │                                     │  │
│  │ [Job cards with progress]    │  │ [Activity feed with timestamps]     │  │
│  │                              │  │                                     │  │
│  └──────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe: Mobile View

```
┌─────────────────────────────┐
│ ☰  EcomScraper Hub    👤    │
├─────────────────────────────┤
│                             │
│ 📊 Dashboard                │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🎵 TikTok               │ │
│ │ 1,234 Jobs              │ │
│ │ ↑ 12%                   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🛒 Shopee               │ │
│ │ 567 Jobs                │ │
│ │ ↓ 5%                    │ │
│ └─────────────────────────┘ │
│                             │
│ ⚡ Active Jobs (2)          │
│ ┌─────────────────────────┐ │
│ │ TikTok Shop             │ │
│ │ Progress: 45%           │ │
│ │ [View] [Stop]           │ │
│ └─────────────────────────┘ │
│                             │
│ 🔔 Recent Activities        │
│ • Job completed             │
│ • Rate limit warning        │
│                             │
│ [+ New Scrape]              │
│                             │
└─────────────────────────────┘
```

---

## 💻 Technical Stack Recommendations

### Frontend

#### Recommended Stack

**Option 1: Modern React Stack (แนะนำ)**
```
Framework: React 18+ with TypeScript
Build Tool: Vite
UI Library: Tailwind CSS + shadcn/ui
State Management: Zustand or React Query
Charts: Recharts or Chart.js
Real-time: Socket.io-client
HTTP Client: Axios
```

**Option 2: Next.js Full-Stack**
```
Framework: Next.js 14+ (App Router)
Styling: Tailwind CSS
UI Components: Radix UI + shadcn/ui
State: React Query + Zustand
API: Next.js API Routes
```

**Option 3: Vue.js Alternative**
```
Framework: Vue 3 + TypeScript
Build Tool: Vite
UI Library: Tailwind CSS + Nuxt UI
State Management: Pinia
Charts: Vue-chartjs
```

#### Key Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0",
    "react-hot-toast": "^2.4.0"
  }
}
```

### Project Structure

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
│   │   └── settings/
│   ├── pages/               # Page components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities
│   ├── services/            # API services
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript types
│   └── App.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 📅 Phase Implementation Plan

### Phase 2.5: UI Development (NEW - นอกเหนือจาก phase เดิม)

#### Timeline: 3-4 สัปดาห์

#### Week 1: Setup & Core Components

**Day 1-2: Project Setup**
- ✅ Initialize React + Vite + TypeScript project
- ✅ Setup Tailwind CSS + shadcn/ui
- ✅ Configure routing with React Router
- ✅ Setup API client with Axios
- ✅ Create base layout structure

**Day 3-5: Design System & Components**
- ✅ Implement Design System (colors, typography, spacing)
- ✅ Build core UI components:
  - Button variants
  - Input fields
  - Cards
  - Badges
  - Progress bars
  - Tables
  - Modals
- ✅ Create component documentation (Storybook optional)

**Day 6-7: Layout & Navigation**
- ✅ Build responsive layout (desktop + mobile)
- ✅ Implement top navigation
- ✅ Implement sidebar (collapsible)
- ✅ Add breadcrumbs
- ✅ Create mobile menu

#### Week 2: Core Pages Implementation

**Day 8-10: Dashboard Page**
- ✅ Platform stats cards with real data
- ✅ Activity chart (Recharts integration)
- ✅ Active jobs widget
- ✅ Recent activities feed
- ✅ Quick actions section
- ✅ Real-time updates with Socket.io

**Day 11-14: Scraper Pages**
- ✅ New Scraping Job wizard (multi-step form)
- ✅ Platform selector
- ✅ URL input/batch upload
- ✅ Advanced options panel
- ✅ Schedule configuration
- ✅ Active jobs list with real-time progress
- ✅ Job history table

#### Week 3: Data Management & Advanced Features

**Day 15-17: Data Browser**
- ✅ Product list with filters
- ✅ Search functionality
- ✅ Product detail modal
- ✅ Export functionality (JSON, CSV)
- ✅ Pagination
- ✅ Bulk actions (select, delete)

**Day 18-21: Webhooks & Settings**
- ✅ Webhook list page
- ✅ Add/Edit webhook modal
- ✅ Test webhook functionality
- ✅ Webhook logs viewer
- ✅ Settings pages:
  - Authentication (cookies management)
  - Rate limiting configuration
  - Proxy settings
  - API keys management

#### Week 4: Polish & Testing

**Day 22-24: Logs & Monitoring**
- ✅ Real-time logs viewer
- ✅ Log filtering and search
- ✅ System health dashboard
- ✅ Performance metrics

**Day 25-28: Final Polish**
- ✅ Responsive design testing (mobile, tablet, desktop)
- ✅ Cross-browser testing
- ✅ Error handling & loading states
- ✅ Toast notifications
- ✅ Loading skeletons
- ✅ Empty states
- ✅ Dark mode (optional)
- ✅ Performance optimization
- ✅ Accessibility (WCAG 2.1)
- ✅ User testing & bug fixes

---

## 🚀 Next Steps

### Immediate Actions (ทำเลยตอนนี้)

#### 1. **Choose Tech Stack** (วันนี้)
- [ ] ตัดสินใจเลือก Frontend Framework (React แนะนำ)
- [ ] เลือก UI Library (Tailwind + shadcn/ui แนะนำ)
- [ ] ตั้งค่า project ใหม่

#### 2. **Design System** (วันนี้ - พรุ่งนี้)
- [ ] สร้าง `design-system.md` (colors, typography, spacing)
- [ ] สร้าง Figma mockups (optional แต่แนะนำ)
- [ ] Build core components (Button, Input, Card, etc.)

#### 3. **API Integration** (2-3 วัน)
- [ ] สร้าง API service layer
- [ ] Test all endpoints
- [ ] Setup React Query for data fetching
- [ ] Implement error handling

#### 4. **Start with Dashboard** (3-4 วัน)
- [ ] Build dashboard layout
- [ ] Connect to real API
- [ ] Add real-time updates
- [ ] Test with real data

### Medium-Term (2-3 สัปดาห์)

#### 5. **Complete Core Pages**
- [ ] Scraper pages (New Job, Active Jobs, History)
- [ ] Data Browser (Products, Shops, Reviews)
- [ ] Webhooks (List, Add, Edit, Test)

#### 6. **Settings & Configuration**
- [ ] Authentication pages
- [ ] Rate limiting settings
- [ ] Proxy configuration
- [ ] API keys management

### Long-Term (1 เดือน+)

#### 7. **Advanced Features**
- [ ] Real-time charts & monitoring
- [ ] Advanced filters & search
- [ ] Batch operations
- [ ] Export large datasets
- [ ] Scheduled scraping UI
- [ ] Notification preferences

#### 8. **Polish & Optimization**
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] User onboarding flow

### Future Enhancements

#### 9. **Nice-to-Have Features**
- [ ] **AI-Powered Insights**: แนะนำ trending products
- [ ] **Price Tracking**: ติดตามราคาแบบ real-time
- [ ] **Competitor Analysis**: วิเคราะห์คู่แข่ง
- [ ] **Browser Extension**: Chrome extension สำหรับ quick scrape
- [ ] **Mobile App**: React Native app
- [ ] **Collaborative Features**: Team management, shared webhooks
- [ ] **Advanced Analytics**: Custom reports, dashboards
- [ ] **Automated Testing**: E2E tests with Playwright

---

## 📝 Recommendations & Best Practices

### Development

#### 1. **Start Small, Iterate Fast**
- สร้าง MVP ก่อน (Dashboard + New Scrape + Data Browser)
- Test กับ real users เร็วๆ
- Iterate based on feedback

#### 2. **Component-First Approach**
- สร้าง reusable components
- Document components
- Use Storybook (optional but recommended)

#### 3. **API-First Development**
- Design API contracts first
- Use mock data during development
- Test APIs thoroughly before UI integration

#### 4. **Real-Time is Key**
- Use WebSockets for real-time updates
- Show progress indicators
- Keep users informed

### Design

#### 1. **User-Centric Design**
- Think about user workflows
- Minimize clicks
- Provide keyboard shortcuts
- Add tooltips for complex features

#### 2. **Responsive Design**
- Mobile-first approach
- Test on real devices
- Consider tablet layouts

#### 3. **Performance**
- Lazy load components
- Optimize images
- Use pagination for large datasets
- Cache API responses

#### 4. **Accessibility**
- Use semantic HTML
- Add ARIA labels
- Keyboard navigation
- Screen reader support

### Testing

#### 1. **Test Coverage**
- Unit tests for utilities
- Integration tests for API calls
- E2E tests for critical flows
- Visual regression tests

#### 2. **User Testing**
- Get feedback early
- Watch users interact with the UI
- Track analytics
- A/B test features

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

#### User Experience
- Time to complete first scraping job: < 2 minutes
- Average page load time: < 1 second
- Mobile usability score: > 90/100

#### Technical
- API response time: < 500ms (p95)
- Frontend bundle size: < 500KB (gzipped)
- Lighthouse score: > 90

#### Business
- User retention: > 70% after 7 days
- Feature adoption: > 50% for core features
- Error rate: < 1%

---

## 📚 Resources & References

### Design Inspiration
- [Tailwind UI](https://tailwindui.com) - UI components
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Refactoring UI](https://refactoringui.com) - Design tips
- [Dribbble](https://dribbble.com) - Dashboard designs

### Technical Documentation
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [React Query](https://tanstack.com/query)

### Tools
- [Figma](https://figma.com) - Design mockups
- [Excalidraw](https://excalidraw.com) - Wireframes
- [Coolors](https://coolors.co) - Color palettes
- [Favicon Generator](https://realfavicongenerator.net)

---

## 🙋 Questions to Discuss with Developer

### Before Starting
1. ต้องการ dark mode ไหม?
2. ต้องการ mobile app ด้วยไหม?
3. มี brand colors หรือ logo ที่ต้องใช้ไหม?
4. ต้องการ authentication แบบไหน? (Username/Password, OAuth, etc.)
5. มี budget สำหรับ paid UI libraries ไหม?

### During Development
1. Real-time updates ต้องการความเร็วแค่ไหน? (1s, 5s, 10s?)
2. ข้อมูลเยอะแค่ไหนที่ต้อง handle? (pagination size, etc.)
3. Export ต้องการ format อะไรบ้าง? (CSV, JSON, Excel?)
4. Notification ต้องการแบบไหน? (Toast, Browser notifications, Email?)
5. มี third-party integrations อื่นที่ต้องรองรับไหม?

---

## 📄 Appendix

### A. Platform-Specific Considerations

#### TikTok
- Rate limiting aggressive → Show warnings clearly
- Cookie expiration → Remind users to refresh
- Content varies by region → Allow region selection

#### Shopee
- Different domains per country → Support multiple domains
- Flash sales → Handle time-sensitive scraping
- Seller verification → Show verification badges

#### Lazada
- Similar to Shopee
- Different API structure → Normalize data well
- Multi-currency → Handle currency conversion

### B. Common User Scenarios

#### Scenario 1: E-commerce Manager
"I need to track competitor prices daily for 50 products"
→ Solution: Scheduled scraping + Price change alerts

#### Scenario 2: Market Researcher
"I want to analyze trending products across all platforms"
→ Solution: Dashboard with trending products + Export data

#### Scenario 3: Developer
"I need to integrate this data into my existing system"
→ Solution: Webhooks + Well-documented API

---

## ✅ Checklist: Ready to Start Development?

### Phase 2.5 Kickoff Checklist

- [ ] ✅ UI Design Brief reviewed and approved
- [ ] ✅ Tech stack selected (React/Vue/Next.js)
- [ ] ✅ Design system colors & typography defined
- [ ] ✅ Project folder structure planned
- [ ] ✅ Development environment setup
- [ ] ✅ Core components list created
- [ ] ✅ API endpoints documented and tested
- [ ] ✅ Git repository ready for frontend
- [ ] ✅ Dependencies list reviewed
- [ ] ✅ Timeline and milestones agreed

### Optional (Recommended)

- [ ] Figma mockups created
- [ ] User personas validated with stakeholders
- [ ] Component library (Storybook) setup plan
- [ ] CI/CD pipeline for frontend
- [ ] Testing strategy defined

---

## 🎉 สรุป

เอกสาร UI Design Brief นี้ครอบคลุม:

✅ **ภาพรวมโครงการ** - เข้าใจระบบและเป้าหมาย
✅ **User Personas** - รู้ว่าใครจะใช้ระบบ
✅ **โครงสร้าง UI** - Navigation และ Layout
✅ **รายละเอียดหน้าจอ** - Wireframes แต่ละหน้า
✅ **Component Library** - Design system และ components
✅ **User Flows** - เข้าใจวิธีใช้งาน
✅ **Tech Stack** - เลือก technology
✅ **Implementation Plan** - Phase 2.5 roadmap
✅ **Next Steps** - รู้ว่าต้องทำอะไรต่อ

### พร้อมเริ่มงานได้เลย! 🚀

หากมีคำถามหรือต้องการ clarification เพิ่มเติม:
- ดู [English version](./UI-DESIGN-BRIEF-EN.md) สำหรับรายละเอียดเพิ่มเติม
- ตรวจสอบ [Phase 2 Implementation Plan](../PHASE2_PLAN.md)
- Review API endpoints ที่ [API Reference](../docs/api-reference.md)

**ขอให้พัฒนา UI ที่สวยงามและใช้งานง่าย! 💝**

---

*Document Version: 1.0*
*Last Updated: 2024-03-28*
*Author: Senior UI Designer @ EcomScraper Hub*
