// Error Handler Component with retry and recovery
export class ErrorHandler {
    constructor(container) {
        this.container = container;
        this.errors = [];
        this.maxErrors = 50;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="error-handler">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="display: flex; align-items: center; gap: 8px; margin: 0;">
                        <span style="font-size: 20px;">🛡️</span>
                        ระบบจัดการข้อผิดพลาด
                    </h3>
                    <button id="btn-clear-errors" class="btn btn-small" style="background: #f46a6a;">
                        🗑️ ล้างทั้งหมด
                    </button>
                </div>

                <!-- Error Summary -->
                <div class="error-summary" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin-bottom: 20px;
                ">
                    <div style="
                        background: linear-gradient(135deg, #f46a6a 0%, #d63031 100%);
                        padding: 15px;
                        border-radius: 8px;
                        color: white;
                    ">
                        <div style="font-size: 12px; opacity: 0.9;">🚨 Errors</div>
                        <div style="font-size: 24px; font-weight: bold;" id="error-count">0</div>
                    </div>

                    <div style="
                        background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
                        padding: 15px;
                        border-radius: 8px;
                        color: white;
                    ">
                        <div style="font-size: 12px; opacity: 0.9;">⚠️ Warnings</div>
                        <div style="font-size: 24px; font-weight: bold;" id="warning-count">0</div>
                    </div>

                    <div style="
                        background: linear-gradient(135deg, #55efc4 0%, #00b894 100%);
                        padding: 15px;
                        border-radius: 8px;
                        color: white;
                    ">
                        <div style="font-size: 12px; opacity: 0.9;">✅ Recovered</div>
                        <div style="font-size: 24px; font-weight: bold;" id="recovered-count">0</div>
                    </div>
                </div>

                <!-- Error List -->
                <div id="error-list" style="
                    max-height: 400px;
                    overflow-y: auto;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                "></div>
            </div>
        `;

        this.attachEvents();
        this.updateErrorList();
    }

    attachEvents() {
        const btnClear = this.container.querySelector('#btn-clear-errors');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (confirm('ต้องการล้างข้อผิดพลาดทั้งหมด?')) {
                    this.clearErrors();
                }
            });
        }
    }

    logError(error) {
        const errorObj = {
            id: Date.now(),
            type: 'error',
            message: error.message || error,
            timestamp: new Date(),
            recovered: false,
            retryCount: 0
        };

        this.errors.unshift(errorObj);
        
        // Limit errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        this.updateErrorList();
        return errorObj.id;
    }

    logWarning(message) {
        const warningObj = {
            id: Date.now(),
            type: 'warning',
            message: message,
            timestamp: new Date(),
            recovered: false
        };

        this.errors.unshift(warningObj);
        
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        this.updateErrorList();
    }

    markRecovered(errorId) {
        const error = this.errors.find(e => e.id === errorId);
        if (error) {
            error.recovered = true;
            error.recoveredAt = new Date();
            this.updateErrorList();
        }
    }

    incrementRetry(errorId) {
        const error = this.errors.find(e => e.id === errorId);
        if (error) {
            error.retryCount = (error.retryCount || 0) + 1;
            this.updateErrorList();
        }
    }

    clearErrors() {
        this.errors = [];
        this.updateErrorList();
    }

    updateErrorList() {
        const listEl = this.container.querySelector('#error-list');
        if (!listEl) return;

        // Update counts
        const errorCount = this.errors.filter(e => e.type === 'error' && !e.recovered).length;
        const warningCount = this.errors.filter(e => e.type === 'warning' && !e.recovered).length;
        const recoveredCount = this.errors.filter(e => e.recovered).length;

        this.updateElement('#error-count', errorCount);
        this.updateElement('#warning-count', warningCount);
        this.updateElement('#recovered-count', recoveredCount);

        // Render errors
        if (this.errors.length === 0) {
            listEl.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                    <p>ไม่มีข้อผิดพลาด</p>
                    <small>ระบบทำงานปกติ</small>
                </div>
            `;
            return;
        }

        listEl.innerHTML = this.errors.map(error => {
            const bgColor = error.recovered ? '#00b89420' : 
                           error.type === 'error' ? '#f46a6a20' : '#fdcb6e20';
            const borderColor = error.recovered ? '#00b894' : 
                               error.type === 'error' ? '#f46a6a' : '#fdcb6e';
            const icon = error.recovered ? '✅' : 
                        error.type === 'error' ? '🚨' : '⚠️';

            return `
                <div style="
                    background: ${bgColor};
                    border-left: 3px solid ${borderColor};
                    padding: 12px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 18px;">${icon}</span>
                            <strong style="color: ${borderColor};">
                                ${error.type === 'error' ? 'Error' : 'Warning'}
                                ${error.retryCount > 0 ? ` (Retry: ${error.retryCount})` : ''}
                            </strong>
                        </div>
                        <small style="color: var(--text-secondary);">
                            ${this.formatTime(error.timestamp)}
                        </small>
                    </div>
                    <div style="color: var(--text-primary); margin-left: 26px;">
                        ${this.escapeHtml(error.message)}
                    </div>
                    ${error.recovered ? `
                        <div style="
                            margin-top: 8px;
                            margin-left: 26px;
                            padding: 5px 10px;
                            background: #00b89440;
                            border-radius: 4px;
                            color: #00b894;
                            font-size: 12px;
                            display: inline-block;
                        ">
                            ✅ แก้ไขแล้ว ${this.formatTime(error.recoveredAt)}
                        </div>
                    ` : ''}
                    ${error.solution ? `
                        <div style="
                            margin-top: 8px;
                            margin-left: 26px;
                            padding: 8px;
                            background: var(--bg-input);
                            border-radius: 4px;
                            font-size: 13px;
                            color: var(--text-secondary);
                        ">
                            💡 <strong>วิธีแก้:</strong> ${error.solution}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    updateElement(selector, value) {
        const el = this.container.querySelector(selector);
        if (el) el.textContent = value;
    }

    formatTime(date) {
        return date.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get error solutions based on error message
    getSolution(errorMessage) {
        const message = errorMessage.toLowerCase();
        
        if (message.includes('network') || message.includes('connection')) {
            return 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือลอง Retry อีกครั้ง';
        }
        
        if (message.includes('timeout')) {
            return 'เพิ่มเวลา timeout หรือลดความถี่ในการดึงข้อมูล';
        }
        
        if (message.includes('cookie') || message.includes('auth')) {
            return 'ตรวจสอบคุกกี้ หรือลอง Login ใหม่';
        }
        
        if (message.includes('selector') || message.includes('element')) {
            return 'TikTok อาจเปลี่ยน UI ใหม่ ต้องอัพเดท Selector';
        }
        
        if (message.includes('rate limit')) {
            return 'ถูกจำกัดความเร็ว ลองเพิ่ม Interval หรือใช้ Proxy';
        }
        
        return null;
    }
}
