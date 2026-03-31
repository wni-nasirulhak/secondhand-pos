# 🛠️ Development Guide - EcomScraper Hub

## Prerequisites

- **Node.js**: v18+ (v20+ recommended)
- **npm** or **yarn**
- **Git**: For version control
- **Chrome/Chromium**: For Playwright browser automation

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ecom-scraper-hub.git
cd ecom-scraper-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 4. Setup Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# nano .env (Linux/Mac) or notepad .env (Windows)
```

### 5. Run Database Migrations

```bash
npm run migrate
```

### 6. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## Project Structure

```
ecom-scraper-hub/
├── src/                    # Source code
│   ├── core/              # Core engine (ScraperEngine, EventBus, etc.)
│   ├── platforms/         # Platform adapters
│   ├── api/               # API routes & middleware
│   ├── data/              # Database, models, repositories
│   ├── services/          # Business logic services
│   ├── utils/             # Utilities (logger, helpers, validators)
│   └── config/            # Configuration files
├── public/                # Web UI static files
├── scripts/               # Utility scripts (migrate, seed, etc.)
├── data/                  # Runtime data (database, logs, exports)
├── config/                # Runtime config
├── docs/                  # Documentation
├── tests/                 # Tests (unit, integration, e2e)
├── server.js              # Main entry point
├── package.json
├── .env                   # Environment variables (DO NOT COMMIT)
└── README.md
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### 2. Make Changes

Edit files, add features, fix bugs...

### 3. Test Locally

```bash
# Start dev server with auto-restart
npm run dev

# Test API endpoints
curl http://localhost:3000/api/health
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add my new feature"
git push origin feature/my-new-feature
```

### 5. Create Pull Request

Open a PR on GitHub for review.

---

## Adding a New Platform

### Step 1: Create Platform Directory

```bash
mkdir -p src/platforms/myplatform
```

### Step 2: Create Adapter Class

**File**: `src/platforms/myplatform/MyPlatformAdapter.js`

```javascript
const BasePlatformAdapter = require('../BasePlatformAdapter');
const config = require('./config');
const selectors = require('./selectors');

class MyPlatformAdapter extends BasePlatformAdapter {
    get platformName() {
        return 'myplatform';
    }

    get platformDisplayName() {
        return 'My Platform';
    }

    get platformIcon() {
        return '🛍️';
    }

    get supportedFeatures() {
        return ['product', 'shop', 'search'];
    }

    getPlatformConfig() {
        return config;
    }

    getSelectors() {
        return selectors;
    }

    async scrapeProduct(url) {
        // Implement product scraping
        await this.navigateWithRetry(url);
        const data = await this.page.evaluate(() => {
            // Extract product data
            return { name: '...', price: 0 };
        });
        return this.normalizeProduct(data);
    }

    // Implement other methods...
}

module.exports = MyPlatformAdapter;
```

### Step 3: Create Selectors

**File**: `src/platforms/myplatform/selectors.js`

```javascript
module.exports = {
    product: {
        name: '.product-name',
        price: '.product-price',
        images: '.product-images img',
        // ...
    },
    shop: {
        name: '.shop-name',
        // ...
    },
};
```

### Step 4: Create Config

**File**: `src/platforms/myplatform/config.js`

```javascript
module.exports = {
    enabled: true,
    displayName: 'My Platform',
    icon: '🛍️',
    baseUrl: 'https://www.myplatform.com',
    rateLimit: {
        requestsPerMinute: 30,
        pageLoadDelay: [2000, 5000],
    },
    supportedFeatures: ['product', 'shop', 'search'],
};
```

### Step 5: Register Platform

**File**: `src/platforms/index.js`

```javascript
const MyPlatformAdapter = require('./myplatform/MyPlatformAdapter');
PlatformRegistry.register('myplatform', MyPlatformAdapter);
```

### Step 6: Test

```bash
curl -X POST http://localhost:3000/api/scraper/start \
  -H "Content-Type: application/json" \
  -d '{"platform":"myplatform","type":"product","url":"..."}'
```

---

## Running Tests

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

---

## Database Migrations

### Create New Migration

```bash
# Create migration file manually
touch src/data/migrations/005_my_new_migration.js
```

**Template**:

```javascript
module.exports = {
    up: (db) => {
        db.exec(`
            CREATE TABLE my_new_table (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL
            )
        `);
    },

    down: (db) => {
        db.exec('DROP TABLE IF EXISTS my_new_table');
    },
};
```

### Run Migrations

```bash
npm run migrate
```

### Check Database

```bash
sqlite3 data/db/ecom_scraper.sqlite
.tables
.schema products
.exit
```

---

## Debugging

### Enable Debug Logging

```env
# .env
LOG_LEVEL=debug
NODE_ENV=development
```

### View Logs

```bash
# Tail application log
tail -f data/logs/app.log

# Tail error log
tail -f data/logs/error.log
```

### Use Node Inspector

```bash
node --inspect server.js
```

Then open `chrome://inspect` in Chrome.

---

## Code Style

### ESLint (Future)

```bash
npm run lint
npm run lint:fix
```

### Prettier (Future)

```bash
npm run format
```

### Naming Conventions

- **Files**: `PascalCase.js` for classes, `camelCase.js` for utilities
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Database tables**: `snake_case`

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_PATH` | SQLite database file | ./data/db/ecom_scraper.sqlite |
| `HEADLESS` | Headless browser mode | true |
| `LOG_LEVEL` | Logging level | info |
| `LOG_FILE_PATH` | Log file path | ./data/logs/app.log |

---

## Troubleshooting

### Server won't start

**Check**:
- `.env` file exists
- Dependencies installed (`npm install`)
- Port 3000 not already in use

**Solution**:
```bash
npm install
PORT=3001 npm run dev
```

### Database errors

**Check**:
- Database file path exists
- Migrations run successfully

**Solution**:
```bash
rm -rf data/db/ecom_scraper.sqlite
npm run migrate
```

### Playwright errors

**Check**:
- Browsers installed

**Solution**:
```bash
npx playwright install chromium
```

---

## Performance Tips

1. **Use headless mode** in production (`HEADLESS=true`)
2. **Enable caching** (future feature)
3. **Limit concurrent jobs** (configure in ScraperEngine)
4. **Use proxy rotation** for large-scale scraping (Phase 6)

---

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Add tests (if applicable)
5. Run tests (`npm test`)
6. Commit your changes
7. Push to the branch
8. Create a Pull Request

### Commit Message Format

```
<type>: <description>

[optional body]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:
```
feat: add Shopee product scraping

Implemented Shopee product page scraping using API interception strategy.
Supports variants, reviews, and price history.
```

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3)
- [Winston Logger](https://github.com/winstonjs/winston)

---

**Last Updated**: March 28, 2026
