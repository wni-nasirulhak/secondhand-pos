/**
 * CDP Diagnostic Test
 * Tests if Chrome can be launched and connected via CDP
 */
const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PORT = 9222;
const USER_DATA  = `C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Google\\Chrome\\User Data`;
const PROFILE    = 'Default';

// ---- 1. ค้นหา Chrome Executable ----
function findChrome() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe')
    ];
    const found = candidates.find(p => fs.existsSync(p));
    if (!found) throw new Error('Chrome ไม่เจอ! กรุณาติดตั้ง Google Chrome');
    return found;
}

// ---- 2. HTTP GET ----
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// ---- 3. รอ CDP พร้อม ----
async function waitForCDP(port, maxWait = 10000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
        try {
            const data = await httpGet(`http://127.0.0.1:${port}/json/version`);
            const info = JSON.parse(data);
            return info;
        } catch {
            await new Promise(r => setTimeout(r, 500));
        }
    }
    throw new Error(`CDP ไม่พร้อมภายใน ${maxWait}ms`);
}

async function main() {
    console.log('=== CDP Diagnostic Test ===\n');

    // ---- Step 1: ตรวจ Chrome ----
    let chromePath;
    try {
        chromePath = findChrome();
        console.log('✅ 1. Chrome พบที่:', chromePath);
    } catch (e) {
        console.error('❌ 1.', e.message);
        process.exit(1);
    }

    // ---- Step 2: ตรวจว่า Port 9222 ว่างไหม ----
    console.log('\n🔍 2. ตรวจสอบ Port', PORT, '...');
    try {
        const existing = await httpGet(`http://127.0.0.1:${PORT}/json/version`);
        const info = JSON.parse(existing);
        console.log('⚠️  Port', PORT, 'ถูกใช้อยู่แล้วโดย:', info.Browser);
        console.log('   เบราว์เซอร์เดิมยังเปิดอยู่ — จะใช้ตัวนี้เลย');
        
        // ทดสอบเปิดหน้า URL
        await testNavigate(PORT);
        return;
    } catch {
        console.log('✅ Port', PORT, 'ว่าง — จะเปิด Chrome ใหม่');
    }

    // ---- Step 3: เปิด Chrome ----
    console.log('\n🚀 3. กำลังเปิด Chrome...');
    console.log('   User Data:', USER_DATA);
    console.log('   Profile:', PROFILE);

    const args = [
        `--user-data-dir=${USER_DATA}`,
        `--profile-directory=${PROFILE}`,
        `--remote-debugging-port=${PORT}`,
        '--remote-allow-origins=*',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-restore-session-state',
    ];

    const chromeProc = spawn(chromePath, args, { detached: true, stdio: 'ignore' });
    chromeProc.unref();
    console.log('   PID Chrome:', chromeProc.pid);

    // ---- Step 4: รอ CDP ----
    console.log('\n⏳ 4. รอ CDP พร้อม...');
    let cdpInfo;
    try {
        cdpInfo = await waitForCDP(PORT, 12000);
        console.log('✅ CDP พร้อมแล้ว!');
        console.log('   Browser:', cdpInfo.Browser);
        console.log('   Debugger URL:', cdpInfo.webSocketDebuggerUrl);
    } catch (e) {
        console.error('❌ 4.', e.message);
        console.error('   → Chrome อาจไม่ยอมเปิดพอร์ต CDP หรือ Profile ถูกล็อค');
        process.exit(1);
    }

    // ---- Step 5: ดู Tabs ----
    console.log('\n📑 5. ดู Tabs ที่เปิดอยู่...');
    const tabsRaw = await httpGet(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = JSON.parse(tabsRaw);
    console.log('   จำนวน Tab:', tabs.length);
    tabs.forEach((t, i) => console.log(`   [${i}] ${t.type} — ${t.url}`));

    // ---- Step 6: ทดสอบ Navigate ----
    await testNavigate(PORT);
}

async function testNavigate(port) {
    const { chromium } = require('playwright');
    console.log('\n🔌 6. กำลังต่อ Playwright ผ่าน CDP...');
    try {
        const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 10000 });
        console.log('✅ Playwright เชื่อมต่อสำเร็จ!');

        const contexts = browser.contexts();
        console.log('   Contexts:', contexts.length);
        const context = contexts[0];

        console.log('\n🌐 7. เปิด Tab ใหม่แล้วไปที่ TikTok...');
        const page = await context.newPage();
        await page.goto('https://www.tiktok.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log('✅ เปิด TikTok สำเร็จ! URL:', page.url());

        const title = await page.title();
        console.log('   Title:', title);

        await page.close();
        await browser.close();
        console.log('\n🎉 ทดสอบสำเร็จทุกขั้นตอน!');
    } catch (e) {
        console.error('❌ 6/7.', e.message);
        process.exit(1);
    }
}

main().catch(e => {
    console.error('❌ Fatal:', e.message);
    process.exit(1);
});
