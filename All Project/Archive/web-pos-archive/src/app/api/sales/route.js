export const dynamic = 'force-dynamic';

import { success, error, serverError } from '@/lib/api-response';
import { getSales, voidSaleById } from '@/services/salesService';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const brand = searchParams.get('brand');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    const result = await getSales({ startDate, endDate, categoryId, brand, limit, page });
    return success(result);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req) {
  try {
    const { saleId } = await req.json();
    const result = await voidSaleById(saleId);
    return success(result);
  } catch (err) {
    if (err.message === 'Sale ID is required' || err.message === 'Sale is already voided') return error(err.message, 400);
    if (err.message === 'Sale not found') return error(err.message, 404);
    return serverError(err);
  }
}
