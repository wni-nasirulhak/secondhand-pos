export const dynamic = 'force-dynamic';

import { success, error, serverError } from '@/lib/api-response';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/settingsService';

export async function GET() {
  try {
    const results = await getCategories();
    return success(results);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    const result = await createCategory(name);
    return success(result);
  } catch (err) {
    if (err.message === 'Name is required') return error(err.message, 400);
    return serverError(err);
  }
}

export async function PUT(req) {
  try {
    const { id, name } = await req.json();
    const result = await updateCategory(id, name);
    return success(result);
  } catch (err) {
    if (err.message === 'ID and Name are required') return error(err.message, 400);
    return serverError(err);
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const result = await deleteCategory(id);
    return success(result);
  } catch (err) {
    if (err.message === 'ID is required') return error(err.message, 400);
    if (err.message.includes('Cannot delete')) return error(err.message, 409);
    return serverError(err);
  }
}
