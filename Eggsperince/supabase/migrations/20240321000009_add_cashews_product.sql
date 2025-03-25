-- Add cashews as a new product
INSERT INTO products (name, sku, upc, sale_price, cost_price)
VALUES ('Dry Roasted Cashews 1 lb', 'CASH-BAG-001', '987654321', 12.50, 8.75)
ON CONFLICT (name) DO NOTHING;
