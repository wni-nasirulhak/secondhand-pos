const express = require('express');
const path = require('path');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('=========================================');
console.log('🚀 ECOM SCRAPER HUB: MODULAR VERSION ACTIVE');
console.log('📁 MAIN ENTRY:', __filename);
console.log('=========================================');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);

// General Start
app.listen(PORT, () => {
    console.log(`🚀 Scraper Hub is running!`);
    console.log(`📱 Open in browser: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});
