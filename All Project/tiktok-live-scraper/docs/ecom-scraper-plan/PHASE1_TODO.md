# 📋 Phase 1: Foundation & Refactoring — TODO Checklist

> **Goal**: Decompose the monolithic codebase into a modular, plugin-based architecture.
> **Estimated**: 2 weeks

---

## 1.1 — Project Setup & Configuration

- [ ] Rename/restructure project (if approved by user)
- [ ] Update `package.json` — new name, description, scripts
- [ ] Create `src/` directory structure as defined in architecture
- [ ] Add new dependencies:
  - [ ] `better-sqlite3` (SQLite driver)
  - [ ] `uuid` (unique IDs)
  - [ ] `winston` or `pino` (structured logging)
  - [ ] `node-cron` (scheduling — prep for Phase 6)
  - [ ] `dotenv` (environment config)
  - [ ] `joi` or `zod` (validation)
- [ ] Create `.env.example` with all config keys
- [ ] Create `src/config/app.config.js` — centralized config loader
- [ ] Create `src/config/database.config.js`
- [ ] Create `src/config/platforms.config.js`

---

## 1.2 — Core Engine

- [ ] Create `src/core/EventBus.js`
  - [ ] Node.js EventEmitter-based
  - [ ] Typed events: `scraper:started`, `scraper:progress`, `scraper:completed`, `scraper:error`
  - [ ] `product:scraped`, `review:scraped`, `price:changed`
  - [ ] Wildcard support for debugging
- [ ] Create `src/core/ScraperEngine.js`
  - [ ] Job lifecycle: create → queue → start → progress → complete/fail
  - [ ] Multi-job support (run multiple scrapers concurrently)
  - [ ] Job state management
  - [ ] Integration with EventBus
- [ ] Create `src/core/BrowserManager.js`
  - [ ] Browser pool management (reuse contexts)
  - [ ] Playwright launch/close lifecycle
  - [ ] Context isolation per job
  - [ ] Headless/headful toggle
  - [ ] Chrome profile support (from existing code)
  - [ ] StorageState support (from existing code)
- [ ] Create `src/core/RetryStrategy.js`
  - [ ] Exponential backoff
  - [ ] Max retries config
  - [ ] Circuit breaker pattern
  - [ ] Per-error-type retry rules
- [ ] Create `src/core/RateLimiter.js`
  - [ ] Per-platform rate limiting
  - [ ] Request counting
  - [ ] Cooldown enforcement

---

## 1.3 — Platform Adapter System

- [ ] Create `src/platforms/BasePlatformAdapter.js`
  - [ ] Abstract methods: `scrapeProduct`, `scrapeShop`, `scrapeSearch`, `scrapeReviews`
  - [ ] Lifecycle: `initialize`, `authenticate`, `destroy`
  - [ ] `supportedFeatures` getter
  - [ ] `normalizeProduct`, `normalizeReview`, `normalizeShop` methods
  - [ ] Rate limit integration
  - [ ] Selector registry pattern
- [ ] Create `src/platforms/PlatformRegistry.js`
  - [ ] Platform registration/discovery
  - [ ] `getAll()`, `get(id)`, `getEnabled()`
  - [ ] Auto-load platform adapters from filesystem
- [ ] Migrate TikTok code to `src/platforms/tiktok/TikTokAdapter.js`
  - [ ] Implement `BasePlatformAdapter` interface
  - [ ] Move live scraping logic from `scraper_wrapper.js`
  - [ ] Move auth logic (cookies, storage state, Chrome profile)
  - [ ] Create `src/platforms/tiktok/selectors.js`
  - [ ] Create `src/platforms/tiktok/config.js`
  - [ ] Ensure backward compatibility with existing features

---

## 1.4 — Database Layer

- [ ] Create `src/data/Database.js`
  - [ ] SQLite connection manager
  - [ ] Migration runner
  - [ ] Query builder helpers
  - [ ] Transaction support
- [ ] Create migrations:
  - [ ] `001_initial.js` — platforms, scraping_jobs tables
  - [ ] `002_products.js` — products, shops, categories tables
  - [ ] `003_reviews.js` — reviews, price_history tables
  - [ ] `004_schedules.js` — schedules, alerts tables
- [ ] Create `src/data/models/Product.js` — Product model with CRUD
- [ ] Create `src/data/models/Shop.js` — Shop model with CRUD
- [ ] Create `src/data/models/Review.js` — Review model with CRUD
- [ ] Create `src/data/models/ScrapingJob.js` — Job model with state machine
- [ ] Create `src/data/models/PriceHistory.js` — Price tracking model
- [ ] Create `src/data/models/Comment.js` — Migrate existing comment storage
- [ ] Create repository layer:
  - [ ] `src/data/repositories/ProductRepository.js`
  - [ ] `src/data/repositories/ShopRepository.js`
  - [ ] `src/data/repositories/ReviewRepository.js`
  - [ ] `src/data/repositories/JobRepository.js`
