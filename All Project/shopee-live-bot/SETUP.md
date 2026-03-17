# 🔧 Setup Guide - Shopee Live Bot

## Step-by-Step Setup

### 1️⃣ Install Node.js Dependencies

```bash
cd shopee-live-bot
npm install
```

### 2️⃣ Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
# Your Shopee login credentials
SHOPEE_USERNAME=0812345678
SHOPEE_PASSWORD=your_secure_password

# OpenClaw API (if you have it running locally)
OPENCLAW_API_URL=http://localhost:3000
OPENCLAW_API_KEY=your_gateway_token_here

# Bot behavior
HEADLESS=false        # Set to true to hide browser
AUTO_REPLY=true       # Auto-reply to messages
REPLY_DELAY_MIN=2000  # Min 2 seconds delay
REPLY_DELAY_MAX=5000  # Max 5 seconds delay

# The Shopee Live URL you want to join
LIVE_URL=https://live.shopee.co.th/pc/xxxxx

# Debug mode
DEBUG=true
```

### 3️⃣ Find Your Live Stream URL

1. Go to Shopee Live on your browser
2. Join a live stream
3. Copy the URL from address bar
   - Should look like: `https://live.shopee.co.th/pc/xxxxxxxxxx`
4. Paste it in `.env` as `LIVE_URL`

### 4️⃣ Test Run

```bash
npm start
```

The bot will:
1. Open a browser window
2. Navigate to Shopee login page
3. **Wait for you to login manually** (for now)
4. Join the live stream
5. Start monitoring chat

### 5️⃣ What to Do Next

#### 🔍 Find the Correct DOM Selectors

The bot needs to know where chat messages appear. You'll need to inspect Shopee Live:

1. Open Shopee Live in your browser
2. Right-click on a chat message → **Inspect**
3. Find the CSS selector for:
   - Chat message container
   - Username element
   - Message text element
   - Chat input box

4. Update `src/bot.js`:

```javascript
// Line ~89 - Update these selectors
const chatElements = document.querySelectorAll('.YOUR-CHAT-MESSAGE-SELECTOR');

// Inside the map function, update:
username: el.querySelector('.YOUR-USERNAME-SELECTOR')?.textContent
message: el.querySelector('.YOUR-MESSAGE-SELECTOR')?.textContent

// Line ~161 - Update input selector
const inputSelector = '.YOUR-INPUT-SELECTOR';
```

#### 🔐 Implement Auto-Login (Optional)

Currently the bot waits for manual login. To automate:

1. Edit `src/bot.js` → `login()` method
2. Add code to fill in login form
3. Handle OTP/captcha if needed

Example:
```javascript
await this.page.type('#username-input', this.config.username);
await this.page.type('#password-input', this.config.password);
await this.page.click('#login-button');
```

#### 🤖 Connect to OpenClaw AI

Edit `src/utils/ai.js`:

```javascript
async generateReply(message, context = {}) {
  // Replace mockAIResponse with actual OpenClaw API call
  const response = await axios.post(
    `${this.apiUrl}/api/chat`,
    {
      message: prompt,
      sessionId: 'shopee-bot'
    },
    {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    }
  );
  
  return response.data.reply;
}
```

## 🧪 Testing

### Test Without Auto-Reply

Set `AUTO_REPLY=false` in `.env` to just monitor messages without sending replies.

### Test AI Responses

The bot currently uses mock responses based on keywords. Check `src/utils/ai.js` → `mockAIResponse()`.

### View Logs

```bash
# Real-time logs
npm start

# View saved logs
cat logs/combined.log
cat logs/error.log
```

## 🐛 Troubleshooting

### Browser doesn't open
- Check if you have Chromium installed
- Try deleting `node_modules` and run `npm install` again

### Can't find chat messages
- Update DOM selectors (see step 5 above)
- Enable `DEBUG=true` to see what's happening

### Login fails
- Make sure credentials are correct in `.env`
- Try logging in manually first
- Check if Shopee requires OTP

### Messages not sending
- Update input selector
- Check if you're logged in
- Try sending manually first to see if it works

## 📚 Next Steps

1. ✅ Get basic monitoring working
2. ✅ Find correct selectors
3. ⚠️ Test sending messages manually
4. ⚠️ Implement auto-login
5. ⚠️ Connect real AI
6. ⚠️ Add WebSocket monitoring (faster than polling)
7. ⚠️ Add proxy support
8. ⚠️ Add session persistence (save cookies)

---

Need help? Check the logs or ask! 💝
