// Component สำหรับควบคุมการทำงาน
export class ControlPanel {
    constructor(container, callbacks = {}) {
        this.container = container;
        this.callbacks = callbacks;
        this.isRunning = false;
        this.render();
        this.attachEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="control-panel">
                <button id="btn-start" class="btn btn-primary">
                    <span class="btn-icon">▶️</span>
                    เริ่มดึงคอมเมนต์
                </button>
                
                <button id="btn-stop" class="btn btn-danger" disabled>
                    <span class="btn-icon">⏹️</span>
                    หยุด
                </button>

                <button id="btn-download-json" class="btn btn-secondary">
                    <span class="btn-icon">💾</span>
                    ดาวน์โหลด JSON
                </button>

                <button id="btn-download-csv" class="btn btn-secondary">
                    <span class="btn-icon">📊</span>
                    ดาวน์โหลด CSV
                </button>

                <button id="btn-clear" class="btn btn-warning">
                    <span class="btn-icon">🗑️</span>
                    ล้างคอมเมนต์
                </button>
            </div>
        `;
    }

    attachEvents() {
        const btnStart = this.container.querySelector('#btn-start');
        const btnStop = this.container.querySelector('#btn-stop');
        const btnDownloadJson = this.container.querySelector('#btn-download-json');
        const btnDownloadCsv = this.container.querySelector('#btn-download-csv');
        const btnClear = this.container.querySelector('#btn-clear');

        btnStart.addEventListener('click', () => {
            if (this.callbacks.onStart) {
                this.callbacks.onStart();
            }
        });

        btnStop.addEventListener('click', () => {
            if (this.callbacks.onStop) {
                this.callbacks.onStop();
            }
        });

        btnDownloadJson.addEventListener('click', () => {
            if (this.callbacks.onDownload) {
                this.callbacks.onDownload('json');
            }
        });

        btnDownloadCsv.addEventListener('click', () => {
            if (this.callbacks.onDownload) {
                this.callbacks.onDownload('csv');
            }
        });

        btnClear.addEventListener('click', () => {
            if (this.callbacks.onClear) {
                this.callbacks.onClear();
            }
        });
    }

    setRunning(running) {
        this.isRunning = running;
        const btnStart = this.container.querySelector('#btn-start');
        const btnStop = this.container.querySelector('#btn-stop');

        if (running) {
            btnStart.disabled = true;
            btnStop.disabled = false;
            btnStart.innerHTML = `
                <span class="btn-icon">⏳</span>
                กำลังดึงคอมเมนต์...
            `;
        } else {
            btnStart.disabled = false;
            btnStop.disabled = true;
            btnStart.innerHTML = `
                <span class="btn-icon">▶️</span>
                เริ่มดึงคอมเมนต์
            `;
        }
    }
}
