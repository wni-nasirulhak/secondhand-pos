
const { chromium, firefox } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
firefox.use(stealth);

const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');
const PluginFactory = require('../scrapers/plugin_factory');

// Parse Arguments
const args = process.argv.slice(2);
const getValue = (flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : null;

const config = {
    url: getValue('--url') || '',
    duration: parseInt(getValue('--duration')) || 60,
    interval: parseInt(getValue('--interval')) || 3,
    browser: getValue('--browser') || 'chromium',
    mode: getValue('--mode') || 'read',
    headless: args.includes('--headless'),
    usePersistent: args.includes('--persistent'),
    chromePath: getValue('--chrome-profile'),
    stealth: args.includes('--stealth'),
    replyCooldown: parseInt(getValue('--reply-cooldown')) || 5,
    replyOnQuestion: args.includes('--reply-on-question'),
    replyTemplates: getValue('--reply-templates') ? JSON.parse(getValue('--reply-templates')) : [],
    blacklist: getValue('--blacklist') ? JSON.parse(getValue('--blacklist')) : [],
    whitelist: getValue('--whitelist') ? JSON.parse(getValue('--whitelist')) : [],
    viplist: getValue('--viplist') ? JSON.parse(getValue('--viplist')) : [],
    webhooks: getValue('--webhooks') ? JSON.parse(getValue('--webhooks')) : [],
    aiWebhookUrl: getValue('--ai-webhook-url'),
    hostUsername: getValue('--host-username')
};

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

// ---- Helpers ----
function getPlatform(url) {
    const val = url.toLowerCase();
    if (val.includes('tiktok.com')) return 'tiktok';
    if (val.includes('shopee')) return 'shopee';
    if (val.includes('lazada')) return 'lazada';
    if (val.includes('facebook.com')) return 'facebook';
    if (val.includes('instagram.com')) return 'instagram';
    if (val.includes('youtube.com') || val.includes('youtu.be')) return 'youtube';
    return 'tiktok'; // Default
}
function findChromeExe() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe')
    ];
    return candidates.find(p => fs.existsSync(p)) || null;
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function waitForCDP(port, maxWait = 15000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
        try {
            const data = await httpGet(`http://127.0.0.1:${port}/json/version`);
            return JSON.parse(data);
        } catch {
            await new Promise(r => setTimeout(r, 500));
        }
    }
    throw new Error(`CDP connection timeout on port ${port}`);
}

async function main() {
    console.error('🔴 Starting Unified Scraper Hub...');
    console.error(`⚙️  Platform Target: ${config.url}`);
    console.error(`⚙️  Browser: ${config.browser} | Mode: ${config.mode}`);

    const playwrightBrowser = config.browser === 'firefox' ? firefox : chromium;
    let browserInstance, context, page;

    try {
        // 1. Launch Browser
        if (config.chromePath && config.browser === 'chromium') {
            // MODE: Chrome Profile via CDP
            const CDP_PORT = 9229;
            let userDataDir = config.chromePath;
            let profileDir = 'Default';

            const parts = config.chromePath.replace(/\\/g, '/').split('/');
            const last = parts[parts.length - 1];
            if (last === 'Default' || last.startsWith('Profile ')) {
                profileDir = last;
                userDataDir = config.chromePath.substring(0, config.chromePath.length - last.length - 1);
            }

            console.error('🛑 Closing existing Chrome instances...');
            await new Promise(r => require('child_process').exec('taskkill /F /IM chrome.exe /T', () => r()));
            await new Promise(r => setTimeout(r, 2000));

            const chromeBin = findChromeExe();
            if (!chromeBin) throw new Error('Chrome executable not found');

            const chromeArgs = [
                `--user-data-dir=${userDataDir}`,
                `--profile-directory=${profileDir}`,
                `--remote-debugging-port=${CDP_PORT}`,
                '--remote-allow-origins=*',
                '--no-first-run',
                '--no-default-browser-check'
            ];
            if (config.headless) chromeArgs.push('--headless');
            
            console.error(`🚀 Launching Chrome Profile: ${profileDir}`);
            spawn(chromeBin, chromeArgs, { detached: true, stdio: 'ignore' }).unref();
            await waitForCDP(CDP_PORT, 15000);

            browserInstance = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
            context = browserInstance.contexts()[0];
            page = await context.newPage({ viewport: DEFAULT_VIEWPORT });
        } else {
            // MODE: Standard Launch (with StorageState if exists)
            const platform = getPlatform(config.url);
            const stateFile = path.join(__dirname, '..', 'storage-states', `${platform}.json`);
            const ctxOpts = { viewport: DEFAULT_VIEWPORT };
            
            if (fs.existsSync(stateFile)) {
                console.error(`🔐 Using saved storage state for: ${platform}`);
                ctxOpts.storageState = stateFile;
            }
            
            browserInstance = await playwrightBrowser.launch({ headless: config.headless });
            context = await browserInstance.newContext(ctxOpts);
            page = await context.newPage();
        }

        // 2. Navigate
        console.error(`🔗 Navigating: ${config.url}`);
        await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

        // 3. Load & Start Plugin
        const plugin = PluginFactory.getPlugin(page, config);
        await plugin.start();

    } catch (err) {
        console.error(`❌ Fatal Error: ${err.message}`);
        process.exit(1);
    } finally {
        if (browserInstance) await browserInstance.close();
        if (context) await context.close();
        console.error('✅ Scraper session finished');
    }
}

// Graceful Shutdown
process.on('SIGINT', () => {
    console.error('🛑 SIGINT received, exiting...');
    process.exit(0);
});

main();
