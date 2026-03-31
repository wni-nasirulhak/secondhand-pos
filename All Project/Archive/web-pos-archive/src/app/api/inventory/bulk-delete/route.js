// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { batch, prepare } from '@/lib/db';

export async function POST(req) {
  try {
    const { ids } = await req.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs are required' }, { status: 400 });
    }

    const statements = [];

    for (const id of ids) {
      // Delete images
      statements.push(await prepare('DELETE FROM product_images WHERE product_id = ?', [id]));
      // Delete details
      statements.push(await prepare('DELETE FROM clothing_details WHERE product_id = ?', [id]));
      statements.push(await prepare('DELETE FROM shoe_details WHERE product_id = ?', [id]));
      // Delete from social posts if any
      statements.push(await prepare('DELETE FROM social_posts WHERE product_id = ?', [id]));
      // Finally delete product
      statements.push(await prepare('DELETE FROM products WHERE id = ?', [id]));
    }

    if (statements.length > 0) {
      await batch(statements);
    }

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error('Bulk Delete API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


