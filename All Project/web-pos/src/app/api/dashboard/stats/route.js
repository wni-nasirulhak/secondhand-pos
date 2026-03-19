import { success, error, serverError } from '@/lib/api-response';
import { query } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate');     // YYYY-MM-DD
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

    // For queries involving products/items directly (si, p)
    let itemFilter = "";
    let itemParams = [];
    if (categoryId) {
      itemFilter += " AND p.category_id = ?";
      itemParams.push(categoryId);
    }
    if (brand) {
      itemFilter += " AND p.brand LIKE ?";
      itemParams.push(`%${brand}%`);
    }

    // 1. Revenue by Day
    const revenueByDaySql = `
      SELECT 
        DATE(s.timestamp) as date,
        SUM(si.subtotal) as total
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      ${whereClause} ${itemFilter}
      GROUP BY DATE(s.timestamp)
      ORDER BY date ASC
    `;

    // 2. Revenue by Category (Including Cost for Stacked Bar)
    const revenueByCategorySql = `
      SELECT 
        c.name as category,
        SUM(si.subtotal) as total_revenue,
        SUM(p.cost_price * si.quantity) as total_cost
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      ${whereClause} ${itemFilter}
      GROUP BY c.id
      ORDER BY total_revenue DESC
    `;

    // 3. Top Brands (User requested brand-level analytics instead of individual products)
    const topBrandsSql = `
      SELECT 
        p.brand as name,
        COUNT(si.id) as sales_count,
        SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      ${whereClause} ${itemFilter}
      AND p.brand IS NOT NULL AND p.brand != ''
      GROUP BY p.brand
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    // 4. Summary Stats
    const summarySql = `
      SELECT 
        SUM(si.subtotal) as total_revenue,
        COUNT(DISTINCT s.id) as total_sales,
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT COUNT(*) FROM products WHERE status = 'Available') as available_stock,
        SUM(p.cost_price * si.quantity) as total_cost
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      ${whereClause} ${itemFilter}
    `;

    const allParams = [...params, ...itemParams];

    const [revenueByDay, revenueByCategory, topBrands, summaryRows] = await Promise.all([
      query(revenueByDaySql, allParams),
      query(revenueByCategorySql, allParams),
      query(topBrandsSql, allParams),
      query(summarySql, allParams)
    ]);

    const summary = summaryRows.results?.[0] || {
      total_revenue: 0,
      total_sales: 0,
      total_customers: 0,
      available_stock: 0,
      total_cost: 0
    };

    return success({
      revenueByDay: revenueByDay.results || [],
      revenueByCategory: revenueByCategory.results || [],
      topBrands: topBrands.results || [],
      summary: {
        totalRevenue: summary.total_revenue || 0,
        totalSales: summary.total_sales || 0,
        totalCustomers: summary.total_customers || 0,
        availableStock: summary.available_stock || 0,
        totalCost: summary.total_cost || 0,
        totalProfit: (summary.total_revenue || 0) - (summary.total_cost || 0)
      }
    });
  } catch (err) {
    return serverError(err);
  }
}
0