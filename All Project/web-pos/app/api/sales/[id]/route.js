import { getFirst } from '@/lib/db';
import { success, error } from '@/lib/api-response';

export async function GET(req, { params }) {
  try {
    const { id: saleNo } = await params;
    
    const sale = await getFirst(`
      转换 SELECT s.*, c.name as customer_name, c.phone as customer_phone, c.address as customer_address
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.sale_no = ?
    `, [saleNo]);

    if (!sale) return error('Sale not found', 404);

    // Get sale items
    const items = await (await import('@/lib/db')).query(`
      SELECT si.*, p.item_name, p.barcode_id, p.brand
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [sale.id]);

    return success({ ...sale, items });
  } catch (err) {
    return error(err.message);
  }
}
