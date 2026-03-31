export class MockRulesEditor {
    constructor(container, api) {
        this.container = container;
        this.api = api;
        this.rules = [];
        this.init();
    }

    async init() {
        this.renderLayout();
        await this.loadRules();
        this.addEventListeners();
    }

    addEventListeners() {
        window.addEventListener('tab-change', async (e) => {
            if (e.detail.tab === 'mock-rules') {
                await this.loadRules();
            }
        });
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="mock-rules-editor stack-y gap-lg">
                <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0;">⚙️ จัดการกฎ Mock AI</h2>
                        <p style="margin: 5px 0 0; color: var(--text-secondary); font-size: 14px;">
                            ตั้งค่าคีย์เวิร์ดและคำตอบอัตโนมัติ (Mock AI) สำหรับการตอบโต้ในไลฟ์
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="reset-rules-btn" class="btn btn-secondary" style="background: transparent; border: 1px solid var(--accent-danger); color: var(--accent-danger); font-size: 13px;">
                            🔄 ล้างและใช้ค่าเริ่มต้น
                        </button>
                        <button id="add-rule-btn" class="btn btn-secondary" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
                            ➕ เพิ่มหมวดหมู่
                        </button>
                        <button id="save-rules-btn" class="btn btn-primary" style="background: var(--accent-primary); border: none; padding: 10px 20px; color: white;">
                            💾 บันทึกทั้งหมด
                        </button>
                    </div>
                </div>

                <div id="rules-list" class="stack-y gap-md" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="loading">กำลังโหลดข้อมูล...</div>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 193, 7, 0.1); border-radius: 8px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                        <strong>คำแนะนำ:</strong> <br>
                        - <b>คีย์เวิร์ด:</b> ใส่คำที่ลูกค้ามักจะพิมพ์ คั่นด้วยคอมมา (เช่น: ราคา, เท่าไหร่, กี่บาท) <br>
                        - <b>คำตอบ:</b> ใส่ประโยคที่ต้องการให้บอทตอบ 1 บรรทัดต่อ 1 ข้อความ (ระบบจะสุ่มคำท่ีใส่ไว้มาตอบ) <br>
                        - ใช้ <b>@username</b> ในคำตอบเพื่อแท็กชื่อลูกค้า
                    </p>
                </div>
            </div>
        `;

        this.container.querySelector('#add-rule-btn').addEventListener('click', () => this.addRule());
        this.container.querySelector('#save-rules-btn').addEventListener('click', () => this.saveRules());
        
        const resetBtn = this.container.querySelector('#reset-rules-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }
    }

    async resetToDefaults() {
        if (!confirm('คุณต้องการล้างกฎทั้งหมดและกลับไปใช้ "กฎเริ่มต้น" ใช่หรือไม่? (กฎที่แก้ไว้จะหายไป)')) return;
        
        const defaultRules = [
            { "category": "Price/Interest", "keywords": ["ราคา", "เท่าไหร่", "เท่าไร", "กี่บาท", "บาท", "งบ", "ขอราคา", "แพง", "ถูก", "ลดได้ไหม", "กี่วอน", "พารา", "กี่แมว", "กี่ตุ่ม", "กี่โอ่ง", "บาด", "price", "cost", "มีราคาไหม", "กี่บาทครับ", "กี่บาทค่ะ", "ลดหน่อย", "โปรราคา", "ราคาเท่าไหร่ครับ", "ราคาเท่าไหร่ค่ะ"], "replies": ["ราคาสุดคุ้มเช็คได้ใน Bio หรือกดดูที่ตะกร้าได้เลยครับ! 🏷️", "ราคาพิเศษเฉพาะคนในไลฟ์! ดูรายละเอียดที่ลิงก์หน้าโปรไฟล์ได้เลยครับ", "ราคาประหยัดแน่นอนครับ สนใจทักแชทสอบถามรหัสสินค้าได้เลย!", "เช็คราคาและโปรโมชั่นล่าสุดได้ที่ Bio เลยครับ พ่อค้าลงไว้ให้แล้ว 🙏"] },
            { "category": "Stock/Size", "keywords": ["มีของไหม", "พร้อมส่ง", "มีป่าว", "มีไหม", "ไซส์", "เบอร์", "ขนาด", "สี", "ลาย", "แบบ", "กี่สี", "size", "รอบอก", "เอว", "ยังมีไหม", "เหลือไหม", "มีกี่ไซส์", " XL ", " L ", " M ", " S ", "เบอร์อะไร", "สีอะไรบ้าง", "มีลายไหนบ้าง", "ของหมดยัง", "เติมของยัง"], "replies": ["สินค้าพร้อมส่งครับ! รีบกดก่อนของจะหมดนะครับ 🔥", "มีหลายไซส์หลายสีให้เลือกเลยครับ ดูรายละเอียดเพิ่มเติมในตะกร้าได้เลย", "รุ่นนี้ขายดีมาก ยังพอมีของครับ สนใจไซส์ไหนถามได้เลย!", "ของเพิ่งเข้าเลยครับ พร้อมส่งทุกออเดอร์จ้า 📦"] },
            { "category": "Shipping", "keywords": ["ส่งฟรี", "กี่วันถึง", "ค่าส่ง", "ส่งที่ไหน", "รส", "มรส", "นั่งวิน", "ค่ารถ", "เคอรี่", "flash", "j&t", "ขนส่ง", "ส่งวันไหน", "เลขพัสดุ", "เช็คเลข", "ส่งของยัง", "ส่งกี่โมง", "ได้รับเมื่อไหร่", "kerry", "ไปรษณีย์", "ส่งด่วน"], "replies": ["ส่งฟรีเมื่อสั่งครบยอดครับ! ปกติ 1-2 วันถึงหน้าบ้านเลย 🚚", "เราใช้ขนส่งด่วนครับ ส่งไวแน่นอน เช็คเลขพัสดุได้ในระบบเลย", "ส่งของทุกวันไม่มีวันหยุดครับ เตรียมรับของได้เลย! ✨", "ค่าส่งประหยัดมาก หรือสะสมคูปองส่งฟรีในแอปได้เลยครับ"] },
            { "category": "Payment/Channel", "keywords": ["ปลายทาง", "cod", "โอน", "บัญชี", "จ่ายยังไง", "ชำระ", "บ้านเขียว", "บ้านฟ้า", "บ้านม่วง", "ชาเขียว", "วอลเล็ต", "wallet", "พร้อมเพย์", "promptpay", "จ่ายเงิน", "เก็บเงินปลายทาง", "ตัดบัตร", "ผ่อน", "จ่ายผ่านแอป"], "replies": ["มีบริการเก็บเงินปลายทาง (COD) ครับ สบายใจได้เลย 💸", "โอนหรือจ่ายปลายทางได้หมดครับ ทักแชทขอเลขบัญชีหรือสอบถามวิธีจ่ายได้เลย", "สอบถามเพิ่มเติมได้ที่ \"บ้านเขียว\" หรือทักแชทเพจได้เลยครับ ยินดีบริการ!", "ชำระเงินง่ายๆ ผ่านระบบได้เลยครับ ปลอดภัยแน่นอน"] },
            { "category": "Promotion", "keywords": ["โปร", "แถม", "ลด", "คุ้ม", "ประหยัด", "จัดรายการ", "flash sale", "1แถม1", "ลดอีกได้ไหม", "ราคาส่ง", "เหมา", "โค้ดลด", "คูปอง", "โปรโมชั่น", "มีของแถมไหม", "ลดราคา"], "replies": ["โปรโมชั่นวันนี้คุ้มที่สุด! ซื้อตอนนี้มีของแถมพิเศษด้วยนะ 🎁", "มีโปร 1 แถม 1 อยู่ครับ รีบกดก่อนหมดเวลา Flash Sale!", "ราคานี้ลดไม่ได้แล้วครับ คุ้มกว่านี้ไม่มีอีกแล้ว! 💯", "จัดโปรแรงเพื่อคนในไลฟ์โดยเฉพาะ! ดูที่ตะกร้าได้เลยครับ"] },
            { "category": "Trust/Quality", "keywords": ["แท้ไหม", "ตรงปก", "รีวิว", "ใบเซอร์", "หลอกไหม", "ของปลอม", "เชื่อใจ", "รูปจริง", "งานจริง", "สินค้าจริง", "งานไทย", "มือหนึ่ง", "มือสอง", "สภาพดี", "ตำหนิ"], "replies": ["ของแท้ 100% ครับ ตรงปกแน่นอน ดูคลิปรีวิวหน้าช่องก่อนได้เลย ✅", "การันตีคุณภาพครับ ไม่ตรงปกยินดีคืนเงิน! 🛡️", "รีวิวเยอะมากครับ มั่นใจได้เลย ร้านเราส่งจริงไม่มีโกง", "สินค้างานจริงสวยกว่าในรูปอีกครับ รับรองไม่ผิดหวัง!"] },
            { "category": "Order/CF", "keywords": ["cf", "รับ", "เอา", "จอง", "f", "เอาอันนี้", "รับค่ะ", "รับครับ", "สั่ง", "ยย", "โยนยอด", "จองไว้", "เก็บให้หน่อย", "เอาชิ้นนี้", "เอาตัวนี้", "สั่งซื้อ", "กดสั่งตรงไหน"], "replies": ["รับทราบครับ! แคปจอทักแชท หรือกดสั่งในตะกร้าได้เลยจ้า 🛒", "ขอบคุณที่อุดหนุนครับ! แอดมินจดออเดอร์ไว้แล้ว ทักแชทยืนยันได้เลย", "CF แล้วรบกวนทักแชทภายใน 10 นาทีเพื่อรับโปรนะครับ! 🔥", "ยอดเยี่ยมครับ! รับชิ้นนี้ไปไม่ผิดหวังแน่นอน"] },
            { "category": "Greeting", "keywords": ["สวัสดี", "หวัดดี", "hello", "hi", "มอนิ่ง", "ดีครับ", "ดีค่ะ", "หวัดดีจ้า", "ทักทาย", "สบายดี", "ยินดีที่ได้รู้จัก", "กินข้าวยัง", "มาแล้ว", "เข้าดูครั้งแรก"], "replies": ["สวัสดีครับคุณ @username ยินดีต้อนรับสู่ไลฟ์ครับ! 👋✨", "หวัดดีครับ! วันนี้มีของเด็ดๆ เพียบ อยู่ดูด้วยกันก่อนนะ", "Hello! ยินดีที่ได้รู้จักครับคุณ @username สนใจตัวไหนถามได้เลย", "สวัสดีรอบห้องครับ! ใครเข้ามาแล้วฝากกดหัวใจให้หน่อยนะ ❤️"] },
            { "category": "Compliment/Support", "keywords": ["รัก", "สวย", "ปัง", "ชอบ", "แชร์แล้ว", "หัวใจ", "สู้ๆ", "เก่ง", "น่ารัก", "หล่อ", "เจ๋ง", "เยี่ยม", "แชร์เพิ่ม", "เคาะหัวใจ", "ส่งกำลังใจ"], "replies": ["ขอบคุณมากครับคุณ @username น่ารักที่สุดเลย! ❤️🥰", "ขอบคุณที่ช่วยแชร์นะครับ ขอให้เฮงๆ ปังๆ เช่นกันครับ!", "กำลังใจดีๆ แบบนี้ พ่อค้าสู้ตายเลยครับ ขอบคุณครับ! 🙏✨", "อุ๊ย เขินเลย! ขอบคุณสำหรับคำชมและหัวใจนะครับ"] },
            { "category": "Question", "keywords": ["?", "ไหม", "มั้ย", "อะไร", "ทำไม", "เมื่อไหร่", "ยังไง", "แบบไหน", "ได้ไหม", "เปล่า", "ใช่ไหม", "หรอ", "เหรอ", "สอบถาม", "ถามหน่อย", "คุยด้วยได้ไหม"], "replies": ["คำถามดีมากครับ! เดี๋ยวแอดมินมาตอบให้แบบละเอียดนะ รอสักครู่จ้า 🙏", "เดี๋ยวตอบให้นะครับคุณ @username ขอไล่ตอบตามคิวสักครู่นะ", "สงสัยตรงไหนถามทิ้งไว้ได้เลยครับ เดี๋ยวผมมาสรุปให้ฟังทีเดียวครับ", "รอสักครู่นะครับ เดี๋ยวแอดมินจัดการคำถามให้จ้า"] }
        ];

        this.rules = defaultRules;
        await this.api.updateMockRules(this.rules);
        this.renderRulesList();
        alert('คืนค่าเริ่มต้นเรียบร้อยแล้ว!');
    }

    async loadRules() {
        try {
            this.rules = await this.api.getMockRules();
            this.renderRulesList();
        } catch (error) {
            console.error('Failed to load mock rules:', error);
            this.container.querySelector('#rules-list').innerHTML = `
                <div style="padding: 20px; color: var(--accent-danger); text-align: center;">
                    ❌ เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}
                </div>
            `;
        }
    }

    renderRulesList() {
        const listContainer = this.container.querySelector('#rules-list');
        if (this.rules.length === 0) {
            listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">ยังไม่มีกฎที่ตั้งไว้</div>';
            return;
        }

        listContainer.innerHTML = '';
        this.rules.forEach((rule, index) => {
            const ruleEl = document.createElement('div');
            ruleEl.className = 'card rule-card';
            ruleEl.style.cssText = `
                padding: 15px; 
                border: 1px solid var(--border-color); 
                border-radius: 12px; 
                background: var(--bg-primary); 
                transition: all 0.3s;
                border-left: 4px solid var(--accent-primary);
            `;
            
            const kwCount = (rule.keywords || []).length;
            const repCount = (rule.replies || []).length;

            ruleEl.innerHTML = `
                <div class="stack-y gap-sm">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px; width: 70%;">
                            <input type="text" class="rule-category" value="${rule.category || ''}" placeholder="ชื่อหมวดหมู่" style="
                                font-weight: 700; 
                                font-size: 16px; 
                                border: none; 
                                background: transparent; 
                                color: var(--text-primary);
                                outline: none;
                            ">
                            <span style="font-size: 11px; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 10px; color: var(--text-secondary);">
                                ${kwCount} keywords | ${repCount} replies
                            </span>
                        </div>
                        <button class="delete-rule-btn" data-index="${index}" style="
                            background: rgba(255, 68, 68, 0.1); 
                            color: #ff4444; 
                            border: none; 
                            padding: 5px 10px; 
                            border-radius: 6px; 
                            cursor: pointer;
                            font-size: 12px;
                        ">🗑️ ลบหมวดหมู่</button>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-size: 12px; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">➕ เพิ่ม/แก้ไข คีย์เวิร์ด (คั่นด้วยคอมมา)</label>
                            <textarea class="rule-keywords" placeholder="ราคา, เท่าไหร่, กี่บาท" style="
                                width: 100%; 
                                min-height: 80px; 
                                border-radius: 8px; 
                                border: 1px solid var(--border-color); 
                                background: var(--bg-secondary); 
                                color: var(--text-primary); 
                                padding: 10px;
                                font-size: 14px;
                                resize: vertical;
                                line-height: 1.4;
                            ">${(rule.keywords || []).join(', ')}</textarea>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">💬 เพิ่ม/แก้ไข คำตอบ (บรรทัดละ 1 ข้อความ)</label>
                            <textarea class="rule-replies" placeholder="ราคาดูได้ใน Bio ครับ\nสนใจตัวนี้ทักแชทนะครับ" style="
                                width: 100%; 
                                min-height: 80px; 
                                border-radius: 8px; 
                                border: 1px solid var(--border-color); 
                                background: var(--bg-secondary); 
                                color: var(--text-primary); 
                                padding: 10px;
                                font-size: 14px;
                                resize: vertical;
                                line-height: 1.4;
                            ">${(rule.replies || []).join('\n')}</textarea>
                        </div>
                    </div>
                </div>
            `;

            ruleEl.querySelector('.delete-rule-btn').addEventListener('click', () => {
                this.deleteRule(index);
            });

            listContainer.appendChild(ruleEl);
        });
    }

    addRule() {
        this.updateRulesFromUI();
        this.rules.unshift({
            category: 'หมวดใหม่',
            keywords: [],
            replies: ['สวัสดีครับ @username']
        });
        this.renderRulesList();
    }

    deleteRule(index) {
        if (!confirm('ยืนยันการลบหมวดหมู่นี้?')) return;
        this.updateRulesFromUI();
        this.rules.splice(index, 1);
        this.renderRulesList();
    }

    updateRulesFromUI() {
        const listContainer = this.container.querySelector('#rules-list');
        const cards = listContainer.querySelectorAll('.rule-card');
        
        const newRules = [];
        cards.forEach(card => {
            const category = card.querySelector('.rule-category').value.trim();
            const keywords = card.querySelector('.rule-keywords').value
                .split(',')
                .map(k => k.trim())
                .filter(k => k);
            const replies = card.querySelector('.rule-replies').value
                .split('\n')
                .map(r => r.trim())
                .filter(r => r);

            if (category) {
                newRules.push({ category, keywords, replies });
            }
        });
        
        this.rules = newRules;
    }

    async saveRules() {
        const btn = this.container.querySelector('#save-rules-btn');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = '⏳ กำลังบันทึก...';
            btn.disabled = true;

            this.updateRulesFromUI();
            await this.api.updateMockRules(this.rules);
            
            btn.innerHTML = '✅ บันทึกสำเร็จ!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);

            // Optional: alert user about restart
            console.log('Rules saved successfully. Restart AI Simulator to apply changes.');
        } catch (error) {
            console.error('Failed to save rules:', error);
            alert('บันทึกไม่สำเร็จ: ' + error.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}
