import { NextResponse } from 'next/server';
import { batch, prepare } from '@/lib/db';

export async function POST(req) {
  try {
    const { ids, status } = await req.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs are required' }, { status: 400 });
    }

    const targetStatus = status || 'Available';
    const statements = [];

    for (const id of ids) {
      statements.push(await prepare(
        'UPDATE products SET status = ? WHERE id = ?',
        [targetStatus, id]
      ));
    }

    if (statements.length > 0) {
      await batch(statements);
    }

    return NextResponse.json({ success: true, updatedCount: ids.length });
  } catch (error) {
    console.error('Approve API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
