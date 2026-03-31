# 📋 Phases 2-7: Platform Scrapers & Advanced Features — TODO Checklists

---

## Phase 2: TikTok Shop Scraper (1.5 weeks)

> **Goal**: Extend existing TikTok adapter to support e-commerce product/shop data.

### 2.1 — TikTok Shop Product Scraping

- [ ] Create `src/platforms/tiktok/TikTokShopScraper.js`
  - [ ] Product page navigation with anti-detection
  - [ ] Extract: name, price, description, images, specs
  - [ ] Extract: variants (sizes, colors, etc.)
  - [ ] Extract: stock status, sold count
  - [ ] Extract: shipping info
  - [ ] Extract: seller/shop info from product page
- [ ] Create `src/platforms/tiktok/selectors.js`
  - [ ] Product page selectors (DOM-based)
  - [ ] Shop page selectors
  - [ ] Search results selectors
  - [ ] Handle selector versioning (TikTok updates frequently)
- [ ] URL parser — extract product/shop IDs from TikTok URLs
- [ ] Handle dynamic loading (scroll, lazy load images)
- [ ] Handle login-gated content detection
- [ ] Screenshot capture on extraction for debugging

### 2.2 — TikTok Shop Scraping

- [ ] Create `src/platforms/tiktok/TikTokShopScraper.js` (shop-level)
  - [ ] Shop overview: name, avatar, rating, follower count
  - [ ] Product listing pagination
  - [ ] Shop categories
  - [ ] Auto-detect shop URL format
- [ ] Batch product scraping from shop listing

### 2.3 — TikTok Search

- [ ] Add search functionality to TikTok adapter
  - [ ] Search by keyword
  - [ ] Parse search result items
  - [ ] Pagination support
  - [ ] Sort options (relevance, price, sales)

### 2.4 — TikTok Review Scraping

- [ ] Extract product reviews
  - [ ] Rating, comment text, images
  - [ ] Reviewer info
  - [ ] Review date
  - [ ] Pagination handling

### 2.5 — TikTok Live (Migration)

- [ ] Migrate existing live scraping to `src/platforms/tiktok/TikTokLiveScraper.js`
  - [ ] Keep full backward compatibility
  - [ ] Integrate with new EventBus
  - [ ] Store comments in database (not just JSON file)
  - [ ] Preserve AI webhook integration

### 2.6 — Testing

- [ ] Test scraping 5+ TikTok Shop products
- [ ] Verify data accuracy against actual pages
- [ ] Test anti-detection (no blocks after 50+requests)
- [ ] Test live scraping still works through new architecture
- [ ] Integration test: scrape → normalize → save to DB → query via API

---

## Phase 3: Shopee Scraper (2 weeks)

> **Goal**: Full Shopee Thailand scraping — products, shops, search, reviews, flash sales.

### 3.1 — Shopee Adapter Setup

- [ ] Create `src/platforms/shopee/ShopeeAdapter.js`
  - [ ] Implement `BasePlatformAdapter` interface
  - [ ] Platform config & rate limits
  - [ ] Shopee-specific anti-detection
  - [ ] SPC token handling
- [ ] Create `src/platforms/shopee/config.js`
  - [ ] Base URLs (shopee.co.th)
  - [ ] API endpoints
  - [ ] Rate limits
  - [ ] Regional settings
- [ ] Create `src/platforms/shopee/selectors.js`
  - [ ] Product page selectors
  - [ ] Search result selectors
  - [ ] Review selectors
  - [ ] Flash sale selectors

### 3.2 — Shopee API Interception Layer

- [ ] Create `src/platforms/shopee/ShopeeAPI.js`
  - [ ] Playwright route interception for `api/v4/*`
  - [ ] Response parser for Shopee API format
  - [ ] Handle API authentication headers
  - [ ] Handle SPC EC cookie for authenticated requests
  - [ ] Retry on rate limit (HTTP 429)
  - [ ] Cache intercepted responses

### 3.3 — Shopee Product Scraper

