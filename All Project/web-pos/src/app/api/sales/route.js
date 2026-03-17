import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const brand = searchParams.get('brand');

    let whereClause = "WHERE 1=1";
    let params = [];

    if (startDate) {
      whereClause += " AND DATE(s.timestamp) >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND DATE(s.timestamp) <= ?";
      params.push(endDate);
    }
    if (categoryId) {
      whereClause += " AND p.category_id = ?";
      params.push(categoryId);
    }
    if (brand) {
      whereClause += " AND p.brand LIKE ?";
      params.push(`%${brand}%`);
    }

    const sql = `
      SELECT 
        s.id AS ID,
        s.sale_no AS Sale_No,
        p.item_name AS Product_Name,
        c.name AS Customer_Name,
        s.timestamp AS Timestamp,
        si.unit_price AS Price,
        p.cost_price AS Cost,
        (si.unit_price - p.cost_price) AS Profit_Baht,
        CASE 
          WHEN p.cost_price > 0 THEN ((si.unit_price - p.cost_price) / p.cost_price) * 100 
          ELSE 100 
        END AS Profit_Percent
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      LEFT JOIN customers c ON s.customer_id = c.id
      ${whereClause}
      ORDER BY s.timestamp DESC
      LIMIT 50
    `;
    
    const { results } = await query(sql, params);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Sales API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
