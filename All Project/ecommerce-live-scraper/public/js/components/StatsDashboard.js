// Statistics Dashboard Component
export class StatsDashboard {
    constructor(container) {
        this.container = container;
        this.comments = [];
        this.startTime = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="stats-dashboard">
                <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">📊</span>
                    สถิติ Real-time
                </h3>
                
                <!-- System Health Monitor (Phase 2) -->
                <div id="system-health" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin-bottom: 25px;
                    background: var(--bg-secondary);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                ">
                    <!-- CPU Gauge -->
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; font-size: 14px; color: var(--text-secondary);">💻 CPU Load</span>
                            <span id="cpu-value" style="font-weight: 700; color: #6c5ce7;">0%</span>
                        </div>
                        <div style="height: 10px; background: var(--bg-input); border-radius: 5px; overflow: hidden;">
                            <div id="cpu-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #6c5ce7, #a29bfe); transition: width 0.5s;"></div>
                        </div>
                        <small id="cpu-details" style="font-size: 11px; color: var(--text-secondary); opacity: 0.7;">Detecting cores...</small>
                    </div>

                    <!-- Memory Gauge -->
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; font-size: 14px; color: var(--text-secondary);">🧠 RAM Usage</span>
                            <span id="ram-value" style="font-weight: 700; color: #00d97e;">0%</span>
                        </div>
                        <div style="height: 10px; background: var(--bg-input); border-radius: 5px; overflow: hidden;">
                            <div id="ram-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #00d97e, #b2fef7); transition: width 0.5s;"></div>
                        </div>
                        <small id="ram-details" style="font-size: 11px; color: var(--text-secondary); opacity: 0.7;">Detecting capacity...</small>
                    </div>
                </div>
                
                <!-- Main Stats Grid -->
                <div class="stats-grid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                ">
                    <!-- Total Comments -->
                    <div class="stat-card" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                        border-radius: 12px;
                        color: white;
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">💬 ทั้งหมด</div>
                        <div style="font-size: 32px; font-weight: bold;" id="stat-total">0</div>
                    </div>

                    <!-- Unique Users -->
                    <div class="stat-card" style="
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        padding: 20px;
                        border-radius: 12px;
                        color: white;
                        box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">👥 ผู้ใช้</div>
                        <div style="font-size: 32px; font-weight: bold;" id="stat-users">0</div>
                    </div>

                    <!-- Questions -->
                    <div class="stat-card" style="
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        padding: 20px;
                        border-radius: 12px;
                        color: white;
                        box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">❓ คำถาม</div>
                        <div style="font-size: 32px; font-weight: bold;" id="stat-questions">0</div>
                    </div>

                    <!-- Comments/Min -->
                    <div class="stat-card" style="
                        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                        padding: 20px;
                        border-radius: 12px;
                        color: white;
                        box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">⚡ ต่อนาที</div>
                        <div style="font-size: 32px; font-weight: bold;" id="stat-rate">0.0</div>
                    </div>
                </div>

                <!-- Top Commenters -->
                <div class="top-commenters" style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 20px;
                ">
                    <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span>🏆</span>
                        Top Commenters
                    </h4>
                    <div id="top-commenters-list"></div>
                </div>

                <!-- Activity Timeline -->
                <div class="activity-timeline" style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                ">
                    <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span>📈</span>
                        ความเคลื่อนไหว (5 นาทีล่าสุด)
                    </h4>
                    <div id="activity-bars" style="display: flex; align-items: flex-end; gap: 8px; height: 100px;"></div>
                </div>
            </div>
        `;
    }

    updateStats(comments) {
        this.comments = comments;
        if (!this.startTime && comments.length > 0) {
            this.startTime = new Date(comments[0].timestamp);
        }

        // Calculate stats
        const total = comments.length;
        const uniqueUsers = new Set(comments.map(c => c.username)).size;
        const questions = comments.filter(c => this.isQuestion(c.comment)).length;
        
        // Calculate rate (comments per minute)
        let rate = 0;
        if (this.startTime && comments.length > 0) {
            const now = new Date();
            const elapsed = (now - this.startTime) / 1000 / 60; // minutes
            rate = elapsed > 0 ? (total / elapsed).toFixed(1) : 0;
        }

        // Update UI
        this.updateElement('#stat-total', total);
        this.updateElement('#stat-users', uniqueUsers);
        this.updateElement('#stat-questions', questions);
        this.updateElement('#stat-rate', rate);

        // Update top commenters
        this.updateTopCommenters(comments);

        // Update activity timeline
        this.updateActivityTimeline(comments);
    }

    updateSystemHealth(data) {
        if (!data || !data.metrics) return;
        const metrics = data.metrics;

        // Update CPU
        const cpuBar = this.container.querySelector('#cpu-bar');
        const cpuVal = this.container.querySelector('#cpu-value');
        const cpuDet = this.container.querySelector('#cpu-details');
        if (cpuBar) cpuBar.style.width = `${metrics.cpu.usage}%`;
        if (cpuVal) cpuVal.textContent = `${metrics.cpu.usage}%`;
        if (cpuDet) cpuDet.textContent = `${metrics.cpu.model} (${metrics.cpu.cores} Cores)`;

        // Update RAM
        const ramBar = this.container.querySelector('#ram-bar');
        const ramVal = this.container.querySelector('#ram-value');
        const ramDet = this.container.querySelector('#ram-details');
        if (ramBar) ramBar.style.width = `${metrics.memory.usage}%`;
        if (ramVal) ramVal.textContent = `${metrics.memory.usage}%`;
        if (ramDet) ramDet.textContent = `Used ${metrics.memory.used}GB of ${metrics.memory.total}GB`;

        // Color transition based on load
        if (metrics.cpu.usage > 80) cpuBar.style.background = '#f5576c';
        else if (metrics.cpu.usage > 50) cpuBar.style.background = '#feca57';
        else cpuBar.style.background = 'linear-gradient(90deg, #6c5ce7, #a29bfe)';

        if (metrics.memory.usage > 90) ramBar.style.background = '#f5576c';
        else if (metrics.memory.usage > 70) ramBar.style.background = '#feca57';
        else ramBar.style.background = 'linear-gradient(90deg, #00d97e, #b2fef7)';
    }

    updateElement(selector, value) {
        const el = this.container.querySelector(selector);
        if (el) {
            // Animate number change
            const oldValue = parseInt(el.textContent) || 0;
            const newValue = parseInt(value) || 0;
            
            if (oldValue !== newValue) {
                el.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 200);
            }
            
            el.textContent = value;
        }
    }

    updateTopCommenters(comments) {
        const listEl = this.container.querySelector('#top-commenters-list');
        if (!listEl) return;

        // Count comments per user
        const userCounts = {};
        comments.forEach(c => {
            userCounts[c.username] = (userCounts[c.username] || 0) + 1;
        });

        // Sort and get top 5
        const topUsers = Object.entries(userCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (topUsers.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    ยังไม่มีข้อมูล
                </div>
            `;
            return;
        }

