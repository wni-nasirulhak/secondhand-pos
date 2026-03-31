/**
 * Platform Adapters - Auto-registration
 */

const PlatformRegistry = require('./PlatformRegistry');
const TikTokAdapter = require('./tiktok/TikTokAdapter');
const ShopeeAdapter = require('./shopee/ShopeeAdapter');
const LazadaAdapter = require('./lazada/LazadaAdapter');

// Register all platform adapters
PlatformRegistry.register('tiktok', TikTokAdapter);
PlatformRegistry.register('shopee', ShopeeAdapter);
PlatformRegistry.register('lazada', LazadaAdapter);

module.exports = PlatformRegistry;