- [ ] Create `src/platforms/shopee/ShopeeProductScraper.js`
  - [ ] Parse product URL → extract `shopId` + `itemId`
  - [ ] Navigate to product page
  - [ ] Intercept `api/v4/item/get` response
  - [ ] Extract all product fields:
    - [ ] Name, description
    - [ ] Price (current, before-discount, range for multi-variant)
    - [ ] Images (all, not just thumbnail)
    - [ ] Variants (tier variations: color × size)
    - [ ] Stock per variant
    - [ ] Sold count, rating overview
    - [ ] Shipping options & fees
    - [ ] Shop info (embedded in product API)
    - [ ] Category breadcrumb
    - [ ] Product attributes/specs
  - [ ] Normalize to unified Product schema
  - [ ] Handle "item not found" / "sold out" cases

### 3.4 — Shopee Shop Scraper

- [ ] Create `src/platforms/shopee/ShopeeShopScraper.js`
  - [ ] Parse shop URL → extract shop identifier
  - [ ] Intercept `api/v4/shop/get` response
  - [ ] Extract: shop name, logo, location, rating, follower count
  - [ ] Extract: product listing with pagination
    - [ ] Intercept `api/v4/shop/search_items`
    - [ ] Handle sort options (popular, latest, price, sales)
  - [ ] Extract: shop categories
  - [ ] Batch mode: scrape all products in a shop

### 3.5 — Shopee Search Scraper

- [ ] Create `src/platforms/shopee/ShopeeSearchScraper.js`
  - [ ] Accept keyword + filters (price range, rating, location, etc.)
  - [ ] Navigate to search URL
  - [ ] Intercept `api/v4/search/search_items` response
  - [ ] Extract items with basic info (thumbnail data)
  - [ ] Pagination: scrape multiple pages
  - [ ] Sort support: relevance, latest, price, sales
  - [ ] Option to deep-scrape each result (full product data)

### 3.6 — Shopee Review Scraper

- [ ] Create `src/platforms/shopee/ShopeeReviewScraper.js`
  - [ ] Accept product URL or productId+shopId
  - [ ] Intercept `api/v4/item/get_ratings` response
  - [ ] Extract:
    - [ ] Rating (1-5), comment text
    - [ ] Review images/videos
    - [ ] Reviewer username
    - [ ] Variant purchased
    - [ ] Review date
    - [ ] Helpful count (like count)
    - [ ] Seller response
  - [ ] Pagination: fetch all reviews
  - [ ] Filter by rating (e.g., only 1-star)
  - [ ] Normalize to unified Review schema

### 3.7 — Shopee Flash Sale Monitor

- [ ] Create `src/platforms/shopee/ShopeeFlashSaleScraper.js`
  - [ ] Navigate to flash sale page
  - [ ] Extract:
    - [ ] Flash sale time slots
    - [ ] Products in each slot
    - [ ] Original vs flash sale price
    - [ ] Stock/sold ratio
    - [ ] Time remaining
  - [ ] Monitor mode: poll for new flash sale batches
  - [ ] Alert integration: notify when tracked products appear

### 3.8 — Shopee Auth

- [ ] Create `src/platforms/shopee/ShopeeAuth.js`
  - [ ] Cookie import (from browser)
  - [ ] SPC token extraction
  - [ ] Session validation
  - [ ] Auto-refresh expired sessions
  - [ ] Support manual login flow (open browser → save cookies)

### 3.9 — Testing

- [ ] Test product scraping: 10+ products across categories
- [ ] Test shop scraping: 3+ shops with pagination
- [ ] Test search: 5+ keywords with different filters
- [ ] Test review scraping: full review extraction for 5+ products
- [ ] Test flash sale monitoring
- [ ] Anti-detection: 100+ requests without CAPTCHA/block
- [ ] Data accuracy: compare scraped data vs actual page values
- [ ] Integration: full pipeline (scrape → normalize → DB → API → UI)

---

## Phase 4: Lazada Scraper (2 weeks)

> **Goal**: Full Lazada Thailand scraping capability.

### 4.1 — Lazada Adapter Setup

