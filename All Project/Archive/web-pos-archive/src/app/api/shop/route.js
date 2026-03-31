import { success, serverError } from '@/lib/api-response';
import { getShopProducts } from '@/services/shopService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterBrand = searchParams.get('brand');
    const filterCategory = searchParams.get('category');
    const filterSize = searchParams.get('size');
    const filterCondition = searchParams.get('condition');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    
    const results = await getShopProducts({ filterBrand, filterCategory, filterSize, filterCondition, minPrice, maxPrice, sort });
    return success(results);
  } catch (err) {
    return serverError(err);
  }
}
