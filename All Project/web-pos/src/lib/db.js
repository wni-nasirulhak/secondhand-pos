let localDb = null;

export async function getDB() {
  // Cloudflare Binding (Production / wrangler pages dev)
  if (typeof process !== 'undefined' && process.env.DB) {
    return process.env.DB;
  }
  
  // Local Fallback for next dev
  if (!localDb) {
    try {
      // Dynamic imports for native modules to avoid Edge runtime errors during build
      const sqlite3 = (await import('better-sqlite3')).default;
      const path = (await import('path')).default;
      const fs = (await import('fs')).default;

      // Find the local wrangler D1 sqlite file
      const d1Path = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
      if (fs.existsSync(d1Path)) {
        const files = fs.readdirSync(d1Path);
        const sqliteFile = files.find(f => f.endsWith('.sqlite'));
        if (sqliteFile) {
          localDb = new sqlite3(path.join(d1Path, sqliteFile));
          console.log('Connected to local D1 SQLite:', sqliteFile);
        }
      }
      
      // If still not found, use a default local.db
      if (!localDb) {
        localDb = new sqlite3('local.db');
        console.log('Connected to local.db (D1 not found)');
      }
    } catch (err) {
      console.error('Error initializing local DB:', err);
      return null;
    }
  }
  
  // Mock D1 Interface for better-sqlite3
  return {
    prepare: (sql) => {
      const stmt = localDb.prepare(sql);
      return {
        bind: (...params) => {
          return {
            all: async () => {
              const results = stmt.all(...params);
              return { results };
            },
            run: async () => {
              const info = stmt.run(...params);
              return { meta: { changes: info.changes, last_row_id: info.lastInsertRowid } };
            },
            first: async () => stmt.get(...params),
            // Internal sync helpers for batch
            _syncRun: () => stmt.run(...params)
          };
        }
      };
    },
    batch: async (statements) => {
      const results = [];
      const transaction = localDb.transaction((stmts) => {
        for (const s of stmts) {
          // Statements in batch usually provide results (like all() or run())
          // For simplicity in our mock, we use the internal _syncRun which returns the better-sqlite3 info/results
          const res = s._syncRun();
          results.push({ results: Array.isArray(res) ? res : [], meta: res.changes !== undefined ? { changes: res.changes, last_row_id: res.lastInsertRowid } : {} });
        }
      });
      transaction(statements);
      return results;
    }
  };
}

export async function query(sql, params = []) {
  const db = await getDB();
  const stmt = db.prepare(sql).bind(...params);
  return stmt.all();
}

export async function execute(sql, params = []) {
  const db = await getDB();
  const stmt = db.prepare(sql).bind(...params);
  return stmt.run();
}

export async function getFirst(sql, params = []) {
  const db = await getDB();
  const stmt = db.prepare(sql).bind(...params);
  return stmt.first();
}

export async function batch(statements) {
  const db = await getDB();
  return db.batch(statements);
}

export async function prepare(sql, params = []) {
  const db = await getDB();
  return db.prepare(sql).bind(...params);
}
