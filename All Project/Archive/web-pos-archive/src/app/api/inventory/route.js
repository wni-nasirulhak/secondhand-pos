import { success, error, serverError } from '@/lib/api-response';
import { getProducts, createProduct, updateProduct, bulkUpdateProductStatus } from '@/services/inventoryService';

export async function GET() {
  try {
    const products = await getProducts();
    return success(products);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const result = await createProduct(data);
    return success(result);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const result = await updateProduct(data);
    return success(result);
  } catch (err) {
    if (err.message === 'ID is required') return error(err.message, 400);
    return serverError(err);
  }
}

export async function PATCH(req) {
  try {
    const { ids, status } = await req.json();
    const result = await bulkUpdateProductStatus(ids, status);
    return success(result);
  } catch (err) {
    if (err.message === 'IDs and status are required') return error(err.message, 400);
    return serverError(err);
  }
}
