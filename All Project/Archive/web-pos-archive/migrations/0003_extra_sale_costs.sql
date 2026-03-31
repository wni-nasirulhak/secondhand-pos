-- Add extra cost columns to sales table
ALTER TABLE sales ADD COLUMN shipping_total REAL DEFAULT 0.0;
ALTER TABLE sales ADD COLUMN packing_total REAL DEFAULT 0.0;
ALTER TABLE sales ADD COLUMN other_total REAL DEFAULT 0.0;