- [ ] Create `scripts/migrate.js` — CLI migration runner
- [ ] Create `scripts/seed.js` — Sample data seeder for testing
- [ ] Migrate existing JSON data (comments, mock_rules) to DB

---

## 1.5 — API Refactoring

- [ ] Refactor `server.js` to lean entry point (~50 lines)
  - [ ] Only Express setup, middleware, and route mounting
- [ ] Create API route modules:
  - [ ] `src/api/routes/index.js` — Route aggregator
  - [ ] `src/api/routes/scraper.routes.js` — Start/stop/status
  - [ ] `src/api/routes/platform.routes.js` — Platform config
  - [ ] `src/api/routes/data.routes.js` — Products/reviews/comments queries
  - [ ] `src/api/routes/auth.routes.js` — Cookie/auth management
  - [ ] `src/api/routes/webhook.routes.js` — Webhook endpoints
- [ ] Create middleware:
  - [ ] `src/api/middleware/errorHandler.js` — Global error handler
  - [ ] `src/api/middleware/validator.js` — Request validation
  - [ ] `src/api/middleware/logger.js` — Request logging
- [ ] Create controllers:
  - [ ] `src/api/controllers/ScraperController.js`
  - [ ] `src/api/controllers/PlatformController.js`
  - [ ] `src/api/controllers/DataController.js`
- [ ] Verify all existing API endpoints still work after refactor
- [ ] Add new unified endpoints:
  - [ ] `POST /api/scrape/product` — Scrape any product URL (auto-detect platform)
  - [ ] `GET /api/products` — Unified product listing with filters

---

## 1.6 — Proxy & Anti-Detection Foundation

- [ ] Create `src/core/ProxyManager.js`
  - [ ] Proxy pool storage
  - [ ] Round-robin & random rotation strategies
  - [ ] Health check (ping test)
  - [ ] Failed proxy blacklisting
  - [ ] Per-platform proxy assignment
  - [ ] Config file: `config/proxy-pool.json`
- [ ] Create `src/core/AntiDetection.js`
  - [ ] User-Agent rotation
  - [ ] Viewport randomization
  - [ ] Human delay simulation
  - [ ] Mouse movement simulation (basic)
  - [ ] Playwright stealth plugin integration (from existing)
  - [ ] Per-platform strategy profiles

---

## 1.7 — Data Normalization

- [ ] Create `src/services/DataNormalizer.js`
  - [ ] `normalizeProduct(rawData, platform)` → Unified schema
  - [ ] `normalizeReview(rawData, platform)` → Unified schema
  - [ ] `normalizeShop(rawData, platform)` → Unified schema
  - [ ] Currency normalization (THB default)
  - [ ] Image URL normalization
  - [ ] Category path normalization

---

## 1.8 — Utilities & Services

- [ ] Create `src/utils/logger.js`
  - [ ] Winston/Pino setup
  - [ ] Console + file transport
  - [ ] Log levels: debug, info, warn, error
  - [ ] Per-module logger instances
  - [ ] Log rotation
- [ ] Create `src/utils/helpers.js`
  - [ ] UUID generation
  - [ ] Date formatting
  - [ ] URL parsing helpers
  - [ ] String sanitization
- [ ] Create `src/utils/validators.js`
  - [ ] URL validation per platform
  - [ ] Config validation schemas
- [ ] Create `src/services/ExportService.js` (basic)
  - [ ] JSON export (refactor from existing)
  - [ ] CSV export (refactor from existing)

---

## 1.9 — Testing & Verification

- [ ] Verify refactored server starts without errors
- [ ] Test all existing TikTok Live endpoints work:
  - [ ] `POST /api/start` — Start scraper
  - [ ] `POST /api/stop` — Stop scraper
  - [ ] `GET /api/status` — Status check
  - [ ] `GET /api/comments` — Get comments
  - [ ] `GET /api/comment-histories` — History listing
  - [ ] Cookie import/check endpoints
  - [ ] AI webhook endpoints
- [ ] Test database creation and migrations
- [ ] Test platform registry loads TikTok adapter
- [ ] Run basic TikTok Live scrape end-to-end through new architecture
- [ ] Verify web UI still works with refactored backend

---

## 1.10 — Documentation

- [ ] Update `README.md` for new project structure
- [ ] Create `docs/architecture.md` — Technical architecture overview
- [ ] Create `docs/api-reference.md` — API endpoint documentation
- [ ] Create `docs/development.md` — Dev setup guide
- [ ] Update `docs/PROJECT_STRUCTURE.md`
