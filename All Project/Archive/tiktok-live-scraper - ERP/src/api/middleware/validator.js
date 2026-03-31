/**
 * Request Validation Middleware
 */

const { validate, schemas } = require('../../utils/validators');
const logger = require('../../utils/logger').module('Validator');

/**
 * Validate request body against Joi schema
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const validated = validate(req.body, schema);
            req.body = validated; // Replace with validated data
            next();
        } catch (error) {
            logger.warn('Validation error:', {
                path: req.path,
                error: error.message,
                body: req.body,
            });
            
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.message,
            });
        }
    };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validated = validate(req.query, schema);
            req.query = validated;
            next();
        } catch (error) {
            logger.warn('Query validation error:', {
                path: req.path,
                error: error.message,
                query: req.query,
            });
            
            res.status(400).json({
                success: false,
                error: 'Query validation error',
                details: error.message,
            });
        }
    };
}

/**
 * Validate params
 */
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const validated = validate(req.params, schema);
            req.params = validated;
            next();
        } catch (error) {
            logger.warn('Params validation error:', {
                path: req.path,
                error: error.message,
                params: req.params,
            });
            
            res.status(400).json({
                success: false,
                error: 'Params validation error',
                details: error.message,
            });
        }
    };
}

/**
 * Validate platform ID
 */
function validatePlatform(req, res, next) {
    const { platform } = req.body || req.query || req.params;
    
    if (!platform) {
        return next(); // Allow missing platform (may be optional)
    }

    const validPlatforms = ['tiktok', 'shopee', 'lazada'];
    
    if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid platform',
            validPlatforms,
        });
    }

    next();
}

module.exports = {
    validateBody,
    validateQuery,
    validateParams,
    validatePlatform,
};