- [ ] Create `src/platforms/lazada/LazadaAdapter.js`
  - [ ] Implement `BasePlatformAdapter` interface
  - [ ] Lazada-specific anti-detection (Alibaba anti-fraud)
  - [ ] Session warm-up strategy
- [ ] Create `src/platforms/lazada/config.js`
- [ ] Create `src/platforms/lazada/selectors.js`

### 4.2 — Lazada Data Extraction Strategy

- [ ] Create `src/platforms/lazada/LazadaAPI.js`
  - [ ] `__INITIAL_STATE__` JSON extraction from `<script>` tags
  - [ ] `__moduleData__` parsing
  - [ ] Fallback: DOM scraping if JSON not available
  - [ ] API interception for dynamic content
  - [ ] Handle encrypted/obfuscated data

### 4.3 — Lazada Product Scraper

- [ ] Create `src/platforms/lazada/LazadaProductScraper.js`
  - [ ] Parse product URL → extract itemId, skuId
  - [ ] Navigate & extract embedded JSON
  - [ ] Extract all fields:
    - [ ] Name, description (HTML content)
    - [ ] Price, original price, discount
    - [ ] Images, video
    - [ ] Variants (SKUs) — complex multi-tier
    - [ ] Stock per SKU
    - [ ] Rating, review count, sold count
    - [ ] Shipping info, free shipping badge
    - [ ] Seller info
    - [ ] Product specifications
    - [ ] LazMall / official brand flag
  - [ ] Normalize to unified schema

### 4.4 — Lazada Shop Scraper

- [ ] Create `src/platforms/lazada/LazadaShopScraper.js`
  - [ ] Shop overview extraction
  - [ ] Product listing with pagination
  - [ ] Shop rating & stats
  - [ ] LazMall detection
  - [ ] Batch product scraping

### 4.5 — Lazada Search Scraper

- [ ] Create `src/platforms/lazada/LazadaSearchScraper.js`
  - [ ] Keyword search with filters
  - [ ] Sorting (best match, price, rating)
  - [ ] Category filter
  - [ ] Price range filter
  - [ ] LazMall only filter
  - [ ] Pagination
  - [ ] Deep-scrape option

### 4.6 — Lazada Review Scraper

- [ ] Create `src/platforms/lazada/LazadaReviewScraper.js`
  - [ ] Review extraction per product
  - [ ] Rating, text, images
  - [ ] Reviewer info
  - [ ] Filter by rating
  - [ ] Pagination

### 4.7 — Lazada Auth

- [ ] Create `src/platforms/lazada/LazadaAuth.js`
  - [ ] Cookie management
  - [ ] Session handling
  - [ ] CAPTCHA detection & notification

### 4.8 — CAPTCHA Handling

- [ ] Implement slide CAPTCHA detection
  - [ ] Visual detection: screenshot comparison
  - [ ] Notification to user when manual solve needed
  - [ ] Optional: integrate CAPTCHA solving service API
  - [ ] Retry after CAPTCHA solved

### 4.9 — Testing

- [ ] Test product scraping: 10+ products (LazMall + local sellers)
- [ ] Test shop scraping: 3+ shops
- [ ] Test search: multiple keywords
- [ ] Test review extraction
- [ ] Anti-detection: extended sessions without CAPTCHA
- [ ] Data accuracy verification
- [ ] Integration testing

---

## Phase 5: Other Platforms (1.5 weeks)

> **Goal**: Add support for additional platforms, prioritizing Thai market.

### 5.1 — JD Central (Thailand)

- [ ] Create `src/platforms/jdcentral/JDCentralAdapter.js`
- [ ] Product scraping
- [ ] Search functionality
- [ ] Shop scraping
- [ ] Review extraction
- [ ] Testing (5+ products)

### 5.2 — NocNoc (Thailand Home & Garden)

- [ ] Create `src/platforms/nocnoc/NocNocAdapter.js`
- [ ] Product scraping
- [ ] Search functionality
- [ ] Category browsing
- [ ] Review extraction
- [ ] Testing

### 5.3 — Amazon (International)

