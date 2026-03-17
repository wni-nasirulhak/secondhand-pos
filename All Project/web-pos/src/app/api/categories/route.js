import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// export const runtime = 'edge';

export async function GET() {
  try {
    const { results } = await query('SELECT * FROM categories ORDER BY name ASC');
    return NextResponse.json(results);
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
