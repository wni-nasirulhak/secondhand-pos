// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { execute, prepare, batch } from '@/lib/db';

export async function POST(req) {
  try {
    const { items } = await req.json();
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const statements = [];

    for (const item of items) {
      // 1. Insert product
      const productRes = await (await prepare(
        'INSERT OR IGNORE INTO products (barcode_id, item_name, brand, selling_price, status, description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          item.Barcode_ID, 
          item.Item_Name, 
          item.Brand || '', 
          parseFloat(item.Price || 0), 
          item.Status || 'Available',
          item.Description || ''
        ]
      )).run();

      // If inserted, add primary image
      if (productRes.meta.changes > 0 && item.Photo) {
        statements.push(await prepare(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productRes.meta.last_row_id, item.Photo, 1]
        ));
      }
    }

    if (statements.length > 0) {
      await batch(statements);
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error('Batch Inventory API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

