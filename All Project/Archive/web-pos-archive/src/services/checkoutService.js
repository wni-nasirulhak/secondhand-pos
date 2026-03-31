import { getFirst, prepare, batch } from '@/lib/db';

function normPhone(p) {
  if (!p) return "";
  return String(p).trim().replace(/\D/g, '');
}

export async function processCheckout(payload) {
  const { 
    cart, customerPhone, customerAddress, 
    paymentMethod, discountAmount, pointsUsed, 
    newCustomerName, shippingCost, packingCost, otherCost 
  } = payload;

  if (!cart || cart.length === 0) throw new Error('Cart is empty');

  const saleNo = `SALE-${Date.now()}`;
  const receiptNo = `REC-${Date.now()}`;
  
  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.selling_price || item.Price || 0), 0);
  const finalPrice = Math.max(0, subtotal - (parseFloat(discountAmount) || 0) - (parseFloat(pointsUsed) || 0) + (parseFloat(shippingCost) || 0) + (parseFloat(packingCost) || 0) + (parseFloat(otherCost) || 0));
  const pointsEarned = Math.floor(finalPrice / 100);

  const targetPhone = normPhone(customerPhone);
  let customerId = null;
  let finalizeCustomerStatement = null;
  let isNewCustomer = false;
  let saleId = null;

  try {
    // 1. Process Customer (Separate execution to get ID if new, or update existing)
    if (targetPhone) {
      const customer = await getFirst('SELECT id, points, total_spent, address FROM customers WHERE phone = ?', [targetPhone]);
      
      if (customer) {
        if (pointsUsed > 0 && (customer.points || 0) < pointsUsed) {
          throw new Error(`ลูกค้ามีแต้มไม่ถึง (มี ${customer.points} แต้ม)`);
        }

        customerId = customer.id;
        const newPoints = Math.max(0, (customer.points || 0) - (pointsUsed || 0)) + pointsEarned;
        const newSpent = (customer.total_spent || 0) + finalPrice;
        
        let newTier = customer.tier || 'Standard';
        if (newSpent >= 100000) newTier = 'Platinum';
        else if (newSpent >= 50000) newTier = 'Gold';
        else if (newSpent >= 10000) newTier = 'Silver';
        
        finalizeCustomerStatement = await prepare(
          'UPDATE customers SET points = ?, total_spent = ?, address = ?, tier = ? WHERE id = ?',
          [newPoints, newSpent, customerAddress ?? customer.address ?? '', newTier, customerId]
        );
      } else if (newCustomerName) {
        const res = await (await prepare(
          'INSERT INTO customers (phone, name, address, points, total_spent) VALUES (?, ?, ?, ?, ?)',
          [targetPhone, newCustomerName, customerAddress || '', pointsEarned, finalPrice]
        )).run();
        customerId = res.meta.last_row_id;
        isNewCustomer = true;
      }
    }

    // 2. Create Sale Header
    const saleHeaderRes = await (await prepare(
      'INSERT INTO sales (sale_no, customer_id, subtotal, final_total, discount_total, shipping_total, packing_total, other_total, payment_method, receipt_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        saleNo, customerId, subtotal, finalPrice, 
        (parseFloat(discountAmount) || 0) + (parseFloat(pointsUsed) || 0),
        parseFloat(shippingCost) || 0,
        parseFloat(packingCost) || 0,
        parseFloat(otherCost) || 0,
        paymentMethod || 'Cash', receiptNo
      ]
    )).run();
    saleId = saleHeaderRes.meta.last_row_id;

    // 3. Batch the rest (Inventory status + Sale Items) for safety
    const atomicStatements = [];
    if (finalizeCustomerStatement) atomicStatements.push(finalizeCustomerStatement);

    for (const item of cart) {
      const product = await getFirst("SELECT id FROM products WHERE barcode_id = ? AND status = 'Available'", [item.barcode_id]);
      if (product) {
        atomicStatements.push(await prepare(
          "UPDATE products SET status = 'Sold' WHERE id = ?",
          [product.id]
        ));
        atomicStatements.push(await prepare(
          'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [saleId, product.id, 1, parseFloat(item.selling_price || 0), parseFloat(item.selling_price || 0)]
        ));
      } else {
        throw new Error(`Product ${item.barcode_id} is no longer available`);
      }
    }

    if (atomicStatements.length > 0) {
      await batch(atomicStatements);
    }

    return { saleId: saleNo, receiptNo };
  } catch (err) {
    try {
      if (saleId) await (await prepare('DELETE FROM sales WHERE id = ?', [saleId])).run();
      if (isNewCustomer && customerId) await (await prepare('DELETE FROM customers WHERE id = ?', [customerId])).run();
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    throw err;
  }
}
