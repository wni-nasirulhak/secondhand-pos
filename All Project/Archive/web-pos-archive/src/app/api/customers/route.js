export const dynamic = 'force-dynamic';

import { success, error, serverError } from '@/lib/api-response';
import { getCustomers, updateCustomer, deleteCustomerByPhone } from '@/services/customerService';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const q = searchParams.get('q') || '';

    const customers = await getCustomers({ page, limit, q });
    return success(customers);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const result = await updateCustomer(data);
    return success(result);
  } catch (err) {
    if (err.message === 'Phone is required') return error(err.message, 400);
    return serverError(err);
  }
}

export async function DELETE(req) {
  try {
    const { phone } = await req.json();
    const result = await deleteCustomerByPhone(phone);
    return success(result);
  } catch (err) {
    if (err.message === 'Phone number is required') return error(err.message, 400);
    if (err.message === 'Customer not found') return error(err.message, 404);
    return serverError(err);
  }
}
