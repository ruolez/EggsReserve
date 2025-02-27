-- Create enum for order status
CREATE TYPE order_status AS ENUM ('pending', 'complete');

-- Modify orders table to use the enum
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::order_status;

-- Set default value
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'::order_status;