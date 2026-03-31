import { query } from './src/lib/db.js';

async function run() {
  const result = await query("SELECT id, item_name, status FROM products LIMIT 10");
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
