import { success, error, serverError } from '@/lib/api-response';
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

    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const offset = (page - 1) * limit;

    const whereSql = whereClause;
    
    // Total count query
    const countSql = `
      SELECT COUNT(DISTINCT s.id) as total 
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      ${whereSql}
    `;
    const countRes = await query(countSql, params);
    const total = countRes.results?.[0]?.total || 0;

    const sql = `
      SELECT 
        s.id AS ID,
        s.sale_no AS Sale_No,
        GROUP_CONCAT(p.item_name, ', ') AS Product_Name,
        c.name AS Customer_Name,
        s.timestamp AS Timestamp,
        SUM(si.subtotal) AS Price,
        SUM(p.cost_price * si.quantity) AS Cost,
        SUM(si.subtotal - (p.cost_price * si.quantity)) AS Profit_Baht,
        CASE 
          WHEN SUM(p.cost_price * si.quantity) > 0 THEN (SUM(si.subtotal - (p.cost_price * si.quantity)) / SUM(p.cost_price * si.quantity)) * 100 
          ELSE 100 
        END AS Profit_Percent
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      LEFT JOIN customers c ON s.customer_id = c.id
      ${whereSql}
      GROUP BY s.id
      ORDER BY s.timestamp DESC
      LIMIT ? OFFSET ?
    `;
    
    const { results } = await query(sql, [...params, limit, offset]);
    return success({ 
      sales: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    return serverError(err);
  }
}
