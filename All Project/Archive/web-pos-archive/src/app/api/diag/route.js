// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tableInfo = await query("PRAGMA table_info(customers)");
    const salesInfo = await query("PRAGMA table_info(sales)");
    const sampleCustomer = await query("SELECT * FROM customers LIMIT 5");
    const sampleSale = await query("SELECT * FROM sales LIMIT 5");
    const sampleItems = await query("SELECT * FROM sale_items LIMIT 5");
    
    return NextResponse.json({
      tableInfo: tableInfo.results || [],
      salesInfo: salesInfo.results || [],
      sampleCustomer: sampleCustomer.results || [],
      sampleSale: sampleSale.results || [],
      sampleItems: sampleItems.results || []
    });
  } catch (err) {
    return NextResponse.json({ error: err.message, stack: err.stack });
  }
}


