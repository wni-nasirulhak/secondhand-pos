export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prepare } from '@/lib/db';

export async function POST(req) {
  try {
    const { phone, name, address } = await req.json();
    if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

    const normPhone = phone.trim().replace(/\D/g, '');

    await (await prepare(
      'UPDATE customers SET name = ?, address = ? WHERE phone = ?',
      [name, address, normPhone]
    )).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