        // Render top commenters
        listEl.innerHTML = topUsers.map(([username, count], index) => {
            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
            const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4A90E2', '#7B68EE'];
            
            return `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin-bottom: 8px;
                    background: var(--bg-input);
                    border-radius: 8px;
                    border-left: 3px solid ${colors[index]};
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">${medals[index]}</span>
                        <strong style="color: var(--text-primary);">${this.escapeHtml(username)}</strong>
                    </div>
                    <div style="
                        background: ${colors[index]}20;
                        color: ${colors[index]};
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 14px;
                    ">
                        ${count} คอมเมนต์
                    </div>
                </div>
            `;
        }).join('');
    }

    updateActivityTimeline(comments) {
        const barsEl = this.container.querySelector('#activity-bars');
        if (!barsEl) return;

        // Group by minute (last 5 minutes)
        const now = new Date();
        const fiveMinAgo = new Date(now - 5 * 60 * 1000);
        
        const recentComments = comments.filter(c => new Date(c.timestamp) > fiveMinAgo);
        
        // Group by minute
        const minuteCounts = {};
        for (let i = 4; i >= 0; i--) {
            const minute = new Date(now - i * 60 * 1000);
            const key = minute.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            minuteCounts[key] = 0;
        }

        recentComments.forEach(c => {
            const time = new Date(c.timestamp);
            const key = time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            if (key in minuteCounts) {
                minuteCounts[key]++;
            }
        });

        // Find max for scaling
        const maxCount = Math.max(...Object.values(minuteCounts), 1);

        // Render bars
        barsEl.innerHTML = Object.entries(minuteCounts).map(([time, count]) => {
            const height = (count / maxCount) * 100;
            const color = count > 0 ? '#43e97b' : '#333';
            
            return `
                <div style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                ">
                    <div style="
                        width: 100%;
                        height: ${height}%;
                        background: ${color};
                        border-radius: 4px 4px 0 0;
                        transition: all 0.3s ease;
                        position: relative;
                    " title="${count} คอมเมนต์">
                        ${count > 0 ? `<div style="
                            position: absolute;
                            top: -20px;
                            left: 50%;
                            transform: translateX(-50%);
                            font-size: 12px;
                            font-weight: 600;
                            color: ${color};
                        ">${count}</div>` : ''}
                    </div>
                    <div style="
                        font-size: 10px;
                        color: var(--text-secondary);
                        white-space: nowrap;
                    ">${time.split(':')[1]}</div>
                </div>
            `;
        }).join('');
    }

    isQuestion(comment) {
        const text = comment.toLowerCase();
        const thaiQuestions = ['ไหม', 'หรือ', 'อะไร', 'ทำไม', 'เมื่อไหร่', 'ที่ไหน', 'ยังไง', 'คือ', 'มั้ย', 'หรอ', 'เหรอ'];
        return text.includes('?') || thaiQuestions.some(word => text.includes(word));
    }

    reset() {
        this.comments = [];
        this.startTime = null;
        this.updateStats([]);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
