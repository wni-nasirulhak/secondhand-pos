export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { success, error, serverError } from '@/lib/api-response';
import { batch, prepare } from '@/lib/db';

export async function POST(req) {
  try {
    const { ids, status } = await req.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return error('IDs are required', 400);
    }

    const targetStatus = status || 'Available';
    const statements = [];

    for (const id of ids) {
      statements.push(await prepare(
        'UPDATE products SET status = ? WHERE id = ?',
        [targetStatus, id]
      ));
    }

    if (statements.length > 0) {
      await batch(statements);
    }

    return success({ updatedCount: ids.length });
  } catch (err) {
    return serverError(err);
  }
}


