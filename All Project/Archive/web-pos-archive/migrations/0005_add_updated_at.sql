-- Add updated_at to customers if missing
-- Note: SQLite ALTER TABLE doesn't support IF NOT EXISTS for columns easily.
-- But since we know it's missing from previous trial, we add it.
ALTER TABLE customers ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Adding triggers for auto-update if possible, but manual in code is also fine.
