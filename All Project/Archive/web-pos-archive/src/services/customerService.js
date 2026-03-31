import { getFirst, prepare, batch, query } from '@/lib/db';

export async function getCustomers(paramsObj = {}) {
  const { page = 1, limit = 10, q = '' } = paramsObj;
  
  let whereClause = '';
  let queryParams = [];
  
  if (q) {
    whereClause = 'WHERE name LIKE ? OR phone LIKE ?';
    queryParams = [`%${q}%`, `%${q}%`];
  }
  
  // Count total
  const countRes = await query(`SELECT COUNT(*) as total FROM customers ${whereClause}`, queryParams);
  const total = countRes.results?.[0]?.total || 0;
  
  // Get paginated data
  const offset = (page - 1) * limit;
  const sql = `
    SELECT 
      id AS ID, 
      name AS Name, 
      phone AS Phone, 
      address AS Address, 
      points AS Points, 
      total_spent AS Total_Spent,
      tier AS Tier,
      created_at AS Created_At
    FROM customers 
    ${whereClause} 
    ORDER BY total_spent DESC 
    LIMIT ? OFFSET ?
  `;
  const { results } = await query(sql, [...queryParams, limit, offset]);
  
  return {
    customers: results,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updateCustomer(data) {
  const { phone, name, address } = data;
  if (!phone) throw new Error('Phone is required');

  const normPhone = phone.trim().replace(/\D/g, '');

  await (await prepare(
    'UPDATE customers SET name = ?, address = ? WHERE phone = ?',
    [name, address, normPhone]
  )).run();

  return { success: true };
}

export async function deleteCustomerByPhone(phone) {
  if (!phone) throw new Error('Phone number is required');

  const customer = await getFirst('SELECT id FROM customers WHERE phone = ?', [phone]);
  if (!customer) throw new Error('Customer not found');

  const statements = [];
  statements.push(await prepare('UPDATE sales SET customer_id = NULL WHERE customer_id = ?', [customer.id]));
  statements.push(await prepare('DELETE FROM customers WHERE id = ?', [customer.id]));

  await batch(statements);
  return { success: true };
}
