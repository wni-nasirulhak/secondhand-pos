import { success, error, serverError } from '@/lib/api-response';
import { getFirst, prepare, batch } from '@/lib/db';

function normPhone(p) {
  if (!p) return "";
  return String(p).trim().replace(/\D/g, '');
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const { 
      cart, 
      customerPhone, 
      customerAddress, 
      paymentMethod, 
      discountAmount, 
      pointsUsed, 
      newCustomerName 
    } = payload;

    if (!cart || cart.length === 0) return error('Cart is empty');

    const saleNo = `SALE-${Date.now()}`;
    const receiptNo = `REC-${Date.now()}`;
    
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += parseFloat(item.selling_price || item.Price || 0);
    });
    
    const finalPrice = subtotal - (parseFloat(discountAmount) || 0);
    const pointsEarned = Math.floor(finalPrice / 100);

    const targetPhone = normPhone(customerPhone);
    let customerId = null;
    let finalizeCustomerStatement = null;

    // 1. Process Customer (Separate execution to get ID if new, or update existing)
    if (targetPhone) {
      const customer = await getFirst('SELECT id, points, total_spent, address FROM customers WHERE phone = ?', [targetPhone]);
      
      if (customer) {
        customerId = customer.id;
        const newPoints = (customer.points || 0) - (pointsUsed || 0) + pointsEarned;
        const newSpent = (customer.total_spent || 0) + finalPrice;
        
        finalizeCustomerStatement = await prepare(
          'UPDATE customers SET points = ?, total_spent = ?, address = ? WHERE id = ?',
          [newPoints, newSpent, customerAddress ?? customer.address ?? '', customerId]
        );
      } else if (newCustomerName) {
        // Create new customer first to get ID
        const res = await (await prepare(
          'INSERT INTO customers (phone, name, address, points, total_spent) VALUES (?, ?, ?, ?, ?)',
          [targetPhone, newCustomerName, customerAddress || '', pointsEarned, finalPrice]
        )).run();
        customerId = res.meta.last_row_id;
      }
    }

    // 2. Create Sale Header (Execution to get ID)
    const saleHeaderRes = await (await prepare(
      'INSERT INTO sales (sale_no, customer_id, final_total, payment_method, receipt_no) VALUES (?, ?, ?, ?, ?)',
      [saleNo, customerId, finalPrice, paymentMethod || 'Cash', receiptNo]
    )).run();
    const saleId = saleHeaderRes.meta.last_row_id;

    // 3. Batch the rest (Inventory status + Sale Items) for safety
    const atomicStatements = [];
    if (finalizeCustomerStatement) atomicStatements.push(finalizeCustomerStatement);

    for (const item of cart) {
      const product = await getFirst("SELECT id FROM products WHERE barcode_id = ? AND status = 'Available'", [item.barcode_id]);
      if (product) {
        // Update Inventory Status
        atomicStatements.push(await prepare(
          "UPDATE products SET status = 'Sold' WHERE id = ?",
          [product.id]
        ));

        // Add Sale Item
        atomicStatements.push(await prepare(
          'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [saleId, product.id, 1, parseFloat(item.selling_price || 0), parseFloat(item.selling_price || 0)]
        ));
      } else {
        // In a real senior app, we might throw error here to rollback if product is no longer available
        return error(`Product ${item.barcode_id} is no longer available`);
      }
    }

    if (atomicStatements.length > 0) {
      await batch(atomicStatements);
    }

    return success({ saleId: saleNo, receiptNo });
  } catch (err) {
    return serverError(err);
  }
}
