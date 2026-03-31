-- Add Status Column to Sales Table
ALTER TABLE sales ADD COLUMN status TEXT DEFAULT 'Completed';
