-- Create function to update order status
CREATE OR REPLACE FUNCTION update_order_status(p_order_number TEXT, p_status order_status)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_order orders;
BEGIN
  UPDATE orders
  SET 
    status = p_status,
    updated_at = CURRENT_TIMESTAMP
  WHERE order_number = p_order_number
  RETURNING * INTO updated_order;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  RETURN updated_order;
END;
$$;