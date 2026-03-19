-- [B] Performance Optimization: Strategic Indexes
-- For inventory lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- For customer searches
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- For sales reports and history
CREATE INDEX IF NOT EXISTS idx_sales_sale_no ON sales(sale_no);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_timestamp ON sales(timestamp);

-- For sale items lookups
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
