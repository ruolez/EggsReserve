-- Drop existing tables if they exist
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS stock;

-- Create stock table
CREATE TABLE stock (
  id BIGINT PRIMARY KEY DEFAULT 1,
  current_quantity INTEGER NOT NULL DEFAULT 50,
  max_quantity INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial stock record
INSERT INTO stock (id, current_quantity, max_quantity)
VALUES (1, 50, 100)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous read access to stock"
  ON stock FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous update access to stock"
  ON stock FOR UPDATE
  TO anon
  USING (id = 1)
  WITH CHECK (id = 1);

CREATE POLICY "Allow anonymous read access to orders"
  ON orders FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to orders"
  ON orders FOR UPDATE
  TO anon
  USING (true);

-- Create stock update function
CREATE OR REPLACE FUNCTION update_stock_with_validation(new_quantity INTEGER)
RETURNS stock
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result stock;
BEGIN
  -- Check if new quantity is negative
  IF new_quantity < 0 THEN
    RAISE EXCEPTION 'Stock quantity cannot be negative';
  END IF;

  -- Get max_quantity
  SELECT * INTO result FROM stock WHERE id = 1;
  
  -- Check if new quantity exceeds max_quantity
  IF new_quantity > result.max_quantity THEN
    RAISE EXCEPTION 'Stock quantity cannot exceed maximum of %', result.max_quantity;
  END IF;

  -- Update stock
  UPDATE stock 
  SET 
    current_quantity = new_quantity,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
  RETURNING * INTO result;

  RETURN result;
END;
$$;