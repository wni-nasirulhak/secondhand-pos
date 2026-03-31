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

    // หยุด scraper
    async stopScraper() {
        return this.request('/api/stop', {
            method: 'POST'
        });
    }

    // ดึงสถานะ
    async getStatus() {
        return this.request('/api/status');
    }

    // ดึงคอมเมนต์
    async getComments(limit = 100) {
        return this.request(`/api/comments?limit=${limit}`);
    }

    // ดาวน์โหลดคอมเมนต์
    downloadComments(format = 'json') {
        window.open(`${this.baseUrl}/api/download?format=${format}`, '_blank');
    }

    // นำเข้า cookies
    async importCookies(cookiesJson) {
        return this.request('/api/import-cookies', {
            method: 'POST',
            body: JSON.stringify({ cookiesJson })
        });
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