- [ ] Create `src/platforms/amazon/AmazonAdapter.js`
- [ ] Product scraping (basic)
- [ ] Search functionality
- [ ] Review extraction
- [ ] Price conversion (USD → THB)
- [ ] Testing

### 5.4 — AliExpress (Supplier/Wholesale)

- [ ] Create `src/platforms/aliexpress/AliExpressAdapter.js`
- [ ] Product scraping (basic)
- [ ] Search functionality
- [ ] Price + shipping cost extraction
- [ ] Testing

### 5.5 — Platform Auto-Detection

- [ ] URL pattern matching to auto-detect platform
  - [ ] `shopee.co.th` → Shopee adapter
  - [ ] `lazada.co.th` → Lazada adapter
  - [ ] `tiktok.com` → TikTok adapter
  - [ ] etc.
- [ ] "Paste any URL" feature in UI

### 5.6 — Testing

- [ ] Cross-platform: same product type across 3+ platforms
- [ ] Platform registry: verify all adapters load correctly
- [ ] Auto-detection: test 20+ URLs across all platforms

---

## Phase 6: Advanced Features (2 weeks)

> **Goal**: Production-ready features — scheduling, proxy management, alerts, exports, AI.

### 6.1 — Job Scheduling System

- [ ] Create `src/services/SchedulerService.js`
  - [ ] Cron expression parser (node-cron)
  - [ ] Schedule CRUD operations
  - [ ] Auto-start on server boot
  - [ ] Job queue with concurrency limit
  - [ ] Schedule enable/disable toggle
  - [ ] Next run time calculation
  - [ ] History tracking
- [ ] Create `src/api/routes/schedule.routes.js`
  - [ ] `GET /api/schedules` — List all
  - [ ] `POST /api/schedules` — Create
  - [ ] `PUT /api/schedules/:id` — Update
  - [ ] `DELETE /api/schedules/:id` — Delete
  - [ ] `POST /api/schedules/:id/run` — Run now
- [ ] Schedule presets:
  - [ ] Daily price check
  - [ ] Hourly flash sale monitor
  - [ ] Weekly competitor analysis

### 6.2 — Proxy Management UI & Logic

- [ ] Enhance `src/core/ProxyManager.js`
  - [ ] Proxy import (bulk add from text list)
  - [ ] Automatic health checking (every 5 min)
  - [ ] Latency measurement
  - [ ] Geographic location detection
  - [ ] Sticky session support
  - [ ] Proxy authentication (user:pass)
- [ ] Create `src/api/routes/proxy.routes.js`
  - [ ] CRUD endpoints for proxy pool
  - [ ] Test endpoint
  - [ ] Stats endpoint

### 6.3 — Price Tracking & Alerts

- [ ] Create `src/services/NotificationService.js`
  - [ ] Alert type definitions:
    - [ ] Price drop (absolute or percentage threshold)
    - [ ] Price increase
    - [ ] Out of stock
    - [ ] Back in stock
    - [ ] New review (optional: negative only)
    - [ ] Rating change
    - [ ] Flash sale appearance
  - [ ] Notification channels:
    - [ ] Discord webhook
    - [ ] Telegram bot
    - [ ] Slack webhook
    - [ ] Custom webhook
    - [ ] In-app notification
  - [ ] Alert history log
  - [ ] Cooldown (prevent spam)
- [ ] Create `src/api/routes/alert.routes.js`
- [ ] Price change detection in Product model
  - [ ] Automatic `price_history` recording on price change
  - [ ] Comparison with last known price

### 6.4 — Cross-Platform Comparison

- [ ] Create `src/services/ComparisonService.js`
  - [ ] Match products across platforms (by name/keywords)
  - [ ] Price comparison table
  - [ ] Cheapest option finder
  - [ ] Shipping cost inclusion
  - [ ] Compare specs/ratings
- [ ] Create `POST /api/products/compare` endpoint

### 6.5 — Export Pipeline Enhancement

