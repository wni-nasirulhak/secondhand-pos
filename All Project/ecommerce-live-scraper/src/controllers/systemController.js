const os = require('os');

/**
 * Fetch system health metrics (CPU, RAM, Uptime)
 */
async function getSystemHealth(req, res) {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsage = (usedMem / totalMem) * 100;

        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        
        // Simple CPU usage estimation (1 min load avg / core count)
        const cpuUsage = (loadAvg[0] / cpus.length) * 100;

        res.json({
            success: true,
            metrics: {
                cpu: {
                    usage: Math.min(cpuUsage, 100).toFixed(1),
                    cores: cpus.length,
                    model: cpus[0].model
                },
                memory: {
                    total: (totalMem / (1024 * 1024 * 1024)).toFixed(2), // GB
                    used: (usedMem / (1024 * 1024 * 1024)).toFixed(2),   // GB
                    usage: memUsage.toFixed(1)
                },
                uptime: os.uptime(),
                platform: os.platform()
            }
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

module.exports = {
    getSystemHealth
};
