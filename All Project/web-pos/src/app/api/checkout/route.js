import { NextResponse } from 'next/server';
import { getFirst, query, prepare, batch } from '@/lib/db';

// export const runtime = 'edge';

function normPhone(p) {
  if (!p) return "";
  return String(p).trim().replace(/\D/g, '');
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const { cart, customerPhone, customerAddress, paymentMethod, discountAmount, pointsUsed, newCustomerName } = payload;

    const saleNo = `SALE-${Date.now()}`;
    const receiptNo = `REC-${Date.now()}`;
    const finalPrice = cart.reduce((sum, item) => sum + parseFloat(item.selling_price || item.Price || 0), 0) - (parseFloat(discountAmount) || 0);
    const pointsEarned = Math.floor(finalPrice / 100);

    const statements = [];

    // 1. Process Customer
    const targetPhone = normPhone(customerPhone);
    let customerId = null;

    if (targetPhone) {
      const customer = await getFirst('SELECT id, points, total_spent, address FROM customers WHERE phone = ?', [targetPhone]);
      
      if (customer) {
        customerId = customer.id;
        const newPoints = (customer.points || 0) - (pointsUsed || 0) + pointsEarned;
        const newSpent = (customer.total_spent || 0) + finalPrice;
        
        statements.push(await prepare(
          'UPDATE customers SET points = ?, total_spent = ?, address = ? WHERE id = ?',
          [newPoints, newSpent, customerAddress ?? customer.address ?? '', customerId]
        ));
      } else if (newCustomerName) {
        // Create new customer
        // Note: D1 doesn't support RETURNING id directly in batch easily without sequences, 
        // but we can execute this first or use a generated ID if allowed.
        // For simplicity in edge, we might execute the customer creation first if it's a new customer.
        const res = await (await prepare(
          'INSERT INTO customers (phone, name, address, points, total_spent) VALUES (?, ?, ?, ?, ?)',
          [targetPhone, newCustomerName, customerAddress || '', pointsEarned, finalPrice]
        )).run();
        customerId = res.meta.last_row_id;
      }
    }

    // 2. Create Sale Header
    // We need the sale_id for sale_items. Similar to customer, we might need to get the ID.
    // However, we can use a transaction/batch for the rest.
    const saleHeaderRes = await (await prepare(
      'INSERT INTO sales (sale_no, customer_id, final_total, payment_method, receipt_no) VALUES (?, ?, ?, ?, ?)',
      [saleNo, customerId, finalPrice, paymentMethod || 'Cash', receiptNo]
    )).run();
    const saleId = saleHeaderRes.meta.last_row_id;

    // 3. Process Items
    for (const item of cart) {
      // Find product ID by barcode - ONLY ALLOW 'Available' products
      const product = await getFirst("SELECT id FROM products WHERE barcode_id = ? AND status = 'Available'", [item.barcode_id]);
      if (product) {
        // Update Inventory Status
        statements.push(await prepare(
          "UPDATE products SET status = 'Sold' WHERE id = ?",
          [product.id]
        ));

        // Add Sale Item
        statements.push(await prepare(
          'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [saleId, product.id, 1, parseFloat(item.selling_price || 0), parseFloat(item.selling_price || 0)]
        ));
      }
    }

    if (statements.length > 0) {
      await batch(statements);
    }

    return NextResponse.json({ success: true, saleId: saleNo });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
