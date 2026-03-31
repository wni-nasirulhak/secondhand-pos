// Wrapper script to run scraper from command line
const ScraperEngine = require('./scraper-engine');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  platform: getArg('--platform') || 'tiktok',
  url: getArg('--url') || '',
  duration: parseInt(getArg('--duration')) || 60,
  interval: parseInt(getArg('--interval')) || 3,
  headless: args.includes('--headless'),
  mode: getArg('--mode') || 'read',
  storageStatePath: null
};

function getArg(name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

// Validate config
if (!config.url) {
  console.error('❌ Error: --url is required');
  process.exit(1);
}

// Load platform scraper
let PlatformScraper;
try {
  switch (config.platform) {
    case 'tiktok':
      PlatformScraper = require('../platforms/tiktok/scraper');
      config.storageStatePath = path.join(__dirname, '..', 'storage-states', 'tiktok.json');
      break;
    case 'shopee':
      PlatformScraper = require('../platforms/shopee/scraper');
      config.storageStatePath = path.join(__dirname, '..', 'storage-states', 'shopee.json');
      break;
    case 'lazada':
      PlatformScraper = require('../platforms/lazada/scraper');
      config.storageStatePath = path.join(__dirname, '..', 'storage-states', 'lazada.json');
      break;
    default:
      console.error(`❌ Unknown platform: ${config.platform}`);
      process.exit(1);
  }
} catch (error) {
  console.error(`❌ Failed to load platform scraper: ${error.message}`);
  process.exit(1);
}

// Create platform instance
const platformInstance = new PlatformScraper({ url: config.url });

// Create engine
const engine = new ScraperEngine(platformInstance, config);

// Handle graceful shutdown
let isStopping = false;

async function gracefulShutdown(signal) {
  if (isStopping) return;
  isStopping = true;
  
  console.log(`\n🛑 Received ${signal}, stopping gracefully...`);
  await engine.stop();
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start scraping
(async () => {
  try {
    await engine.start();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
})();
