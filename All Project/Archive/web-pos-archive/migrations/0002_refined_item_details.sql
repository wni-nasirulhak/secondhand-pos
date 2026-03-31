-- Clothing specialized data
CREATE TABLE IF NOT EXISTS clothing_details (
  product_id INTEGER PRIMARY KEY,
  size TEXT,
  chest_width REAL,
  waist_size REAL,
  sleeve_length REAL,
  shoulder_width REAL,
  total_length REAL,
  condition TEXT,
  material TEXT,
  color TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Shoe specialized data
CREATE TABLE IF NOT EXISTS shoe_details (
  product_id INTEGER PRIMARY KEY,
  size_eu REAL,
  size_us REAL,
  size_uk REAL,
  insole_cm REAL,
  condition TEXT,
  material TEXT,
  color TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
