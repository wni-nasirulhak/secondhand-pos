# 🛒 EcomScraper Hub v2.0

**Multi-Platform E-Commerce Scraper System**

Modular, scalable web scraper for TikTok Shop, Shopee, Lazada, and more. Built with Node.js, Playwright, and Express.

---

## ✨ Features

### 🎵 TikTok
- ✅ **TikTok Live** - Real-time comment scraping with AI auto-reply
- ✅ **TikTok Shop** - Product, shop, search, review scraping ✨ **NEW!**

### 🛒 Shopee (Coming in Phase 3)
- Product scraping with variants
- Shop data extraction
- Flash sale monitoring
- Review analysis

### 🏪 Lazada (Coming in Phase 4)
- Product & shop scraping
- Campaign tracking
- Multi-SKU support

### 🚀 Core Features
- **Multi-Platform Support** - Unified API for all platforms
- **Modular Architecture** - Easy to extend with new platforms
- **Event-Driven** - Real-time updates via EventBus
- **Database-Backed** - SQLite (upgradeable to PostgreSQL)
- **RESTful API** - Clean, documented endpoints
- **Webhook Integration** - Discord, Slack, Telegram, Custom
- **AI-Powered Replies** - Auto-reply to TikTok Live comments

---

## 📦 Installation

### Prerequisites
- Node.js v18+ (v20+ recommended)
- npm or yarn

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/ecom-scraper-hub.git
cd ecom-scraper-hub

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run database migrations
npm run migrate

# Start server
npm start
```

Server will start at http://localhost:3000

---

## 🚀 Usage

### Start Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Access Web UI
Open http://localhost:3000 in your browser

### API Base URL
```
http://localhost:3000/api
```

---

## 📖 API Documentation

### Health Check
```bash
GET /api/health
```

### Scraper Control

**Start scraping job:**
```bash
POST /api/scraper/start
Content-Type: application/json

{
  "platform": "tiktok",
  "type": "product",
  "url": "https://www.tiktok.com/@shop/product/..."
}
```

**Get status:**
```bash
GET /api/scraper/status
```

**Get job details:**
```bash
GET /api/scraper/status/:jobId
```

### TikTok Live Scraper (Legacy)

**Start TikTok Live scraper:**
```bash
POST /api/tiktok-live/start
Content-Type: application/json

{
  "url": "https://www.tiktok.com/@username/live",
  "duration": 60,
  "interval": 3,
  "headless": true,
  "mode": "read"
}
```

**Stop scraper:**
```bash
POST /api/tiktok-live/stop
```

**Get status:**
```bash
GET /api/tiktok-live/status
```

### Authentication & Cookies

**Check cookies:**
```bash
GET /api/auth/check-cookies
```

**Import cookies:**
```bash
POST /api/auth/import-cookies
Content-Type: application/json

{
  "cookiesJson": "[{\"name\":\"...\",\"value\":\"...\"}]"
}
```

**Find Chrome profile:**
```bash
GET /api/auth/find-chrome-path
```

### Data & Downloads

**Get comments:**
```bash
GET /api/data/comments?limit=100
```

**Download data:**
```bash
GET /api/data/download?format=json
GET /api/data/download?format=csv
```

**List comment histories:**
```bash
GET /api/data/comment-histories
```

### Webhooks

**Test webhook:**
```bash
POST /api/webhook/test
Content-Type: application/json

{
  "webhook": {
    "platform": "discord",
    "url": "https://discord.com/api/webhooks/..."
  },
  "testMessage": {
    "username": "Test User",
    "comment": "Test message",
    "timestamp": 1234567890
  }
}
```

### AI Webhook Server

**Start AI webhook:**
```bash
POST /api/ai-webhook/start
Content-Type: application/json

{
  "aiMode": "mock",
  "apiKey": "your-api-key"
}
```

**Get status:**
```bash
GET /api/ai-webhook/status
```

**Get logs:**
```bash
GET /api/ai-webhook/logs?limit=20
```

---

## 🏗️ Architecture

```
┌─────────────┐
│   Web UI    │
└──────┬──────┘
       │
┌──────▼──────────────────────┐
│   Express API Server        │
│  (RESTful Endpoints)        │
└──────┬──────────────────────┘
       │
┌──────▼───────────┬───────────────┐
│  ScraperEngine   │  EventBus     │
└──────┬───────────┴───────────────┘
       │
