require('dotenv').config();
const colors = require('colors');
const ShopeeLiveBot = require('./src/bot');
const logger = require('./src/utils/logger');

async function main() {
  logger.info('🚀 Starting Shopee Live Bot...'.green.bold);

  const bot = new ShopeeLiveBot({
    username: process.env.SHOPEE_USERNAME,
    password: process.env.SHOPEE_PASSWORD,
    liveUrl: process.env.LIVE_URL,
    headless: process.env.HEADLESS === 'true',
    autoReply: process.env.AUTO_REPLY === 'true',
    replyDelay: {
      min: parseInt(process.env.REPLY_DELAY_MIN) || 2000,
      max: parseInt(process.env.REPLY_DELAY_MAX) || 5000
    }
  });

  try {
    await bot.initialize();
    await bot.start();
  } catch (error) {
    logger.error('❌ Bot crashed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down gracefully...'.yellow);
  process.exit(0);
});

main();
