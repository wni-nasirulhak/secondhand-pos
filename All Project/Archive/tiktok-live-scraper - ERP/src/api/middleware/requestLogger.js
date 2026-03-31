/**
 * Request Logging Middleware
 */

const logger = require('../../utils/logger').module('RequestLogger');

/**
 * Log incoming HTTP requests
 */
function requestLogger(req, res, next) {
    const start = Date.now();
    
    // Log request
    logger.debug(`→ ${req.method} ${req.path}`, {
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        ip: req.ip || req.connection.remoteAddress,
    });

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'debug';
        
        logger[logLevel](`← ${req.method} ${req.path} ${res.statusCode}`, {
            duration: `${duration}ms`,
            size: res.get('Content-Length') || '-',
        });
    });

    next();
}

/**
 * Log request body (for debugging)
 */
function bodyLogger(req, res, next) {
    if (req.method !== 'GET' && Object.keys(req.body).length > 0) {
        logger.debug(`Body: ${req.method} ${req.path}`, {
            body: req.body,
        });
    }
    next();
}

module.exports = {
    requestLogger,
    bodyLogger,
};
