export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { success, serverError } from '@/lib/api-response';
import { prepare } from '@/lib/db';

export async function GET() {
  const categories = [
    'Clothing', 'Electronics', 'Home', 'Accessories', 'Shoes', 'Vintage', 'Toys'
  ];

  try {
    const results = [];
    for (const cat of categories) {
      await (await prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)', [cat])).run();
      results.push(cat);
    }
    return success({ seeded: results });
  } catch (err) {
    return serverError(err);
  }
}

