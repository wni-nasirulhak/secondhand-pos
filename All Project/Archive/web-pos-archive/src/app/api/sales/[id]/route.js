export const dynamic = 'force-dynamic';

import { success, error, serverError } from '@/lib/api-response';
import { getSaleByNo } from '@/services/salesService';

export async function GET(req, { params }) {
  try {
    const { id: saleNo } = await params;
    const result = await getSaleByNo(saleNo);
    return success(result);
  } catch (err) {
    if (err.message === 'Sale not found') return error(err.message, 404);
    return serverError(err);
  }
}
