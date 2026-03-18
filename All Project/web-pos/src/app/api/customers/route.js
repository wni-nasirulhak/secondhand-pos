import { success, error, serverError } from '@/lib/api-response';
import { query } from '@/lib/db';

// export const runtime = 'edge';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const q = searchParams.get('q') || '';
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let params = [];
    if (q) {
      whereClause += " AND (name LIKE ? OR phone LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    // Count
    const countRes = await query(`SELECT COUNT(*) as total FROM customers ${whereClause}`, params);
    const total = countRes.results?.[0]?.total || 0;

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
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    const { results } = await query(sql, [...params, limit, offset]);
    
    return success({
      customers: results,
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
