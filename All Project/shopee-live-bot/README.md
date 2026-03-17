# 🛍️ Shopee Live Bot

AI-powered chatbot for Shopee Live streams with automatic reply capabilities.

## ✨ Features

- 🤖 **AI Auto-Reply** - Intelligent responses using Claude/OpenClaw
- 📺 **Live Chat Monitoring** - Real-time message detection
- 🎯 **Smart Filtering** - Only replies to relevant questions
- 🕐 **Human-like Delays** - Random delays to avoid detection
- 🔐 **Stealth Mode** - Anti-detection using puppeteer-stealth
- 📝 **Logging** - Comprehensive logs for debugging

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your details:

```bash
cp .env.example .env
```

Edit `.env`:
```env
SHOPEE_USERNAME=your_phone_or_email
SHOPEE_PASSWORD=your_password
LIVE_URL=https://live.shopee.co.th/pc/xxxxx
```

### 3. Run the Bot

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📁 Project Structure

```
shopee-live-bot/
├── index.js              # Main entry point
├── src/
│   ├── bot.js            # Core bot logic
│   └── utils/
│       ├── logger.js     # Winston logger
│       └── ai.js         # AI service (Claude/OpenClaw)
├── logs/                 # Log files
├── .env                  # Configuration (create from .env.example)
└── package.json
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SHOPEE_USERNAME` | Your Shopee phone/email | - |
| `SHOPEE_PASSWORD` | Your Shopee password | - |
| `LIVE_URL` | Shopee Live stream URL | - |
| `HEADLESS` | Run browser in headless mode | `false` |
| `AUTO_REPLY` | Enable auto-reply | `true` |
| `REPLY_DELAY_MIN` | Min delay before reply (ms) | `2000` |
| `REPLY_DELAY_MAX` | Max delay before reply (ms) | `5000` |
| `DEBUG` | Enable debug logging | `true` |

## 🔧 TODO / Known Issues

- [ ] **Login automation** - Currently requires manual login
- [ ] **DOM selectors** - Need to update selectors based on actual Shopee Live structure
- [ ] **WebSocket monitoring** - Implement WebSocket listener for real-time chat
- [ ] **OpenClaw integration** - Connect to actual OpenClaw API
- [ ] **Session persistence** - Save cookies for auto-login
- [ ] **Proxy support** - Add proxy rotation
- [ ] **Better AI context** - Pass product info to AI

## ⚠️ Disclaimer

This bot is for educational purposes only. Use at your own risk.

- Shopee's Terms of Service may prohibit automated tools
- Use responsibly and ethically
- Don't spam or abuse the system
- May be detected and blocked by Shopee

## 📝 Notes

### Finding Selectors

To find the correct DOM selectors for Shopee Live:

1. Open Shopee Live in browser
2. Right-click chat area → Inspect Element
3. Find chat message elements
4. Update selectors in `src/bot.js`

### Common Selectors to Update

```javascript
// In src/bot.js
const chatElements = document.querySelectorAll('.live-chat-message'); // Update this
const inputSelector = '.chat-input'; // Update this
```

## 🛠️ Development

### Running with Browser Visible

Set `HEADLESS=false` in `.env` to see what the bot is doing.

### Viewing Logs

Logs are saved in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 📄 License

MIT

---

Made with 💝 by ดา
