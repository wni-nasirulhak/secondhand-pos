export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Type codes mapping
const TYPE_CODES = {
  'à¹€à¸ªà¸·à¹‰à¸­': 'SHIRT',
  'shirt': 'SHIRT',
  'à¸à¸²à¸‡à¹€à¸à¸‡': 'PANT',
  'pant': 'PANT',
  'à¸£à¸­à¸‡à¹€à¸—à¹‰à¸²': 'SHOE',
  'shoe': 'SHOE',
  'à¹€à¸ªà¸·à¹‰à¸­à¸à¸±à¸™à¸«à¸™à¸²à¸§': 'JACK',
  'jacket': 'JACK',
  'à¸à¸£à¸°à¹‚à¸›à¸£à¸‡': 'SKIRT',
  'skirt': 'SKIRT',
  'à¸­à¸¸à¸›à¸à¸£à¸“à¹Œ': 'ACC',
  'accessories': 'ACC',
  'à¸Šà¸¸à¸”à¹€à¸”à¸£à¸ª': 'DRESS',
  'dress': 'DRESS',
  'à¸­à¸·à¹ˆà¸™à¹†': 'ITEM',
  'other': 'ITEM',
};

function getTypeCode(categoryName) {
  const lower = (categoryName || '').toLowerCase();
  for (const [key, code] of Object.entries(TYPE_CODES)) {
    if (lower.includes(key)) return code;
  }
  return 'ITEM';
}

function getBrandCode(brand) {
  if (!brand) return 'OTHER';
  // Take first 6 chars of brand, uppercase, no spaces/special chars
  const clean = brand.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!clean) return 'OTHER';
  return clean.substring(0, 8);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand') || '';
    const categoryName = searchParams.get('category_name') || '';

    const brandCode = getBrandCode(brand);
    const typeCode = getTypeCode(categoryName);
    const prefix = `${brandCode}-${typeCode}`;

    // Count existing products with this prefix to determine next seq
    const { results } = await query(
      `SELECT COUNT(*) as cnt FROM products WHERE barcode_id LIKE ?`,
      [`${prefix}-%`]
    );
    const count = (results[0]?.cnt || 0) + 1;
    const seq = String(count).padStart(3, '0');
    const generatedId = `${prefix}-${seq}`;

    return NextResponse.json({ id: generatedId, prefix, seq });
  } catch (error) {
    console.error('Generate ID Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


