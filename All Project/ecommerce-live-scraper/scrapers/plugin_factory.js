
const TikTokPlugin = require('./tiktok_plugin');
const ShopeePlugin = require('./shopee_plugin');
const LazadaPlugin = require('./lazada_plugin');
const FacebookPlugin = require('./facebook_plugin');
const InstagramPlugin = require('./instagram_plugin');
const YouTubePlugin = require('./youtube_plugin');

class PluginFactory {
    static getPlugin(page, config) {
        const url = config.url.toLowerCase();
        
        if (url.includes('tiktok.com')) {
            console.error('✅ Loading TikTok Plugin');
            return new TikTokPlugin(page, config);
        } else if (url.includes('shopee.co.th') || url.includes('shopee.tw') || url.includes('shopee.vn')) {
            console.error('✅ Loading Shopee Plugin');
            return new ShopeePlugin(page, config);
        } else if (url.includes('lazada.co.th') || url.includes('lazada.sg')) {
            console.error('✅ Loading Lazada Plugin');
            return new LazadaPlugin(page, config);
        } else if (url.includes('facebook.com')) {
            console.error('✅ Loading Facebook Plugin');
            return new FacebookPlugin(page, config);
        } else if (url.includes('instagram.com')) {
            console.error('✅ Loading Instagram Plugin');
            return new InstagramPlugin(page, config);
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            console.error('✅ Loading YouTube Plugin');
            return new YouTubePlugin(page, config);
        }
        
        throw new Error(`Platform not supported: ${url}`);
    }
}

module.exports = PluginFactory;
