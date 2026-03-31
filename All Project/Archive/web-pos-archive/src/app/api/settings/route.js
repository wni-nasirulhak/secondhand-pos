import { success, serverError } from '@/lib/api-response';
import { getBrandConfig, saveBrandConfig } from '@/services/settingsService';

export async function GET() {
  try {
    const config = await getBrandConfig();
    return success(config);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req) {
  try {
    const config = await req.json();
    const result = await saveBrandConfig(config);
    return success(result);
  } catch (err) {
    return serverError(err);
  }
}