┌──────▼──────────────────────┐
│  Platform Adapters          │
│  ┌────────┬────────┬──────┐ │
│  │ TikTok │ Shopee │Lazada│ │
│  └────────┴────────┴──────┘ │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│  BrowserManager             │
│  (Playwright)               │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│  Database (SQLite)          │
│  + Data Normalizer          │
└─────────────────────────────┘
```

### Key Components

- **ScraperEngine**: Job orchestration & lifecycle management
- **Platform Adapters**: Platform-specific scraping logic
- **BrowserManager**: Playwright browser pool management
- **EventBus**: Event-driven communication
- **Database**: SQLite with migration system
- **WebhookService**: Multi-platform webhook delivery

---

## 🗂️ Project Structure

```
ecom-scraper-hub/
├── src/
│   ├── core/               # Core engine (ScraperEngine, BrowserManager, etc.)
│   ├── platforms/          # Platform adapters (TikTok, Shopee, Lazada)
│   ├── api/                # API routes & controllers
│   ├── data/               # Database, models, migrations
│   ├── services/           # Business logic services
│   ├── utils/              # Utilities (logger, helpers, validators)
│   └── config/             # Configuration files
├── public/                 # Web UI static files
├── scripts/                # Utility scripts (migrate, seed, etc.)
├── data/                   # Runtime data (database, logs, exports)
├── config/                 # Runtime config (platform settings, etc.)
├── server.js               # Main entry point
├── package.json
├── .env.example
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` from `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./data/db/ecom_scraper.sqlite

# Browser
HEADLESS=true
BROWSER_TYPE=chromium

# TikTok
TIKTOK_STORAGE_STATE_PATH=./data/tiktok_storage_state.json

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./data/logs/app.log

# Proxy (optional)
PROXY_ENABLED=false
PROXY_SERVER=
```

### Platform Configuration

Edit `src/config/platforms.config.js` to customize platform settings:

```javascript
module.exports = {
    tiktok: {
        enabled: true,
        rateLimit: {
            requestsPerMinute: 30,
            pageLoadDelay: [3000, 8000],
        },
        // ...
    },
    // ...
};
```

---

## 📊 Database Schema

The system uses SQLite with the following main tables:

- **platforms** - Platform metadata
- **scraping_jobs** - Job tracking & status
- **products** - Scraped product data
- **shops** - Shop/seller information
- **reviews** - Product reviews
- **price_history** - Price tracking over time
- **categories** - Product categories
- **schedules** - Recurring scrape jobs
- **alerts** - Price/stock alerts

### Migrations

Run migrations:
```bash
npm run migrate
```

Migrations are located in `src/data/migrations/`

---

## 🧪 Testing

### API Testing

```bash
# Using curl (Linux/Mac)
curl http://localhost:3000/api/health

# Using PowerShell (Windows)
Invoke-WebRequest http://localhost:3000/api/health
```

### Manual Testing Checklist

- [ ] Server starts without errors
- [ ] Database migrations run successfully
- [ ] API health check returns 200
- [ ] Platform adapters load (check logs)
- [ ] Legacy TikTok Live endpoints work
- [ ] Cookie import works
- [ ] Webhook test sends successfully

---

## 🛡️ Security

- **Cookie Storage**: Cookies stored locally in `storage-states/` (add to `.gitignore`)
- **API Keys**: Store in `.env`, never commit
- **Rate Limiting**: Built-in per-platform rate limiting
- **Input Validation**: Joi schemas for all API inputs
- **Error Handling**: Sensitive info not exposed in production errors

---

## 🐛 Troubleshooting

### Server won't start
- Check `.env` file exists
- Run `npm install` to ensure dependencies are installed
- Check database path is writable

### Database errors
- Run `npm run migrate` to apply latest migrations
- Check `data/logs/error.log` for details

### Scraper fails
- Check browser is installed: `npx playwright install chromium`
- Verify target URL is accessible
- Check rate limits not exceeded
- Review logs in `data/logs/app.log`

### Cookie issues
- Re-import cookies via `/api/auth/import-cookies`
- Check cookie expiry with `/api/auth/check-cookies`
- Use Chrome profile mode if storage state fails

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Modular architecture
- [x] Platform adapter system
- [x] Database layer
- [x] API routes
- [x] TikTok Live support

### 🔜 Phase 2: TikTok Shop Scraper
- [ ] Product scraping
- [ ] Shop data extraction
- [ ] Search scraping
- [ ] Review scraping

### 🔜 Phase 3: Shopee Scraper
- [ ] API interception strategy
- [ ] Product/shop scraping
- [ ] Flash sale monitoring

### 🔜 Phase 4: Lazada Scraper
- [ ] JSON extraction strategy
- [ ] Product/shop scraping
- [ ] Campaign tracking

### 🔜 Phase 5-7: Advanced Features
- [ ] Job scheduling (cron)
- [ ] Proxy management
- [ ] Price tracking & alerts
- [ ] Dashboard & analytics
- [ ] Export pipeline (Excel, Google Sheets)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues
- **Discord**: [Join our community](#)

---

## 🎯 Quick Commands

```bash
# Installation
npm install

# Development
npm run dev

# Production
npm start

# Database
npm run migrate

# Utility
npm run login       # TikTok login helper
npm run scrape      # Quick scrape script
```

---

**Built with ❤️ using Node.js, Playwright, and Express**

_EcomScraper Hub - Your multi-platform e-commerce data solution_
