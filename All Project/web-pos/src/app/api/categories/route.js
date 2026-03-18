import { success, error, serverError } from '@/lib/api-response';
import { query } from '@/lib/db';

// export const runtime = 'edge';

export async function GET() {
  try {
    const { results } = await query('SELECT * FROM categories ORDER BY name ASC');
    return success(results);
  } catch (err) {
    return serverError(err);
  }
}

// Cloudinary unsigned upload proxy
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return error('No file provided', 400);
    }
    // The rest of the POST logic would go here, e.g., uploading to Cloudinary
    // For now, let's assume a successful processing or a placeholder
    return success({ message: 'File received successfully (upload logic not implemented yet)' });
  } catch (err) {
    return serverError(err);
  }
}
