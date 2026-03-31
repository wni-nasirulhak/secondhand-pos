/**
 * Database Configuration
 */

const path = require('path');
const appConfig = require('./app.config');

module.exports = {
    client: 'better-sqlite3',
    connection: {
        filename: path.resolve(__dirname, '../../', appConfig.database.path),
    },
    useNullAsDefault: true,
    migrations: {
        directory: path.resolve(__dirname, '../data/migrations'),
    },
    pool: {
        afterCreate: (conn, cb) => {
            // Enable foreign keys
            conn.run('PRAGMA foreign_keys = ON', cb);
        },
    },
};
