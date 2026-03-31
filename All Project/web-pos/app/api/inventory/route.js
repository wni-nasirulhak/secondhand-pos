import { success, error, serverError } from '@/lib/api-response';
import { query, prepare } from '@/lib/db';

// export const runtime = 'nodejs';

export async function GET() {
  try {
    const sql = `
      SELECT 
        p.*,
        c.name AS Category_Name,
        (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) AS Photos,
        img.image_url AS Photo,
        cd.size, cd.chest_width, cd.waist_size, cd.sleeve_length, cd.shoulder_width, cd.total_length, cd.condition AS clothing_condition, cd.material AS clothing_material, cd.color AS clothing_color,
        sd.size_eu, sd.size_us, sd.size_uk, sd.insole_cm, sd.condition AS shoe_condition, sd.material AS shoe_material, sd.color AS shoe_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images img ON p.id = img.product_id AND img.is_primary = 1
      LEFT JOIN clothing_details cd ON p.id = cd.product_id
      LEFT JOIN shoe_details sd ON p.id = sd.product_id
      ORDER BY p.created_at DESC
    `;

    const { results } = await query(sql);
    return success(results);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      barcode_id, item_name, brand, category_id, cost_price, selling_price, status, description, photos,
      // Specialized details
      clothing,
      shoes,
      category_name // Frontend sends this to help determine logic
    } = data;

    // 1. Insert product
    const productRes = await (await prepare(
      'INSERT INTO products (barcode_id, item_name, brand, category_id, cost_price, selling_price, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [barcode_id, item_name, brand, category_id, cost_price, selling_price, status || 'Pending Print', description]
    )).run();

    const productId = productRes.meta.last_row_id;

    // 2. Insert images
    if (photos && Array.isArray(photos)) {
      for (let i = 0; i < photos.length; i++) {
        await (await prepare(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, photos[i], i === 0 ? 1 : 0]
        )).run();
      }
    }

    // 3. Insert specialized details
    const catLower = (category_name || '').toLowerCase();

    if (clothing && (catLower.includes('clothing') || catLower.includes('shirt') || catLower.includes('pant') || catLower.includes('เสื้อ') || catLower.includes('กางเกง'))) {
      await (await prepare(
        `INSERT INTO clothing_details (
          product_id, size, chest_width, waist_size, sleeve_length, shoulder_width, total_length, condition, material, color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId, clothing.size, clothing.chest_width, clothing.waist_size, clothing.sleeve_length,
          clothing.shoulder_width, clothing.total_length, clothing.condition, clothing.material, clothing.color
        ]
      )).run();
    } else if (shoes && (catLower.includes('shoe') || catLower.includes('sneaker') || catLower.includes('รองเท้า'))) {
      await (await prepare(
        `INSERT INTO shoe_details (
          product_id, size_eu, size_us, size_uk, insole_cm, condition, material, color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId, shoes.size_eu, shoes.size_us, shoes.size_uk, shoes.insole_cm,
          shoes.condition, shoes.material, shoes.color
        ]
      )).run();
    }

    return success({ id: productId });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const {
      id, barcode_id, item_name, brand, category_id, cost_price, selling_price, status, description, photos,
      clothing, shoes, category_name
    } = data;

    if (!id) return error('ID is required', 400);

    // 1. Update product
    await (await prepare(
      'UPDATE products SET barcode_id = ?, item_name = ?, brand = ?, category_id = ?, cost_price = ?, selling_price = ?, status = ?, description = ? WHERE id = ?',
      [barcode_id, item_name, brand, category_id, cost_price, selling_price, status, description, id]
    )).run();

    // 2. Update images
    if (photos && Array.isArray(photos)) {
      // Delete old images and insert new ones
      await (await prepare('DELETE FROM product_images WHERE product_id = ?', [id])).run();
      for (let i = 0; i < photos.length; i++) {
        await (await prepare(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [id, photos[i], i === 0 ? 1 : 0]
        )).run();
      }
    }

    // 3. Update specialized details
    const catLower = (category_name || '').toLowerCase();

    if (clothing && (catLower.includes('clothing') || catLower.includes('shirt') || catLower.includes('pant') || catLower.includes('เสื้อ') || catLower.includes('กางเกง'))) {
      await (await prepare('DELETE FROM shoe_details WHERE product_id = ?', [id])).run(); // Clean up if type changed
      await (await prepare(
        `INSERT INTO clothing_details (
          product_id, size, chest_width, waist_size, sleeve_length, shoulder_width, total_length, condition, material, color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
          size=excluded.size, chest_width=excluded.chest_width, waist_size=excluded.waist_size, 
          sleeve_length=excluded.sleeve_length, shoulder_width=excluded.shoulder_width, 
          total_length=excluded.total_length, condition=excluded.condition, 
          material=excluded.material, color=excluded.color`,
        [
          id, clothing.size, clothing.chest_width, clothing.waist_size, clothing.sleeve_length,
          clothing.shoulder_width, clothing.total_length, clothing.condition, clothing.material, clothing.color
        ]
      )).run();
    } else if (shoes && (catLower.includes('shoe') || catLower.includes('sneaker') || catLower.includes('รองเท้า'))) {
      await (await prepare('DELETE FROM clothing_details WHERE product_id = ?', [id])).run(); // Clean up if type changed
      await (await prepare(
        `INSERT INTO shoe_details (
          product_id, size_eu, size_us, size_uk, insole_cm, condition, material, color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
          size_eu=excluded.size_eu, size_us=excluded.size_us, size_uk=excluded.size_uk, 
          insole_cm=excluded.insole_cm, condition=excluded.condition, 
          material=excluded.material, color=excluded.color`,
        [
          id, shoes.size_eu, shoes.size_us, shoes.size_uk, shoes.insole_cm,
          shoes.condition, shoes.material, shoes.color
        ]
      )).run();
    }

    return success();
  } catch (err) {
    return serverError(err);
  }
}

export async function PATCH(req) {
  try {
    const { ids, status } = await req.json();
    if (!ids || !Array.isArray(ids) || !status) return error('IDs and status are required', 400);

    const placeholders = ids.map(() => '?').join(',');
    await (await prepare(
      `UPDATE products SET status = ? WHERE id IN (${placeholders})`,
      [status, ...ids]
    )).run();

    return success();
  } catch (err) {
    return serverError(err);
  }
}


