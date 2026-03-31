/**
 * PlatformRegistry - Platform adapter discovery and management
 */

const logger = require('../utils/logger').module('PlatformRegistry');

class PlatformRegistry {
    constructor() {
        this.platforms = new Map(); // platformId -> AdapterClass
        this.instances = new Map(); // platformId -> adapter instance
    }

    /**
     * Register a platform adapter
     * @param {string} id - Platform ID (e.g., 'tiktok', 'shopee')
     * @param {Class} AdapterClass - Adapter class (must extend BasePlatformAdapter)
     */
    register(id, AdapterClass) {
        if (this.platforms.has(id)) {
            logger.warn(`Platform ${id} already registered, overwriting`);
        }

        this.platforms.set(id, AdapterClass);
        logger.info(`Platform registered: ${id}`);
    }

    /**
     * Get adapter class for platform
     * @param {string} id
     * @returns {Class}
     */
    get(id) {
        const AdapterClass = this.platforms.get(id);
        if (!AdapterClass) {
            throw new Error(`Platform not found: ${id}`);
        }
        return AdapterClass;
    }

    /**
     * Create adapter instance for platform
     * @param {string} id
     * @param {Object} config - Platform-specific config
     * @returns {BasePlatformAdapter}
     */
    createInstance(id, config = {}) {
        const AdapterClass = this.get(id);
        const instance = new AdapterClass(config);
        
        // Cache instance
        this.instances.set(id, instance);
        
        logger.info(`Adapter instance created for: ${id}`);
        return instance;
    }

    /**
     * Get or create cached instance
     */
    getInstance(id, config = {}) {
        if (this.instances.has(id)) {
            return this.instances.get(id);
        }
        return this.createInstance(id, config);
    }

    /**
     * Get all registered platforms
     * @returns {Array<{id: string, class: Class}>}
     */
    getAll() {
        return Array.from(this.platforms.entries()).map(([id, AdapterClass]) => ({
            id,
            class: AdapterClass,
        }));
    }

    /**
     * Get all enabled platforms
     */
    getEnabled() {
        return this.getAll().filter(({ id, class: AdapterClass }) => {
            try {
                const instance = new AdapterClass();
                const config = instance.getPlatformConfig();
                return config.enabled !== false;
            } catch {
                return true; // Assume enabled if can't check
            }
        });
    }

    /**
     * Check if platform is registered
     */
    has(id) {
        return this.platforms.has(id);
    }

    /**
     * Unregister platform
     */
    unregister(id) {
        this.platforms.delete(id);
        this.instances.delete(id);
        logger.info(`Platform unregistered: ${id}`);
    }

    /**
     * List all registered platform IDs
     */
    list() {
        return Array.from(this.platforms.keys());
    }

    /**
     * Get platform info
     */
    getInfo(id) {
        const AdapterClass = this.get(id);
        const tempInstance = new AdapterClass();
        
        return {
            id,
            name: tempInstance.platformDisplayName,
            icon: tempInstance.platformIcon,
            supportedFeatures: tempInstance.supportedFeatures,
            config: tempInstance.getPlatformConfig(),
        };
    }

    /**
     * Get all platforms info
     */
    getAllInfo() {
        return this.list().map(id => this.getInfo(id));
    }
}

// Singleton instance
const registry = new PlatformRegistry();

module.exports = registry;
