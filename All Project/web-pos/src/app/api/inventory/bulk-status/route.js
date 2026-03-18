import { success, error, serverError } from '@/lib/api-response';
import { query, prepare } from '@/lib/db';

export async function POST(req) {
  try {
    const { ids, status } = await req.json();
    if (!ids || !Array.isArray(ids) || !status) {
      return error('Missing required fields', 400);
    }

    const placeholders = ids.map(() => '?').join(',');
    const sql = `UPDATE products SET status = ? WHERE id IN (${placeholders})`;
    
    await (await prepare(sql, [status, ...ids])).run();

    return success({ updated: ids.length });
  } catch (err) {
    return serverError(err);
  }
}
