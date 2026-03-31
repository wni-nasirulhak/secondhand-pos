/**
 * Global Error Handler Middleware
 */

const logger = require('../../utils/logger').module('ErrorHandler');

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
    // Log error
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        body: req.body,
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Prepare error response
    const response = {
        success: false,
        error: err.message || 'Internal server error',
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.details = err.details || null;
    }

    // Send response
    res.status(statusCode).json(response);
}

/**
 * Not found (404) handler
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
    });
}

/**
 * Async route wrapper (catch async errors)
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
};