- [ ] Enhance `src/services/ExportService.js`
  - [ ] Excel (.xlsx) export
    - [ ] Add `exceljs` dependency
    - [ ] Multi-sheet support (products, reviews, prices separate sheets)
    - [ ] Formatting (headers, column widths, colors)
    - [ ] Embedded thumbnails (optional)
  - [ ] Google Sheets export
    - [ ] Google Sheets API integration
    - [ ] Auto-create spreadsheet
    - [ ] Append mode (add new data without overwriting)
  - [ ] Filtered export (date range, platform, category)
  - [ ] Scheduled export (daily/weekly report)
- [ ] Create `src/api/routes/export.routes.js`

### 6.6 — AI Integration Enhancement

- [ ] Migrate AI webhook to `src/services/AIReplyService.js`
- [ ] Create `src/services/AIAnalysisService.js`
  - [ ] Review sentiment analysis
    - [ ] Positive/negative/neutral classification
    - [ ] Key themes extraction
    - [ ] Common complaints detection
  - [ ] Product summarization
    - [ ] Generate concise product descriptions from scraped data
  - [ ] Pricing recommendations
    - [ ] Based on competitor pricing data
  - [ ] Support multiple AI providers:
    - [ ] OpenAI API
    - [ ] Google Gemini API
    - [ ] Local model (Ollama)
    - [ ] Mock rules (existing)

### 6.7 — Caching Layer

- [ ] Create `src/services/CacheService.js`
  - [ ] In-memory cache with TTL
  - [ ] Cache frequently accessed data (product listings, stats)
  - [ ] Cache invalidation on data update
  - [ ] Optional Redis integration (for multi-instance)

### 6.8 — Testing

- [ ] Test scheduling: create/run/cancel jobs
- [ ] Test proxy rotation with 3+ proxies
- [ ] Test price tracking alerts (simulate price change)
- [ ] Test all export formats
- [ ] Test cross-platform comparison
- [ ] Performance test: 1000+ products query

---

## Phase 7: Dashboard & Analytics (2 weeks)

> **Goal**: Build a comprehensive, beautiful web dashboard.

### 7.1 — UI Framework & Layout

- [ ] Design dashboard layout (sidebar + main content)
- [ ] Create `public/js/router.js` — Client-side SPA routing
- [ ] Create `public/js/state.js` — Centralized state management
- [ ] Create `public/js/api.js` — API client wrapper
- [ ] Create layout components:
  - [ ] `Sidebar.js` — Navigation sidebar with platform icons
  - [ ] `Header.js` — Top bar with search, notifications, settings
  - [ ] `Footer.js` — Status bar, version info
- [ ] Create shared UI components:
  - [ ] `Modal.js` — Reusable modal
  - [ ] `Toast.js` — Notification toasts
  - [ ] `Table.js` — Sortable, filterable data table
  - [ ] `Pagination.js` — Paginated data display
  - [ ] `Loading.js` — Skeleton loaders, spinners
  - [ ] `Chart.js` — Chart wrapper (Chart.js or ApexCharts)
- [ ] Responsive design (mobile-friendly)
- [ ] Dark mode support
- [ ] Theme system (color scheme customization)

### 7.2 — Dashboard Overview Page

- [ ] Create `DashboardOverview.js`
  - [ ] Platform status cards (connected/disconnected)
  - [ ] Quick stats: total products, reviews, active jobs
  - [ ] Recent scraping activity timeline
  - [ ] Active jobs progress bars
  - [ ] Quick action buttons (scrape product, start monitor)
- [ ] Create `PlatformCards.js` — Per-platform summary
- [ ] Create `RecentJobs.js` — Last 10 jobs with status
- [ ] Create `QuickStats.js` — Numbers dashboard

### 7.3 — Scraper Control Page

- [ ] Create `ScraperConfig.js` (refactor existing ConfigForm)
  - [ ] Platform selector with icons
  - [ ] Scraping type selector (product, shop, search, review)
  - [ ] URL input with auto-detection
  - [ ] Platform-specific config options
  - [ ] Start/stop controls
  - [ ] Live progress view
- [ ] Create `PlatformSelector.js` — Visual platform picker
- [ ] Create `LiveMonitor.js` — Real-time scraping progress
- [ ] Create `JobManager.js` — Manage running/queued/completed jobs

