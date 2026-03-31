const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
    const wranglerPath = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
    if (!fs.existsSync(wranglerPath)) {
        console.error('Wrangler path not found');
        return;
    }

    const files = fs.readdirSync(wranglerPath);
    const sqliteFile = files.find(f => f.endsWith('.sqlite'));
    if (!sqliteFile) {
        console.error('No SQLite file found in wrangler path');
        return;
    }

    const dbPath = path.join(wranglerPath, sqliteFile);
    console.log('Applying migration to:', dbPath);
    
    const db = new Database(dbPath);
    const migrationPath = path.join(process.cwd(), 'migrations', '0001_performance_indexes.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    try {
        db.exec(migrationSql);
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Failed to apply migration:', err);
    } finally {
        db.close();
    }
}

applyMigration();
