/**
 * EcomScraper Hub - Lean Entry Point
 * Modular, multi-platform e-commerce scraper system
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const appConfig = require('./src/config/app.config');
const logger = require('./src/utils/logger').module('Server');
const Database = require('./src/data/Database');
const apiRoutes = require('./src/api/routes');

const app = express();

// ========== Middleware ==========

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Request logging
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
});

// ========== Database ==========

try {
    Database.connect();
    logger.info('Database connected successfully');
} catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
}

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
    });
});

// ========== Start Server ==========

const PORT = appConfig.server.port;

app.listen(PORT, () => {
    logger.info(`🚀 EcomScraper Hub running on http://localhost:${PORT}`);
    logger.info(`📊 API available at http://localhost:${PORT}/api`);
    logger.info(`Environment: ${appConfig.server.nodeEnv}`);
});

// ========== Graceful Shutdown ==========

process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    Database.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Shutting down gracefully...');
    Database.close();
    process.exit(0);
});
