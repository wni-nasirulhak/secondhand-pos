/**
 * Database Migration Runner
 */

const Database = require('../src/data/Database');
const logger = require('../src/utils/logger').module('Migration');

async function runMigrations() {
    try {
        logger.info('Starting database migrations...');
        
        // Connect to database
        Database.connect();
        
        // Run all migrations
        Database.runMigrations();
        
        logger.info('✅ Migrations completed successfully');
        
        Database.close();
        process.exit(0);
    } catch (error) {
        logger.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
