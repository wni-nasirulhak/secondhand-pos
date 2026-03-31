/**
 * Platform Configuration Routes
 */

const express = require('express');
const router = express.Router();
const PlatformRegistry = require('../../platforms');
const logger = require('../../utils/logger').module('PlatformRoutes');

/**
 * GET /api/platform/list
 * List all registered platforms
 */
router.get('/list', (req, res) => {
    try {
        const platforms = PlatformRegistry.list();
        res.json({
            success: true,
            platforms,
            count: platforms.length,
        });
    } catch (error) {
        logger.error('List platforms error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/platform/:id
 * Get platform info
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const info = PlatformRegistry.getInfo(id);
        
        res.json({
            success: true,
            platform: info,
        });
    } catch (error) {
        logger.error('Get platform info error:', error);
        res.status(404).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/platform/
 * Get all platforms info
 */
router.get('/', (req, res) => {
    try {
        const platforms = PlatformRegistry.getAllInfo();
        
        res.json({
            success: true,
            platforms,
            count: platforms.length,
        });
    } catch (error) {
        logger.error('Get all platforms error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/platform/:id/features
 * Get platform supported features
 */
router.get('/:id/features', (req, res) => {
    try {
        const { id } = req.params;
        const AdapterClass = PlatformRegistry.get(id);
        const instance = new AdapterClass();
        
        res.json({
            success: true,
            platform: id,
            features: instance.supportedFeatures,
        });
    } catch (error) {
        logger.error('Get platform features error:', error);
        res.status(404).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/platform/:id/config
 * Get platform configuration
 */
router.get('/:id/config', (req, res) => {
    try {
        const { id } = req.params;
        const AdapterClass = PlatformRegistry.get(id);
        const instance = new AdapterClass();
        const config = instance.getPlatformConfig();
        
        res.json({
            success: true,
            platform: id,
            config,
        });
    } catch (error) {
        logger.error('Get platform config error:', error);
        res.status(404).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/platform/:id/selectors
 * Get platform selectors
 */
router.get('/:id/selectors', (req, res) => {
    try {
        const { id } = req.params;
        const AdapterClass = PlatformRegistry.get(id);
        const instance = new AdapterClass();
        const selectors = instance.getSelectors();
        
        res.json({
            success: true,
            platform: id,
            selectors,
        });
    } catch (error) {
        logger.error('Get platform selectors error:', error);
        res.status(404).json({ success: false, error: error.message });
    }
});

module.exports = router;
