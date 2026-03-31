// Component สำหรับแสดงสถานะ
export class StatusBar {
    constructor(container) {
        this.container = container;
        this.status = 'idle';
        this.startTime = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="status-bar">
                <div class="status-item">
                    <span class="status-label">สถานะ:</span>
                    <span id="status-text" class="status-value status-idle">⚪ พร้อมใช้งาน</span>
                </div>
                
                <div class="status-item">
                    <span class="status-label">เวลาที่ใช้:</span>
                    <span id="elapsed-time" class="status-value">00:00:00</span>
                </div>

                <div class="status-item">
                    <span class="status-label">คอมเมนต์/นาที:</span>
                    <span id="comments-per-min" class="status-value">0</span>
                </div>

                <div class="status-item">
                    <span class="status-label">Live URL:</span>
                    <span id="current-url" class="status-value">-</span>
                </div>
            </div>
        `;
    }

    setStatus(status, message = null) {
        this.status = status;
        const statusText = this.container.querySelector('#status-text');
        
        const statusMap = {
            idle: { icon: '⚪', text: 'พร้อมใช้งาน', class: 'status-idle' },
            running: { icon: '🟢', text: 'กำลังดึงคอมเมนต์...', class: 'status-running' },
            error: { icon: '🔴', text: message || 'เกิดข้อผิดพลาด', class: 'status-error' },
            stopped: { icon: '🟡', text: 'หยุดการทำงาน', class: 'status-stopped' }
        };

        const statusInfo = statusMap[status] || statusMap.idle;
        
        statusText.className = `status-value ${statusInfo.class}`;
        statusText.textContent = `${statusInfo.icon} ${statusInfo.text}`;
    }

    start() {
        this.startTime = Date.now();
        this.setStatus('running');
        this.updateElapsedTime();
    }

    stop() {
        this.startTime = null;
        this.setStatus('stopped');
    }

    updateElapsedTime() {
        if (!this.startTime) return;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');

        const elapsedTime = this.container.querySelector('#elapsed-time');
        elapsedTime.textContent = `${hours}:${minutes}:${seconds}`;

        if (this.status === 'running') {
            setTimeout(() => this.updateElapsedTime(), 1000);
        }
    }

    updateStats(commentCount) {
        if (!this.startTime) return;

        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        const commentsPerMin = elapsedMinutes > 0 
            ? Math.round(commentCount / elapsedMinutes) 
            : 0;

        const commentsPerMinEl = this.container.querySelector('#comments-per-min');
        commentsPerMinEl.textContent = commentsPerMin;
    }

    setUrl(url) {
        const urlEl = this.container.querySelector('#current-url');
        
        if (url) {
            // แสดงแค่ @username
            const match = url.match(/@([^/]+)/);
            const username = match ? `@${match[1]}` : url;
            urlEl.textContent = username;
            urlEl.title = url; // แสดง full URL ตอน hover
        } else {
            urlEl.textContent = '-';
            urlEl.title = '';
        }
    }

    error(message) {
        this.setStatus('error', message);
        this.startTime = null;
    }
}
