import { prepare, batch, getFirst, query } from '@/lib/db';

export async function getSales(paramsObj) {
  const { startDate, endDate, categoryId, brand, limit = 50, page = 1 } = paramsObj;

  let whereClause = "WHERE IFNULL(s.status, 'Completed') != 'Voided'";
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

  const offset = (page - 1) * limit;

  // Total count query
  const countSql = `
    SELECT COUNT(DISTINCT s.id) as total 
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN products p ON si.product_id = p.id
    ${whereClause}
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
    ${whereClause}
    GROUP BY s.id
    ORDER BY s.timestamp DESC
    LIMIT ? OFFSET ?
  `;
  
  const { results } = await query(sql, [...params, limit, offset]);
  return { 
    sales: results,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getSaleByNo(saleNo) {
  const sale = await getFirst(`
    SELECT s.*, c.name as customer_name, c.phone as customer_phone, c.address as customer_address
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.sale_no = ?
  `, [saleNo]);

  if (!sale) throw new Error('Sale not found');

  const { results: items } = await query(`
    SELECT si.*, p.item_name, p.barcode_id, p.brand
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.sale_id = ?
  `, [sale.id]);

  return { ...sale, items };
}

export async function voidSaleById(saleId) {
  if (!saleId) throw new Error('Sale ID is required');

  const sale = await getFirst('SELECT * FROM sales WHERE id = ?', [saleId]);
  if (!sale) throw new Error('Sale not found');
  if (sale.status === 'Voided') throw new Error('Sale is already voided');

  const { results: items } = await query('SELECT product_id FROM sale_items WHERE sale_id = ?', [saleId]);
  const productIds = items?.map(item => item.product_id) || [];

  const atomicStatements = [];
  atomicStatements.push(await prepare("UPDATE sales SET status = 'Voided' WHERE id = ?", [saleId]));

  for (const pid of productIds) {
    atomicStatements.push(await prepare("UPDATE products SET status = 'Available' WHERE id = ?", [pid]));
  }

  if (atomicStatements.length > 0) {
    await batch(atomicStatements);
  }

  return { success: true };
}
