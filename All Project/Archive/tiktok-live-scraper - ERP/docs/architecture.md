# 🏗️ EcomScraper Hub - Architecture

## System Overview

EcomScraper Hub is a **modular, multi-platform e-commerce scraping system** built on a **plugin-based architecture** that allows easy extension to new platforms.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Web UI (Browser)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│                Express API Server                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes (scraper, data, auth, webhook, platform) │  │
│  └────────────┬──────────────────────────────────────┘  │
└───────────────┼─────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────┐
│                   Core Engine Layer                     │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ScraperEngine │  │ EventBus    │  │BrowserManager │  │
│  └──────────────┘  └─────────────┘  └───────────────┘  │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │RateLimiter   │  │RetryStrategy│  │ProxyManager   │  │
│  └──────────────┘  └─────────────┘  └───────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Platform Adapter Layer                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │      BasePlatformAdapter (Abstract)              │  │
│  └──┬───────────────┬───────────────┬───────────────┘  │
│     │               │               │                   │
│  ┌──▼──────┐   ┌───▼────┐     ┌───▼─────┐            │
│  │ TikTok  │   │ Shopee │     │ Lazada  │            │
│  │ Adapter │   │ Adapter│     │ Adapter │            │
│  └────┬────┘   └───┬────┘     └───┬─────┘            │
└───────┼────────────┼────────────────┼──────────────────┘
        │            │                │
        └────────────┴────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Browser Automation                      │
│              Playwright (Chromium/Firefox)              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Data Layer                             │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Database.js  │  │ Models      │  │ Repositories  │  │
│  │ (SQLite)     │  │ (CRUD)      │  │ (Queries)     │  │
│  └──────────────┘  └─────────────┘  └───────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │ SQLite Database│
              └────────────────┘
```

---

## Key Components

### 1. API Layer (`src/api/`)

**Purpose**: RESTful API interface for all operations

- **Routes**: Endpoint definitions organized by feature
- **Middleware**: Error handling, validation, logging
- **Controllers**: (Future) Business logic separation

### 2. Core Engine (`src/core/`)

**ScraperEngine**
- Job lifecycle management (create, start, monitor, complete)
- Multi-job concurrency support
- Integration with EventBus for real-time updates

**EventBus**
- Event-driven architecture
- Decoupled communication between components
- Events: `scraper:*`, `product:scraped`, `price:changed`, etc.

**BrowserManager**
- Playwright browser lifecycle management
- Context pooling (isolated sessions per job)
- Support for Chrome profiles and storage states

**RateLimiter**
- Per-platform request throttling
- Cooldown enforcement
- Prevent rate limit/CAPTCHA triggers

**RetryStrategy**
- Exponential backoff
- Circuit breaker pattern
- Configurable retry logic

### 3. Platform Adapter System (`src/platforms/`)

**BasePlatformAdapter** (Abstract)
- Interface contract for all platforms
- Required methods: `scrapeProduct`, `scrapeShop`, `scrapeSearch`, `scrapeReviews`
- Data normalization methods
- Selector registry pattern

**PlatformRegistry**
- Auto-discovery and registration
- Dependency injection for adapters
- Instance caching

**Platform Adapters**
- TikTok: Product, shop, live comment scraping
- Shopee: (Phase 3) API interception strategy
- Lazada: (Phase 4) JSON extraction strategy

### 4. Data Layer (`src/data/`)

**Database.js**
- SQLite abstraction (upgradeable to PostgreSQL)
- Migration runner
- Transaction support
- Query helpers (run, get, all)

**Models** (`src/data/models/`)
- Product, Shop, Review, ScrapingJob, PriceHistory, Comment
- Basic CRUD operations
- Data validation

**Repositories** (`src/data/repositories/`)
- Advanced query methods
- Filtering, sorting, pagination
- Statistics and aggregations

### 5. Services (`src/services/`)

**DataNormalizer**
- Cross-platform data standardization
- Unified schema for products, reviews, shops

**WebhookService**
- Multi-platform webhook delivery (Discord, Slack, Telegram, Custom)

**TikTokLiveScraperService**
- Legacy TikTok Live scraper process manager

### 6. Utilities (`src/utils/`)

**Logger**
- Winston-based structured logging
- Per-module instances
- File rotation

**Helpers**
- UUID generation, date formatting, sleep, retry logic

**Validators**
- URL validation, platform detection
- Joi schema validation

---

## Data Flow

### Product Scraping Flow

```
1. User → POST /api/scraper/start
2. API Route → ScraperEngine.createJob()
3. ScraperEngine → PlatformRegistry.createInstance(platform)
4. ScraperEngine → BrowserManager.createContext(jobId)
5. PlatformAdapter → Initialize & authenticate
6. PlatformAdapter → scrapeProduct(url)
7. Browser → Navigate & extract data
8. PlatformAdapter → normalizeProduct(rawData)
9. ScraperEngine → EventBus.emitProductScraped(product)
10. Model → Product.create(normalizedData)
11. Database → INSERT INTO products
12. EventBus → Notify listeners
13. API → Return job status
```

### Event Flow

```
ScraperEngine → EventBus.emit('product:scraped')
                     ↓
            ┌────────┴────────┐
            │                 │
     WebhookService    DataRoutes.addComment
         (Send)           (Legacy support)
