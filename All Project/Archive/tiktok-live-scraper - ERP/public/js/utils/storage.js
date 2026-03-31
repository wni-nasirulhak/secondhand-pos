// Local Storage utility สำหรับเก็บการตั้งค่า
export class Storage {
    constructor(prefix = 'tiktok_scraper_') {
        this.prefix = prefix;
    }

    // บันทึกข้อมูล
    set(key, value) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, data);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    // ดึงข้อมูล
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    // ลบข้อมูล
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    // ล้างข้อมูลทั้งหมด
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    has(key) {
        return localStorage.getItem(this.prefix + key) !== null;
    }

    // ดึงข้อมูลทั้งหมดที่มี prefix
    getAll() {
        const result = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                const shortKey = key.replace(this.prefix, '');
                result[shortKey] = this.get(shortKey);
            }
        });
        
        return result;
    }
}

// Preset Manager สำหรับจัดการการตั้งค่าที่บันทึกไว้
export class PresetManager {
    constructor(storage) {
        this.storage = storage;
        this.presetsKey = 'presets';
    }

    // ดึงรายการ presets ทั้งหมด
    getAll() {
        return this.storage.get(this.presetsKey, []);
    }

    // บันทึก preset ใหม่
    save(name, config) {
        const presets = this.getAll();
        
        // ตรวจสอบว่าชื่อซ้ำหรือไม่
        const existingIndex = presets.findIndex(p => p.name === name);
        
        const preset = {
            id: existingIndex >= 0 ? presets[existingIndex].id : Date.now(),
            name,
            config,
            createdAt: existingIndex >= 0 ? presets[existingIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            presets[existingIndex] = preset;
        } else {
            presets.push(preset);
        }

        this.storage.set(this.presetsKey, presets);
        return preset;
    }

    // โหลด preset
    load(id) {
        const presets = this.getAll();
        return presets.find(p => p.id === id);
    }

    // ลบ preset
    delete(id) {
        const presets = this.getAll();
        const filtered = presets.filter(p => p.id !== id);
        this.storage.set(this.presetsKey, filtered);
        return true;
    }

    // อัปเดต preset
    update(id, config) {
        const presets = this.getAll();
        const index = presets.findIndex(p => p.id === id);
        
        if (index >= 0) {
            presets[index].config = config;
            presets[index].updatedAt = new Date().toISOString();
            this.storage.set(this.presetsKey, presets);
            return presets[index];
        }
        
        return null;
    }
}

// Recent URLs Manager
export class RecentURLsManager {
    constructor(storage, maxItems = 10) {
        this.storage = storage;
        this.maxItems = maxItems;
        this.key = 'recent_urls';
    }

    // ดึงรายการ URLs ล่าสุด
    getAll() {
        return this.storage.get(this.key, []);
    }

    // เพิ่ม URL ใหม่
    add(url) {
        let urls = this.getAll();
        
        // ลบ URL เก่าออกถ้ามี
        urls = urls.filter(u => u !== url);
        
        // เพิ่มไว้ด้านบน
        urls.unshift(url);
        
        // จำกัดจำนวน
        if (urls.length > this.maxItems) {
            urls = urls.slice(0, this.maxItems);
        }
        
        this.storage.set(this.key, urls);
        return urls;
    }

    // ล้างรายการ
    clear() {
        this.storage.remove(this.key);
    }
}
