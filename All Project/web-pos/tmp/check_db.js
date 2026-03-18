const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function findDb() {
  const d1Path = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
  if (fs.existsSync(d1Path)) {
    const files = fs.readdirSync(d1Path);
    const sqliteFile = files.find(f => f.endsWith('.sqlite'));
    if (sqliteFile) return path.join(d1Path, sqliteFile);
  }
  return 'local.db';
}

const dbPath = findDb();
console.log('Using DB:', dbPath);
const db = new sqlite3(dbPath);

try {
  const categories = db.prepare('SELECT * FROM categories').all();
  console.log('CATEGORIES:', JSON.stringify(categories, null, 2));
} catch (e) {
  console.error('ERROR:', e.message);
}
db.close();
