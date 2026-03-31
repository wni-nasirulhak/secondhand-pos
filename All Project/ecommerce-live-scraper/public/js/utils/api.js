// API utility สำหรับติดต่อกับ server
export class API {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // เริ่ม scraper
    async startScraper(config) {
        return this.request('/api/start', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    // หยุด scraper (รองรับ sessionId)
    async stopScraper(sessionId = null) {
        return this.request('/api/stop', {
            method: 'POST',
            body: JSON.stringify({ sessionId })
        });
    }

    // ดึงรายการ Sessions ทั้งหมด
    async getSessions() {
        return this.request('/api/sessions');
    }

    // ลบ Session
    async deleteSession(sessionId) {
        return this.request(`/api/sessions/${sessionId}`, {
            method: 'DELETE'
        });
    }

    // ดึงสถานะ
    async getStatus() {
        return this.request('/api/status');
    }

    // ดึงคอมเมนต์ (รองรับ sessionId)
    async getComments(limit = 100, sessionId = null) {
        let url = `/api/comments?limit=${limit}`;
        if (sessionId) url += `&sessionId=${sessionId}`;
        return this.request(url);
    }

    // ดาวน์โหลดคอมเมนต์
    downloadComments(format = 'json') {
        window.open(`${this.baseUrl}/api/download?format=${format}`, '_blank');
    }

    // นำเข้า cookies
    async importCookies(cookiesJson, platform = 'tiktok') {
        return this.request('/api/import-cookies', {
            method: 'POST',
            body: JSON.stringify({ cookiesJson, platform })
        });
    }

    // ตรวจสอบสถานะ cookies
    async checkCookies(platform = 'tiktok') {
        return this.request(`/api/check-cookies?platform=${platform}`);
    }

    // จัดการ Mock Rules
    async getMockRules() {
        return this.request('/api/mock-rules');
    }

    async updateMockRules(rules) {
        return this.request('/api/mock-rules', {
            method: 'POST',
            body: JSON.stringify(rules)
        });
    }
}