### 7.4 — Product Explorer Page

- [ ] Create `ProductTable.js`
  - [ ] Tabular product view with thumbnails
  - [ ] Sort by: price, rating, reviews, date, platform
  - [ ] Filter by: platform, category, price range, stock status
  - [ ] Search by product name
  - [ ] Bulk actions (export, delete, compare)
  - [ ] Infinite scroll or pagination
- [ ] Create `ProductDetail.js`
  - [ ] Full product info display
  - [ ] Image gallery
  - [ ] Variant breakdown
  - [ ] Price history chart
  - [ ] Review summary
  - [ ] Links to original page

### 7.5 — Price Tracker Page

- [ ] Create `PriceTracker.js`
  - [ ] Add product to tracking list
  - [ ] Interactive price history chart (Chart.js)
  - [ ] Multi-product comparison on same chart
  - [ ] Alert configuration per product
  - [ ] Price change timeline
- [ ] Create `PriceChart.js` — Reusable price chart component
- [ ] Create `AlertConfig.js` — Alert rule builder

### 7.6 — Review Analysis Page

- [ ] Create `ReviewViewer.js`
  - [ ] Review list with filters
  - [ ] Rating distribution chart (bar chart)
  - [ ] Sentiment breakdown (pie chart)
  - [ ] Word cloud of common keywords
  - [ ] Review image gallery
  - [ ] Export reviews
- [ ] Create `ReviewStats.js` — Review statistics dashboard

### 7.7 — Data Export Page

- [ ] Create `DataExporter.js`
  - [ ] Data type selector (products, reviews, prices, etc.)
  - [ ] Platform filter
  - [ ] Date range filter
  - [ ] Format selector (JSON, CSV, Excel, Google Sheets)
  - [ ] Preview data before export
  - [ ] Download button
  - [ ] Export history

### 7.8 — Settings Pages

- [ ] Create `ProxySettings.js` — Proxy pool management UI
- [ ] Create `NotificationSettings.js` — Webhook/notification config
- [ ] Create `ScheduleSettings.js` — Recurring job setup UI
- [ ] Create `PlatformAuth.js` — Per-platform auth/cookie management
- [ ] Create `GeneralSettings.js` — App-wide settings

### 7.9 — Analytics Engine

- [ ] Create `src/services/AnalyticsService.js`
  - [ ] Overview stats aggregation
  - [ ] Price trend calculations
  - [ ] Platform comparison metrics
  - [ ] Top products ranking
  - [ ] Scraping efficiency metrics
- [ ] Create `src/api/routes/analytics.routes.js`
  - [ ] `GET /api/analytics/overview`
  - [ ] `GET /api/analytics/price-trends`
  - [ ] `GET /api/analytics/platform-stats`
  - [ ] `GET /api/analytics/top-products`

### 7.10 — Polish & Final Testing

- [ ] Cross-browser testing (Chrome, Firefox, Edge)
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Performance optimization (lazy loading, virtual scrolling)
- [ ] Accessibility review (keyboard navigation, ARIA labels)
- [ ] Error state handling (empty state, error state, loading state)
- [ ] End-to-end walkthrough test
- [ ] User experience review

---

## 🏁 Phase Completion Checklist

| Phase | Status | Verified |
|-------|--------|----------|
| Phase 1: Foundation | ⬜ | ⬜ |
| Phase 2: TikTok Shop | ⬜ | ⬜ |
| Phase 3: Shopee | ⬜ | ⬜ |
| Phase 4: Lazada | ⬜ | ⬜ |
| Phase 5: Others | ⬜ | ⬜ |
| Phase 6: Advanced | ⬜ | ⬜ |
| Phase 7: Dashboard | ⬜ | ⬜ |

---

> [!TIP]
> แต่ละ Phase สามารถแยกทำเป็นอิสระได้หลังจาก Phase 1 เสร็จ  
> แนะนำให้ส่งไฟล์แผนนี้ให้ AI ตัวอื่นพร้อมระบุ Phase ที่ต้องการให้ทำ
