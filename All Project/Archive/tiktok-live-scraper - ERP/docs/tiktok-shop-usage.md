# 🎵 TikTok Shop Scraper - Usage Guide

## Quick Start

### Via API

#### Scrape a Product

```bash
curl -X POST http://localhost:3000/api/scraper/start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "type": "product",
    "url": "https://shop.tiktok.com/view/product/1234567890"
  }'
```

**Response**:
```json
{
  "success": true,
  "jobId": "uuid-here",
  "message": "Scraping job started"
}
```

#### Check Job Status

```bash
curl http://localhost:3000/api/scraper/status/uuid-here
```

---

## Supported Features

### 1. Product Scraping

**What it extracts**:
- Product name
- Price (current & original)
- Images (all variants)
- Description
- Rating & review count
- Sold count
- Stock status
- Variants (colors, sizes)
- Shop information

**Example**:
```bash
POST /api/scraper/start
{
  "platform": "tiktok",
  "type": "product",
  "url": "https://shop.tiktok.com/view/product/1234567890"
}
```

---

### 2. Shop Scraping

**What it extracts**:
- Shop name & ID
- Rating & follower count
- Product count
- Response rate & time
- Location
- Joined date
- Official/verified status
- (Optional) All shop products

**Example**:
```bash
POST /api/scraper/start
{
  "platform": "tiktok",
  "type": "shop",
  "url": "https://www.tiktok.com/@shopname",
  "options": {
    "includeProducts": true,
    "productLimit": 50
  }
}
```

---

### 3. Search

**What it does**:
- Search TikTok Shop by keyword
- Return product listings
- Support filters & pagination

**Example**:
```bash
POST /api/scraper/start
{
  "platform": "tiktok",
  "type": "search",
  "query": "iphone case",
  "options": {
    "limit": 20,
    "type": "products"
  }
}
```

---

### 4. Reviews

**What it extracts**:
- Rating (1-5 stars)
- Author name
- Comment text
- Review images
- Verified purchase badge
- Helpful count
- Seller response
- Review date

**Example**:
```bash
POST /api/scraper/start
{
  "platform": "tiktok",
  "type": "review",
  "url": "https://shop.tiktok.com/view/product/1234567890",
  "options": {
    "limit": 50,
    "rating": 5
  }
}
```

---

## Programmatic Usage

### TypeScript/JavaScript

```javascript
const express = require('express');
const fetch = require('node-fetch');

// Start scraping job
async function scrapeProduct(url) {
  const response = await fetch('http://localhost:3000/api/scraper/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform: 'tiktok',
      type: 'product',
      url: url
    })
  });
  
  const data = await response.json();
  return data.jobId;
}

// Check status
async function getJobStatus(jobId) {
  const response = await fetch(`http://localhost:3000/api/scraper/status/${jobId}`);
  return await response.json();
}

// Usage
const jobId = await scrapeProduct('https://shop.tiktok.com/view/product/...');
console.log('Job started:', jobId);

// Poll for completion
const interval = setInterval(async () => {
  const status = await getJobStatus(jobId);
  if (status.job.status === 'completed') {
    console.log('Result:', status.job.result);
    clearInterval(interval);
  }
}, 2000);
```

---

## URL Patterns

### Product URLs

```
✅ https://shop.tiktok.com/view/product/{id}
✅ https://www.tiktok.com/@{shop}/product/{id}
```

### Shop URLs

```
✅ https://www.tiktok.com/@{shop_name}
✅ https://shop.tiktok.com/view/shop/{id}
```

### Search

```
✅ https://www.tiktok.com/search?q={keyword}
```

---

## Advanced Options

### Product Scraping Options

```javascript
{
  "platform": "tiktok",
  "type": "product",
  "url": "...",
  "options": {
    // No additional options currently
  }
}
```

### Shop Scraping Options

```javascript
{
  "platform": "tiktok",
  "type": "shop",
  "url": "...",
  "options": {
    "includeProducts": true,  // Also scrape all products
    "productLimit": 50        // Max products to scrape
  }
}
```

### Search Options

```javascript
{
  "platform": "tiktok",
  "type": "search",
  "query": "keyword",
  "options": {
    "limit": 20,              // Max results (default: 20)
    "type": "products"        // "products" or "shops" (default: "products")
  }
}
```

### Review Options

```javascript
{
  "platform": "tiktok",
  "type": "review",
  "url": "...",
  "options": {
    "limit": 50,              // Max reviews (default: 20)
    "rating": 5               // Filter by rating 1-5 (optional)
  }
}
```

---

## Rate Limiting

**TikTok Rate Limits**:
- ~30 requests/minute (2-4s delay between requests)
- Automatic delays built-in
- Risk of CAPTCHA with rapid requests

**Recommendations**:
- Use authenticated cookies (StorageState)
- Enable proxy rotation (Phase 6)
- Batch requests with delays

---

## Authentication

### Using Cookies (Recommended)

1. **Export cookies from browser** (EditThisCookie, Cookie Editor)

2. **Import via API**:
```bash
POST /api/auth/import-cookies
{
  "cookiesJson": "[{...}]"
}
```

3. **Scraper will automatically use stored cookies**

### Using Chrome Profile

Set in `.env`:
```env
TIKTOK_CHROME_PROFILE_PATH=C:\Users\...\Chrome\User Data\Profile 1
```

---

## Troubleshooting

### No Data Returned

**Possible causes**:
- Invalid URL format
- Product/shop not available in your region
- Authentication required
- Selectors changed (TikTok updated their UI)

**Solutions**:
- Verify URL format
- Use authenticated cookies
- Check logs: `data/logs/app.log`

### CAPTCHA Encountered

**Solutions**:
- Reduce scraping frequency
- Use authenticated session
- Enable proxy rotation (Phase 6)
- Increase delays between requests

### Rate Limit Errors

**Solutions**:
- Wait before retrying (cooldown period)
- Use different proxy/IP
- Reduce concurrent requests

---

## Examples

### Complete Workflow

```bash
# 1. Check cookies
curl http://localhost:3000/api/auth/check-cookies

# 2. Import cookies if needed
curl -X POST http://localhost:3000/api/auth/import-cookies \
  -H "Content-Type: application/json" \
  -d '{"cookiesJson": "[...]"}'

# 3. Scrape product
curl -X POST http://localhost:3000/api/scraper/start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "type": "product",
    "url": "https://shop.tiktok.com/view/product/..."
  }'

# 4. Check status
curl http://localhost:3000/api/scraper/status/job-id-here

# 5. View logs (if needed)
tail -f data/logs/app.log
```

---

## Best Practices

1. **Always use authentication** (cookies or Chrome profile)
2. **Respect rate limits** (30 req/min max)
3. **Handle errors gracefully** (retry with backoff)
4. **Monitor logs** for issues
5. **Test with single products** before batch scraping
6. **Use proxy rotation** for large-scale scraping (Phase 6)

---

**Last Updated**: March 28, 2026
