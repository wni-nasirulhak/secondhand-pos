import { query, prepare } from '@/lib/db';

export async function getBrandConfig() {
  const sql = `SELECT value FROM settings WHERE key = 'brand_config'`;
  const { results } = await query(sql);
  let brandConfig = {};
  if (results.length > 0 && results[0].value) {
    brandConfig = JSON.parse(results[0].value);
  }
  return brandConfig;
}

export async function saveBrandConfig(config) {
  const configStr = JSON.stringify(config);
  await (await prepare(
    `INSERT INTO settings (key, value) VALUES ('brand_config', ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [configStr]
  )).run();
  return { success: true };
}

export async function getConfig(key) {
  const { results } = await query(`SELECT value FROM settings WHERE key = ?`, [key]);
  if (results.length > 0 && results[0].value) {
    try { return JSON.parse(results[0].value); } catch { return results[0].value; }
  }
  return null;
}

export async function saveConfig(key, config) {
  const configStr = typeof config === 'string' ? config : JSON.stringify(config);
  await (await prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, configStr]
  )).run();
  return { success: true };
}

export async function getCategories() {
  const { results } = await query('SELECT * FROM categories ORDER BY name ASC');
  return results;
}

export async function createCategory(name) {
  if (!name) throw new Error('Name is required');
  await (await prepare('INSERT INTO categories (name) VALUES (?)', [name])).run();
  return { success: true };
}

export async function updateCategory(id, name) {
  if (!id || !name) throw new Error('ID and Name are required');
  await (await prepare('UPDATE categories SET name = ? WHERE id = ?', [name, id])).run();
  return { success: true };
}

export async function deleteCategory(id) {
  if (!id) throw new Error('ID is required');
  // First, check if any products use this category
  const { results } = await query('SELECT count(*) as count FROM products WHERE category_id = ?', [id]);
  if (results[0].count > 0) throw new Error('Cannot delete category because it is being used by products.');

  await (await prepare('DELETE FROM categories WHERE id = ?', [id])).run();
  return { success: true };
}
