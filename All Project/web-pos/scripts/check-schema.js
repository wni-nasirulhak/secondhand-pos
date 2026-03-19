const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const d1Dir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const files = fs.readdirSync(d1Dir).filter(f => f.endsWith('.sqlite'));

files.forEach(file => {
  const dbPath = path.join(d1Dir, file);
  const db = new sqlite3(dbPath);
  console.log(`--- Checking ${file} ---`);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables.map(t => t.name).join(', '));
  db.close();
});
