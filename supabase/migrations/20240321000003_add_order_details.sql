-- Drop the identity property from orders.id
ALTER TABLE orders ALTER COLUMN id DROP IDENTITY IF EXISTS;

-- Update orders table to use UUID
ALTER TABLE orders
ALTER COLUMN id TYPE UUID USING (uuid_generate_v4()),
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    sku VARCHAR,
    upc VARCHAR,
    sale_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create OrderDetails table
CREATE TABLE order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product VARCHAR NOT NULL,
    sku VARCHAR,
    upc VARCHAR,
    qty INTEGER NOT NULL,
    sale DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    total_sale DECIMAL(10,2) GENERATED ALWAYS AS (qty * sale) STORED,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (qty * cost) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add total column to Orders table
ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) DEFAULT 0;

-- Create a function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total()
 RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total = (SELECT SUM(total_sale) FROM order_details WHERE order_id = NEW.order_id)
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order total
CREATE TRIGGER update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_details
FOR EACH ROW
EXECUTE FUNCTION calculate_order_total();

-- Insert default product pricing
INSERT INTO products (name, sku, upc, sale_price, cost_price)
VALUES ('Carton of eggs', 'EGG-CTN-001', '123456789', 10.00, 7.50);
