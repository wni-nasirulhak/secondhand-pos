# 📡 API Reference - EcomScraper Hub

**Base URL**: `http://localhost:3000/api`

---

## Table of Contents

1. [Health & Status](#health--status)
2. [Scraper Control](#scraper-control)
3. [TikTok Live (Legacy)](#tiktok-live-legacy)
4. [Platform Management](#platform-management)
5. [Authentication & Cookies](#authentication--cookies)
6. [Data & Downloads](#data--downloads)
7. [Webhooks](#webhooks)
8. [AI Webhook Server](#ai-webhook-server)
9. [Mock Rules](#mock-rules)

---

## Health & Status

### `GET /api/health`

Health check endpoint.

**Response**:
```json
{
  "success": true,
  "service": "EcomScraper Hub API",
  "version": "2.0.0",
  "timestamp": "2026-03-28T00:00:00.000Z"
}
```

---

## Scraper Control

### `POST /api/scraper/start`

Start a new scraping job.

**Request Body**:
```json
{
  "platform": "tiktok",
  "type": "product",
  "url": "https://www.tiktok.com/@shop/product/...",
  "options": {}
}
```

**Parameters**:
- `platform` (string): Platform ID (`tiktok`, `shopee`, `lazada`)
- `type` (string): Job type (`product`, `shop`, `search`, `review`, `live`)
- `url` (string, optional): Target URL
- `query` (string, optional): Search query (for `search` type)
- `options` (object, optional): Additional options

**Response**:
```json
{
  "success": true,
  "jobId": "uuid-here",
  "message": "Scraping job started"
}
```

### `POST /api/scraper/stop/:jobId`

Stop a running job.

**Response**:
```json
{
  "success": true,
  "message": "Job stopped",
  "job": { ... }
}
```

### `GET /api/scraper/status`

Get all jobs status.

**Response**:
```json
{
  "success": true,
  "total": 5,
  "running": 1,
  "jobs": [
    {
      "id": "uuid",
      "platform": "tiktok",
      "type": "product",
      "status": "running",
      "itemsScraped": 10,
      "createdAt": "2026-03-28T..."
    }
  ]
}
```

### `GET /api/scraper/status/:jobId`

Get specific job status.

**Response**:
```json
{
  "success": true,
  "job": {
    "id": "uuid",
    "platform": "tiktok",
    "type": "product",
    "status": "completed",
    "itemsScraped": 100,
    "itemsFailed": 2,
    "error": null,
    "createdAt": "...",
    "startedAt": "...",
    "completedAt": "..."
  }
}
```

### `POST /api/scrape/product`

Quick product scrape (auto-detect platform).

**Request Body**:
```json
{
  "url": "https://shopee.co.th/product-slug-i.12345.67890"
}
```

**Response**:
```json
{
  "success": true,
  "platform": "shopee",
  "product": { ... }
}
```

---

## TikTok Live (Legacy)

### `POST /api/tiktok-live/start`

Start TikTok Live comment scraper.

**Request Body**:
```json
{
  "url": "https://www.tiktok.com/@username/live",
  "duration": 60,
  "interval": 3,
  "headless": true,
  "mode": "read"
}
```

**Response**:
```json
{
  "success": true,
  "message": "TikTok Live scraper started",
  "config": { ... }
}
```

### `POST /api/tiktok-live/stop`

Stop TikTok Live scraper.

### `GET /api/tiktok-live/status`

Get TikTok Live scraper status.

**Response**:
```json
{
  "running": false,
  "config": null,
  "uptime": 0,
  "commentsCount": 0
}
```

---

## Platform Management

### `GET /api/platform/`

Get all platforms info.

**Response**:
```json
{
  "success": true,
  "platforms": [
    {
      "id": "tiktok",
      "name": "TikTok Shop",
      "icon": "🎵",
      "supportedFeatures": ["live", "product", "shop", "search"],
      "config": { ... }
    }
  ],
  "count": 3
}
```

### `GET /api/platform/:id`

Get platform info.

**Response**:
```json
{
  "success": true,
  "platform": {
    "id": "tiktok",
    "name": "TikTok Shop",
    "icon": "🎵",
    "supportedFeatures": ["live", "product", "shop", "search"],
    "config": { ... }
  }
}
```

### `GET /api/platform/:id/features`

Get platform supported features.

**Response**:
```json
{
  "success": true,
  "platform": "tiktok",
  "features": ["live", "product", "shop", "search"]
}
```

### `GET /api/platform/:id/config`

Get platform configuration.

### `GET /api/platform/:id/selectors`

Get platform DOM selectors.

---

## Authentication & Cookies

### `GET /api/auth/check-cookies`

Check if cookies exist and are valid.

**Response**:
```json
{
  "exists": true,
  "valid": true,
  "cookieCount": 64,
  "validCount": 64,
  "expiryDate": "2/4/2569 13:47:35"
}
```

### `POST /api/auth/import-cookies`

Import cookies from JSON.

**Request Body**:
```json
{
  "cookiesJson": "[{\"name\":\"...\",\"value\":\"...\"}]"
}
```

**Response**:
```json
{
  "success": true,
  "message": "บันทึกคุกกี้สำเร็จ!"
}
```

### `GET /api/auth/find-chrome-path`

Find Chrome user data path.

**Response**:
```json
{
  "success": true,
  "path": "C:\\Users\\...\\Chrome\\User Data",
  "exists": true,
  "platform": "win32",
  "username": "Winon",
  "profiles": [
    {"name": "Default", "path": "..."}
  ]
}
```

---

## Data & Downloads

### `GET /api/data/comments`

Get recent comments (TikTok Live legacy).

**Query Parameters**:
- `limit` (number): Max comments to return (default: 100)

**Response**:
```json
{
  "success": true,
  "comments": [
    {
      "username": "user123",
      "comment": "Hello!",
      "timestamp": "2026-03-28T..."
    }
  ],
  "total": 150
}
```

### `GET /api/data/download`

Download data as JSON or CSV.

**Query Parameters**:
- `format` (string): `json` or `csv`

**Response**: File download

### `GET /api/data/comment-histories`

List comment history files.

**Response**:
```json
{
  "success": true,
  "histories": [
    {
      "filename": "comments_2026-03-28_10-30-00.json",
      "date": "2026-03-28",
      "time": "10:30:00",
      "count": 250,
      "size": 102400,
      "created": "..."
    }
  ]
}
```

### `GET /api/data/comment-histories/:filename`

View specific history file.

### `GET /api/data/comment-histories/:filename/download`

Download history file.

### `DELETE /api/data/comment-histories/:filename`

Delete history file.

---

## Webhooks

### `POST /api/webhook/test`

Test webhook delivery.

**Request Body**:
```json
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

**Response**:
```json
{
  "success": true,
  "message": "ส่ง webhook สำเร็จ!"
}
```

---

## AI Webhook Server

### `POST /api/ai-webhook/start`

Start AI webhook server.

**Request Body**:
```json
{
  "aiMode": "mock",
  "apiKey": "your-api-key",
  "systemPrompt": "...",
  "replyDelay": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "AI Webhook server started!",
  "port": 3099,
  "url": "http://localhost:3099/webhook"
}
```

### `POST /api/ai-webhook/stop`

Stop AI webhook server.

### `GET /api/ai-webhook/status`

Get AI webhook server status.

**Response**:
```json
{
  "running": true,
  "port": 3099
}
```

### `GET /api/ai-webhook/logs`

Get AI webhook logs.

**Query Parameters**:
- `limit` (number): Max logs to return (default: 20)

**Response**:
```json
{
  "logs": [
    {
      "timestamp": "...",
      "type": "reply",
      "user": "username",
      "comment": "...",
      "reply": "..."
    }
  ],
  "running": true
}
```

### `DELETE /api/ai-webhook/logs`

Clear AI webhook logs.

### `POST /api/ai-webhook/config`

Update AI webhook configuration.

---

## Mock Rules

### `GET /api/mock-rules`

Get mock rules.

**Response**:
```json
[
  {
    "trigger": "สวัสดี",
    "reply": "สวัสดีครับ!",
    "enabled": true
  }
]
```

### `POST /api/mock-rules`

Save mock rules.

**Request Body**:
```json
[
  {
    "trigger": "สวัสดี",
    "reply": "สวัสดีครับ!",
    "enabled": true
  }
]
```

**Response**:
```json
{
  "success": true,
  "message": "บันทึกกฎ Mock AI สำเร็จ!"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional details (development only)"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently not enforced at API level. Platform-specific rate limiting is handled internally by the scraper engine.

---

**Last Updated**: March 28, 2026  
**API Version**: 2.0.0
