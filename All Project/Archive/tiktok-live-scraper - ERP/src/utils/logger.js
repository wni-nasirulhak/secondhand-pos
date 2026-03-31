/**
 * Logger - Winston-based structured logging
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/app.config');

// Ensure log directory exists
const logDir = path.dirname(appConfig.logging.filePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(meta).length > 0 && meta.stack) {
            log += `\n${meta.stack}`;
        } else if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        return log;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: appConfig.logging.level,
    format: customFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            ),
        }),
        
        // File transport
        new winston.transports.File({
            filename: appConfig.logging.filePath,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        
        // Error file
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});

/**
 * Create child logger with module name
 * @param {string} moduleName
 */
logger.module = function(moduleName) {
    return logger.child({ module: moduleName });
};

module.exports = logger;
