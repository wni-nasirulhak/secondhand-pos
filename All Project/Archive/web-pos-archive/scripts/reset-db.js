const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const d1Dir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const files = fs.readdirSync(d1Dir).filter(f => f.endsWith('.sqlite'));

let activeDbPath = null;

files.forEach(file => {
  const dbPath = path.join(d1Dir, file);
  try {
    const db = new sqlite3(dbPath);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();
    if (tables) {
      activeDbPath = dbPath;
      console.log('Active DB found:', file);
    }
    db.close();
  } catch (e) {}
});

if (!activeDbPath) {
    if (fs.existsSync('local.db')) {
        const db = new sqlite3('local.db');
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();
        if (tables) {
            activeDbPath = 'local.db';
            console.log('Active DB found in local.db');
        }
        db.close();
    }
}

if (!activeDbPath) {
    console.error('No active database found with "products" table.');
    process.exit(1);
}

const db = new sqlite3(activeDbPath);

console.log('--- Database Reset Start ---');

try {
    // 1. Clear Tables
    console.log('Clearing existing data...');
    const tablesToClear = ['sale_items', 'sales', 'clothing_details', 'shoe_details', 'product_images', 'products', 'categories', 'customers'];
    tablesToClear.forEach(table => {
        try {
            db.prepare(`DELETE FROM ${table}`).run();
            console.log(`- Cleared ${table}`);
        } catch (e) {
            console.log(`- Table ${table} not found or error, skipping.`);
        }
    });

    // 2. Insert Categories
    console.log('Inserting categories (Clothing, Pants, Shoes)...');
    const categories = [
      { id: 1, name: 'Clothing' },
      { id: 2, name: 'Pants' },
      { id: 3, name: 'Shoes' }
    ];

    const insertCategory = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
    categories.forEach(c => insertCategory.run(c.id, c.name));

    // 3. Insert Mock Products
    console.log('Inserting mock products...');
    const products = [
      // Clothing (Cat 1)
      { name: 'Oversized Cotton Tee', cat_id: 1, price: 450, cost: 200, barcode: 'CLO-001', brand: 'UrbanStyle', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' },
      { name: 'Vintage Denim Jacket', cat_id: 1, price: 1200, cost: 600, barcode: 'CLO-002', brand: 'RetroFit', img: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800' },
      { name: 'Knit Wool Sweater', cat_id: 1, price: 890, cost: 400, barcode: 'CLO-003', brand: 'CozyCorner', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800' },
      { name: 'Silk Button-up Shirt', cat_id: 1, price: 1500, cost: 800, barcode: 'CLO-004', brand: 'LuxeWear', img: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?w=800' },
      
      // Pants (Cat 2)
      { name: 'Slim Fit Chinos', cat_id: 2, price: 750, cost: 350, barcode: 'PAN-001', brand: 'StyleMakers', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800' },
      { name: 'Classic Blue Jeans', cat_id: 2, price: 950, cost: 450, barcode: 'PAN-002', brand: 'DenimCo', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800' },
      { name: 'Cargo Joggers', cat_id: 2, price: 650, cost: 300, barcode: 'PAN-003', brand: 'ActiveGear', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { name: 'Linen Summer Trousers', cat_id: 2, price: 850, cost: 400, barcode: 'PAN-004', brand: 'BreezeLine', img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800' },

      // Shoes (Cat 3)
      { name: 'White Leather Sneakers', cat_id: 3, price: 1800, cost: 900, barcode: 'SHOE-001', brand: 'StepAhead', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800' },
      { name: 'Running Shoes X-200', cat_id: 3, price: 2500, cost: 1200, barcode: 'SHOE-002', brand: 'Velocity', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
      { name: 'Classic Brown Loafers', cat_id: 3, price: 2200, cost: 1100, barcode: 'SHOE-003', brand: 'GentleSteps', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800' },
      { name: 'High-top Canvas Shoes', cat_id: 3, price: 1200, cost: 500, barcode: 'SHOE-004', brand: 'StreetWear', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800' }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (barcode_id, item_name, brand, category_id, cost_price, selling_price, status, description)
      VALUES (?, ?, ?, ?, ?, ?, 'Available', 'Mock data product for demo')
    `);

    const insertImage = db.prepare(`
        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (?, ?, 1)
    `);

    products.forEach(p => {
        const res = insertProduct.run(p.barcode, p.name, p.brand, p.cat_id, p.cost, p.price);
        const productId = res.lastInsertRowid;
        insertImage.run(productId, p.img);
        
        // Add minimal details to avoid frontend issues
        if (p.cat_id === 3) {
            db.prepare('INSERT INTO shoe_details (product_id, size_eu, condition) VALUES (?, ?, ?)')
              .run(productId, '42', 'New');
        } else {
            db.prepare('INSERT INTO clothing_details (product_id, size, condition) VALUES (?, ?, ?)')
              .run(productId, 'M', 'New');
        }
    });

    // 4. Insert Mock Customers
    console.log('Inserting mock customers...');
    const customers = [
      { name: 'Jane Doe', phone: '0812345678', address: '123 Sukhumvit, Bangkok', points: 500, spent: 5000 },
      { name: 'John Smith', phone: '0898765432', address: '456 Sathorn, Bangkok', points: 150, spent: 1200 },
      { name: 'Somchai Dee', phone: '0855554444', address: '789 Ari, Bangkok', points: 1000, spent: 15000 },
      { name: 'Alice Walker', phone: '0877778888', address: '101 Silom, Bangkok', points: 50, spent: 500 }
    ];

    const insertCustomer = db.prepare(`
      INSERT INTO customers (name, phone, address, points, total_spent, tier)
      VALUES (?, ?, ?, ?, ?, 'Regular')
    `);

    customers.forEach(c => insertCustomer.run(c.name, c.phone, c.address, c.points, c.spent));

    console.log('--- Database Reset Complete ---');
} catch (err) {
    console.error('Error during reset:', err.message);
} finally {
    db.close();
}
