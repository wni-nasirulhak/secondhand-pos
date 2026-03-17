import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// export const runtime = 'edge';

export async function GET() {
  try {
    const sql = `
      SELECT 
        phone AS Phone_Number,
        name AS Name,
        points AS Points,
        total_spent AS Total_Spent,
        address AS Address,
        tier AS Tier,
        created_at AS Join_Date
      FROM customers
    `;
    const { results } = await query(sql);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Customers API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
