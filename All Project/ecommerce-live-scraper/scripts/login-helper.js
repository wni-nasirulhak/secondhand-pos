/**
 * TikTok Login Helper
 * Supports Chromium and Firefox
 */
const { chromium, firefox } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const browserType = args.includes('--browser') ? args[args.indexOf('--browser') + 1] : 'chromium';
const playwrightBrowser = browserType === 'firefox' ? firefox : chromium;

const STATE_FILE = path.join(__dirname, '..', 'user-data', 'tiktok_state.json');

async function main() {
    console.log(`=== TikTok Login Helper (${browserType}) ===\n`);
    console.log('📌 เปิดหน้า TikTok ให้คุณล็อกอิน...');
    console.log('   1. ล็อกอินให้เรียบร้อยในหน้าต่างที่เปิดขึ้นมา');
    console.log('   2. กลับมาที่ Terminal และกด Enter เพื่อบันทึก session');

    const browser = await playwrightBrowser.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.tiktok.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('\n✅ เปิดหน้า TikTok แล้ว — กรุณาล็อกอินในหน้าต่างที่เปิดขึ้นมา');

    await new Promise((resolve) => {
        process.stdin.once('data', resolve);
        console.log('\n⏸️  กรุณากด Enter หลังล็อกอินเสร็จแล้ว...');
    });

    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await context.storageState({ path: STATE_FILE });
    console.log(`\n✅ บันทึก session (${browserType}) แล้ว! ไฟล์: ${STATE_FILE}`);

    await browser.close();
    console.log('\n✅ เสร็จสิ้น!');
    process.exit(0);
}

main().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