```

---

## Design Patterns

### 1. **Strategy Pattern** (Platform Adapters)
- Each platform is a different strategy for scraping
- Interchangeable at runtime
- Common interface via `BasePlatformAdapter`

### 2. **Factory Pattern** (PlatformRegistry)
- Centralized creation of adapter instances
- Hides instantiation complexity

### 3. **Singleton Pattern** (Services)
- EventBus, BrowserManager, Database
- Single global instance

### 4. **Observer Pattern** (EventBus)
- Pub/sub for decoupled communication
- Components subscribe to events

### 5. **Repository Pattern** (Data Access)
- Abstraction over database queries
- Centralized data access logic

---

## Extension Points

### Adding a New Platform

1. Create adapter directory: `src/platforms/newplatform/`
2. Implement adapter class extending `BasePlatformAdapter`
3. Define selectors in `selectors.js`
4. Define config in `config.js`
5. Register in `src/platforms/index.js`

**Example**:
```javascript
const NewPlatformAdapter = require('./newplatform/NewPlatformAdapter');
PlatformRegistry.register('newplatform', NewPlatformAdapter);
```

### Adding a New Scraping Type

1. Add method to `BasePlatformAdapter` (e.g., `scrapeCampaign`)
2. Implement in platform adapters
3. Add job type to `ScraperEngine`
4. Update database schema if needed

---

## Configuration

### Environment Variables (`.env`)
- `PORT`: Server port
- `DATABASE_PATH`: SQLite database file path
- `HEADLESS`: Headless browser mode
- `LOG_LEVEL`: Logging verbosity

### Platform Config (`src/config/platforms.config.js`)
- Rate limits per platform
- Feature flags
- Storage state paths

---

## Security

- **Input Validation**: Joi schemas on all inputs
- **Error Handling**: No sensitive data in production errors
- **Rate Limiting**: Per-platform throttling
- **Cookie Storage**: Local file storage (add to `.gitignore`)

---

## Performance Optimization

1. **Browser Reuse**: Context pooling instead of launching new browsers
2. **Connection Pooling**: SQLite with WAL mode (future)
3. **Caching**: (Future) Redis for frequently accessed data
4. **Lazy Loading**: Platform adapters loaded only when needed

---

## Monitoring & Observability

- **Logging**: Winston with file rotation + module-specific loggers
- **Events**: Real-time tracking via EventBus
- **Database**: Job status tracking in `scraping_jobs` table
- **Metrics**: (Future) Prometheus/Grafana integration

---

## Future Enhancements

### Phase 2-7 Roadmap
- [ ] Advanced proxy management
- [ ] Job scheduling (cron)
- [ ] Price tracking & alerts
- [ ] Dashboard UI with charts
- [ ] Export to Excel/Google Sheets
- [ ] AI-powered data enrichment

---

**Last Updated**: March 28, 2026  
**Version**: 2.0.0
