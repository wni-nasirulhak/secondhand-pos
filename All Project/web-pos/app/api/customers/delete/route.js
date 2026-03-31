export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getFirst, prepare, batch } from '@/lib/db';

export async function POST(req) {
  try {
    const { phone } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Find the internal ID
    const customer = await getFirst('SELECT id FROM customers WHERE phone = ?', [phone]);
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const statements = [];
    // 2. Nullify customer_id in sales using the integer ID
    statements.push(await prepare('UPDATE sales SET customer_id = NULL WHERE customer_id = ?', [customer.id]));
    
    // 3. Delete the customer record
    statements.push(await prepare('DELETE FROM customers WHERE id = ?', [customer.id]));

    await batch(statements);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer Delete API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


