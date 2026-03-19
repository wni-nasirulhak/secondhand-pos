export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, getFirst } from '@/lib/db';

export async function GET(req) {
  let phone = 'unknown';
  try {
    const { searchParams } = new URL(req.url);
    phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Find the customer
    const customer = await getFirst('SELECT id, name FROM customers WHERE phone = ?', [phone]);
    
    if (!customer) {
      return NextResponse.json([]); // Return empty array if customer doesn't exist
    }

    // 2. Fetch history with item details
    const historyRes = await query(`
      SELECT 
        s.id,
        s.sale_no,
        s.final_total as total_amount,
        s.timestamp as created_at,
        s.discount_total as discount,
        (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as total_items,
        (
          SELECT '[' || GROUP_CONCAT('{"name":"' || REPLACE(p.item_name, '"', '\"') || '","barcode":"' || p.barcode_id || '"}') || ']'
          FROM sale_items si
          JOIN products p ON si.product_id = p.id
          WHERE si.sale_id = s.id
        ) as items_json
      FROM sales s
      WHERE s.customer_id = ?
      ORDER BY s.timestamp DESC
      LIMIT 100
    `, [customer.id]);

    const results = historyRes.results || [];
    return NextResponse.json(results);

  } catch (error) {
    console.error('CRITICAL CRM ERROR:', error);
    return NextResponse.json({ 
      error: error.message,
      phone: phone,
      step: 'fetching_history'
    }, { status: 500 });
  }
}


