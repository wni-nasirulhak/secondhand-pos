/**
 * Manual Cookie Importer for Playwright
 * แปลงไฟล์คุกกี้ทั่วไปให้เป็น format ของ StorageState
 */
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'cookies_to_import.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'user-data', 'tiktok_state.json');

function main() {
    console.log('=== Manual Cookie Importer ===\n');

    if (!fs.existsSync(INPUT_FILE)) {
        // สร้างไฟล์ตัวอย่างให้
        const template = [
            {
                "name": "sessionid",
                "value": "YOUR_SESSION_ID_HERE",
                "domain": ".tiktok.com",
                "path": "/",
                "expires": -1,
                "httpOnly": true,
                "secure": true,
                "sameSite": "Lax"
            }
        ];
        fs.writeFileSync(INPUT_FILE, JSON.stringify(template, null, 2), 'utf8');
        console.log(`⚠️ ไม่พบไฟล์ ${INPUT_FILE}`);
        console.log(`📝 ผมสร้างไฟล์ Template ให้แล้ว กรุณาเปิดไฟล์ cookies_to_import.json แล้ววางคุกกี้ลงไป`);
        console.log(`🚀 เสร็จแล้วให้รันคำสั่งนี้อีกรอบครับ`);
        return;
    }

    try {
        const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
        let cookies = JSON.parse(rawData);

        // ถ้าไฟล์ที่ก๊อปมาเป็น object ที่มี cookies อยู่ข้างใน (เช่นจาก EditThisCookie)
        if (!Array.isArray(cookies) && cookies.cookies) {
            cookies = cookies.cookies;
        }

        // ตรวจสอบว่าเป็น Array หรือไม่
        if (!Array.isArray(cookies)) {
            throw new Error('คุกกี้ต้องเป็น Array ของ Object ครับ');
        }

        // เตรียมโครงสร้าง StorageState
        const storageState = {
            cookies: cookies.map(c => {
                let sameSite = (c.sameSite || 'Lax').toLowerCase();
                // Normalize sameSite to Playwright expected values: 'Strict', 'Lax', or 'None'
                if (sameSite === 'no_restriction' || sameSite === 'none') {
                    sameSite = 'None';
                } else if (sameSite === 'strict') {
                    sameSite = 'Strict';
                } else {
                    sameSite = 'Lax';
                }

                return {
                    name: c.name,
                    value: c.value,
                    domain: c.domain || '.tiktok.com',
                    path: c.path || '/',
                    expires: c.expirationDate || c.expires || -1,
                    httpOnly: c.httpOnly || false,
                    secure: c.secure || false,
                    sameSite: sameSite
                };
            }),
            origins: []
        };

        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(storageState, null, 2), 'utf8');
        console.log(`✅ นำเข้าคุกกี้สำเร็จ! บันทึกไปที่: ${OUTPUT_FILE}`);
        console.log(`🔗 ตอนนี้คุณสามารถใช้โหมด "StorageState" ใน UI ได้เลยครับ`);

    } catch (e) {
        console.error(`❌ ผิดพลาด: ${e.message}`);
    }
}

main();
