-- Seed Mock Data for Web-POS

-- Insert Categories
INSERT OR IGNORE INTO categories (name) VALUES 
('Clothing'), ('Electronics'), ('Home'), ('Accessories'), ('Shoes'), ('Vintage'), ('Toys');

-- Insert Staff
INSERT OR IGNORE INTO staff (name, username, password_hash, role) VALUES 
('Admin User', 'admin', 'hashed_pw', 'Admin');

-- Insert 50 Mock Products (loop like approach via SQL or just flat inserts)
-- I will do a few variety sets
INSERT INTO products (barcode_id, item_name, brand, category_id, cost_price, selling_price, status, description) VALUES
('P001', 'Vintage Denim Jacket', 'Levis', 1, 500, 1200, 'Available', 'Classic vintage denim jacket in good condition.'),
('P002', 'Modern T-Shirt White', 'Uniqlo', 1, 150, 390, 'Available', 'Minimalist white t-shirt.'),
('P003', 'Mechanical Keyboard', 'Keychron', 2, 2000, 3500, 'Available', 'RGB wireless mechanical keyboard.'),
('P004', 'Ceramic Table Lamp', 'IKEA', 3, 300, 790, 'Available', 'Warm white desk lamp.'),
('P005', 'Retro Running Shoes', 'Nike', 5, 1200, 2500, 'Available', 'Classic 80s style runners.'),
('P006', 'Leather Wallet', 'Coach', 4, 800, 1500, 'Available', 'Premium brown leather wallet.'),
('P007', 'Bluetooth Headphones', 'Sony', 2, 3000, 5900, 'Sold', 'Noise cancelling over-ear headphones.'),
('P008', 'Striped Summer Dress', 'Zara', 1, 400, 990, 'Available', 'Light and breezy summer dress.'),
('P009', 'Analog Watch', 'Seiko', 4, 2500, 4500, 'Available', 'Automatic mechanical watch.'),
('P010', 'Glass Water Bottle', 'BKR', 3, 100, 450, 'Available', 'Eco-friendly glass bottle.'),
('P011', 'Linen Button Down', 'Muji', 1, 350, 890, 'Available', 'Breathable linen shirt.'),
('P012', 'Smart Light Bulb', 'Philips', 2, 400, 990, 'Available', 'WiFi controllable smart bulb.'),
('P013', 'Succulent Pot', 'Local', 3, 50, 150, 'Available', 'Small green succulent plant.'),
('P014', 'Oversized Hoodie', 'H&M', 1, 300, 790, 'Available', 'Cozy grey hoodie.'),
('P015', 'Portable Charger', 'Anker', 2, 500, 1200, 'Available', '20000mAh fast charge power bank.'),
('P016', 'Wool Scarf', 'Uniqlo', 4, 200, 590, 'Available', 'Soft winter scarf.'),
('P017', 'Canvas Backpack', 'Vans', 4, 600, 1490, 'Available', 'Classic school backpack.'),
('P018', 'Yoga Mat', 'Lululemon', 5, 800, 1900, 'Available', 'Non-slip high quality yoga mat.'),
('P019', 'Polaroid Camera', 'Instax', 2, 1500, 2800, 'Available', 'Instant film camera.'),
('P020', 'Coffee Grinder', 'Hario', 3, 400, 950, 'Available', 'Manual ceramic burr grinder.'),
('P021', 'Beanie Hat', 'The North Face', 4, 250, 690, 'Available', 'Warm winter beanie.'),
('P022', 'Electric Kettle', 'Xiaomi', 2, 450, 1100, 'Available', 'Smart temperature control kettle.'),
('P023', 'Scented Candle', 'Diptyque', 3, 700, 1800, 'Available', 'Luxury rose scented candle.'),
('P024', 'Corduroy Pants', 'Dickies', 1, 800, 1890, 'Available', 'Durable corduroy trousers.'),
('P025', 'Leather Boots', 'Dr. Martens', 5, 2500, 5500, 'Available', 'Classic 1460 8-eye boots.'),
('P026', 'Kitchen Scale', 'Standard', 3, 150, 450, 'Available', 'Digital precision scale.'),
('P027', 'Sunglasses', 'Ray-Ban', 4, 2000, 4800, 'Available', 'Classic aviator style.'),
('P028', 'Duffle Bag', 'Adidas', 4, 700, 1600, 'Available', 'Sporty gym and travel bag.'),
('P029', 'Wireless Mouse', 'Logitech', 2, 600, 1490, 'Available', 'Ergonomic office mouse.'),
('P030', 'Planter Box', 'Wooden', 3, 300, 850, 'Available', 'Handmade cedar planter.'),
('P031', 'Flannel Shirt', 'Pendleton', 1, 900, 2200, 'Available', 'Heavyweight flannel shirt.'),
('P032', 'Silk Pillowcase', 'Slip', 3, 400, 1200, 'Available', 'Pure silk for hair and skin.'),
('P033', 'Earbuds', 'Apple', 2, 3500, 6900, 'Available', 'AirPods Pro with ANC.'),
('P034', 'Running Shorts', 'Nike', 1, 400, 890, 'Available', 'Fast drying athletic shorts.'),
('P035', 'Umbrella', 'Fulton', 4, 300, 850, 'Available', 'Windproof clear umbrella.'),
('P036', 'Notebook', 'Moleskine', 4, 200, 650, 'Available', 'Classic hard cover notebook.'),
('P037', 'Tea Infuser', 'Bodum', 3, 150, 490, 'Available', 'Glass and steel tea steeper.'),
('P038', 'Canvas Tote', 'BAGGU', 4, 150, 450, 'Available', 'Reusable heavy duty tote.'),
('P039', 'Desk Organizer', 'Clear', 3, 100, 390, 'Available', 'Acrylic multipurpose storage.'),
('P040', 'Hooded Raincoat', 'Patagonia', 1, 2000, 4900, 'Available', 'Waterproof outdoor jacket.'),
('P041', 'Hiking Socks', 'Smartwool', 4, 200, 550, 'Available', 'Merino wool performance socks.'),
('P042', 'Stainless Flask', 'Hydro Flask', 3, 600, 1490, 'Available', 'Vacuum insulated 32oz bottle.'),
('P043', 'Record Player', 'Audio-Technica', 2, 4500, 8900, 'Available', 'Automatic belt-drive turntable.'),
('P044', 'Vinyl Record', 'Classic Rock', 6, 400, 1200, 'Available', 'Pink Floyd - Dark Side of the Moon.'),
('P045', 'Comic Book', 'Marvel', 6, 100, 450, 'Available', 'Spider-Man Vintage Edition.'),
('P046', 'Board Game', 'Catan', 7, 800, 1800, 'Available', 'Settlers of Catan Base Game.'),
('P047', 'Puzzle', 'Ravensburger', 7, 300, 850, 'Available', '1000 piece landscape puzzle.'),
('P048', 'Action Figure', 'Star Wars', 7, 500, 1200, 'Available', 'Mandalorian Black Series.'),
('P049', 'Lego Set', 'Lego', 7, 1200, 2900, 'Available', 'Star Wars X-Wing Fighter.'),
('P050', 'Art Print', 'Gallery', 3, 400, 1500, 'Available', 'Minimalist abstract wall art.');

-- Insert some Mock Customers
INSERT INTO customers (phone, name, points, total_spent, tier) VALUES
('0812345678', 'John Doe', 150, 15000, 'Gold'),
('0898765432', 'Jane Smith', 50, 5000, 'Standard'),
('0855554444', 'Somchai Dee', 200, 20000, 'Platinum'),
('0866667777', 'Kanya Rak', 10, 1200, 'Standard');
