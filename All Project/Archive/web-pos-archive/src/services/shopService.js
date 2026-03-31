import { query } from '@/lib/db';

export async function getShopProducts(filters = {}) {
  const { filterBrand, filterCategory, filterSize, filterCondition, minPrice, maxPrice, sort } = filters;
  
  let sql = `
    SELECT 
      p.id, p.barcode_id, p.item_name, p.brand, p.selling_price, p.description, p.status, p.cost_price,
      c.name AS Category_Name,
      (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) AS Photos,
      cd.size AS clothing_size, cd.condition AS clothing_condition, cd.material AS clothing_material, cd.color AS clothing_color,
      cd.chest_width, cd.waist_size, cd.shoulder_width, cd.sleeve_length, cd.total_length,
      sd.size_eu AS shoe_size, sd.size_us, sd.size_uk, sd.insole_cm,
      sd.condition AS shoe_condition, sd.material AS shoe_material, sd.color AS shoe_color
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN clothing_details cd ON p.id = cd.product_id
    LEFT JOIN shoe_details sd ON p.id = sd.product_id
    WHERE LOWER(TRIM(p.status)) = 'available'
  `;
  
  const params = [];
  
  if (filterBrand) {
    sql += ` AND p.brand = ?`;
    params.push(filterBrand);
  }
  
  if (filterCategory) {
    sql += ` AND c.name = ?`;
    params.push(filterCategory);
  }

  if (filterSize) {
    sql += ` AND (cd.size = ? OR CAST(sd.size_eu AS TEXT) = ?)`;
    params.push(filterSize, filterSize);
  }

  if (filterCondition) {
    sql += ` AND (cd.condition = ? OR sd.condition = ?)`;
    params.push(filterCondition, filterCondition);
  }

  if (minPrice) {
    sql += ` AND p.selling_price >= ?`;
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    sql += ` AND p.selling_price <= ?`;
    params.push(Number(maxPrice));
  }

  // Sort options
  if (sort === 'price_asc') {
    sql += ` ORDER BY p.selling_price ASC`;
  } else if (sort === 'price_desc') {
    sql += ` ORDER BY p.selling_price DESC`;
  } else {
    // default: newest first
    sql += ` ORDER BY p.updated_at DESC`;
  }

  sql += ` LIMIT 200`;

  const { results } = await query(sql, params);
  return results;
}
