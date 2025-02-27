-- Add flag column to orders table
ALTER TABLE orders ADD COLUMN is_flagged BOOLEAN DEFAULT false;

-- Create index for faster sorting
CREATE INDEX idx_orders_is_flagged ON orders(is_flagged);
