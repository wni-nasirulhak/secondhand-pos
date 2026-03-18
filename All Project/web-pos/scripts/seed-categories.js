import { query, prepare } from '../src/lib/db.js';

async function seed() {
  const categories = [
    'Clothing', 'Electronics', 'Home', 'Accessories', 'Shoes', 'Vintage', 'Toys'
  ];

  console.log('Seeding categories...');
  for (const cat of categories) {
    try {
      await (await prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)', [cat])).run();
      console.log(`- Checked category: ${cat}`);
    } catch (e) {
      console.error(`- Error seeding ${cat}:`, e.message);
    }
  }
  console.log('Seeding completed.');
}

seed().catch(console.error);
