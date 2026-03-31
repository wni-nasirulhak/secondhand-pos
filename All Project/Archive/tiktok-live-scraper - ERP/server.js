/**
 * EcomScraper Hub - Production Server
 * Multi-platform e-commerce scraper with TikTok Live legacy support
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const appConfig = require('./src/config/app.config');
const logger = require('./src/utils/logger').module('Server');
const Database = require('./src/data/Database');
const apiRoutes = require('./src/api/routes');
const EventBus = require('./src/core/EventBus');
const dataRoutes = require('./src/api/routes/data.routes');

const app = express();

// ========== Middleware ==========

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS (if needed)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Request logging (debug only)
if (appConfig.server.nodeEnv === 'development') {
    app.use((req, res, next) => {
        logger.debug(`${req.method} ${req.path}`);
        next();
    });
}

// ========== Database ==========

try {
    Database.connect();
    logger.info('Database connected successfully');
} catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
}

// ========== Event Bus ==========

// Listen to scraper events and add to legacy comments array
EventBus.on('comment:scraped', (event) => {
    const { comment } = event;
    dataRoutes.addComment(comment);
});

// ========== API Routes ==========

app.use('/api', apiRoutes);

// ========== Root Route ==========

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== Error Handler ==========

app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: error.message,
        stack: appConfig.server.nodeEnv === 'development' ? error.stack : undefined
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// ========== Start Server ==========

const PORT = appConfig.server.port;

const server = app.listen(PORT, () => {
    logger.info('');
    logger.info('╔═══════════════════════════════════════════════════════════╗');
    logger.info('║  🛒  EcomScraper Hub v2.0                                ║');
    logger.info('║  Multi-Platform E-Commerce Scraper System                ║');
    logger.info('╚═══════════════════════════════════════════════════════════╝');
    logger.info('');
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📊 API available at http://localhost:${PORT}/api`);
    logger.info(`🌐 Web UI at http://localhost:${PORT}`);
    logger.info(`🔧 Environment: ${appConfig.server.nodeEnv}`);
    logger.info(`📂 Database: ${appConfig.database.path}`);
    logger.info('');
    logger.info('Supported Platforms:');
    logger.info('  🎵 TikTok Shop + TikTok Live');
    logger.info('  🛒 Shopee (coming in Phase 3)');
    logger.info('  🏪 Lazada (coming in Phase 4)');
    logger.info('');
    logger.info('Legacy Features (TikTok Live):');
    logger.info('  ✅ Live comment scraping');
    logger.info('  ✅ AI-powered auto-reply');
    logger.info('  ✅ Webhook notifications');
    logger.info('  ✅ Mock rules engine');
    logger.info('');
});

// ========== Graceful Shutdown ==========

function shutdown(signal) {
    logger.info(`\n${signal} received. Shutting down gracefully...`);
    
    server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database
        Database.close();
        
        // Exit
        logger.info('Shutdown complete');
        process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
});
