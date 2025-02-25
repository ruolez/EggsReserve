import { supabase } from "./supabase";

export async function getStock() {
  const { data, error } = await supabase
    .from("stock")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  console.log("Fetched orders:", data);
  return data;
}

export async function updateOrderStatus(
  orderNumber: string,
  status: "pending" | "complete",
  newQuantity?: number,
) {
  // Get the current order
  const { data: currentOrder, error: fetchError } = await supabase
    .from("orders")
    .select("quantity,status")
    .eq("order_number", orderNumber)
    .single();

  if (fetchError) throw fetchError;

  // Get current stock
  const { data: stockData, error: stockError } = await supabase
    .from("stock")
    .select("current_quantity")
    .eq("id", 1)
    .single();

  if (stockError) throw stockError;

  // Calculate stock adjustment
  let stockAdjustment = 0;
  if (newQuantity !== undefined && newQuantity !== currentOrder.quantity) {
    stockAdjustment = currentOrder.quantity - newQuantity;
  } else if (status === "complete" && currentOrder.status === "pending") {
    stockAdjustment = currentOrder.quantity;
  }

  // Update stock if needed
  if (stockAdjustment !== 0) {
    const { error: updateStockError } = await supabase.rpc(
      "update_stock_with_validation",
      {
        new_quantity: stockData.current_quantity + stockAdjustment,
      },
    );
    if (updateStockError) throw updateStockError;
  }

  // Update the order
  const updateData: { status?: string; quantity?: number } = {};
  if (status) updateData.status = status;
  if (newQuantity !== undefined) updateData.quantity = newQuantity;

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("order_number", orderNumber)
    .select()
    .single();

  if (error) {
    console.error("Error updating order:", error);
    throw error;
  }

  return data;
}

export async function deleteOrder(orderNumber: string) {
  // First get the order details to know the quantity
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("quantity")
    .eq("order_number", orderNumber)
    .single();

  if (fetchError) {
    console.error("Error fetching order:", fetchError);
    throw fetchError;
  }

  // Get current stock
  const { data: currentStock, error: stockError } = await supabase
    .from("stock")
    .select("current_quantity")
    .eq("id", 1)
    .single();

  if (stockError) {
    console.error("Error fetching stock:", stockError);
    throw stockError;
  }

  // Delete the order
  const { error: deleteError } = await supabase
    .from("orders")
    .delete()
    .eq("order_number", orderNumber);

  if (deleteError) {
    console.error("Error deleting order:", deleteError);
    throw deleteError;
  }

  // Update stock by adding back the quantity
  const { error: updateError } = await supabase.rpc(
    "update_stock_with_validation",
    {
      new_quantity: currentStock.current_quantity + order.quantity,
    },
  );

  if (updateError) {
    console.error("Error updating stock:", updateError);
    throw updateError;
  }
}

export async function updateStock(newQuantity: number) {
  const { data, error } = await supabase
    .rpc("update_stock_with_validation", { new_quantity: newQuantity })
    .single();

  if (error) {
    console.error("Error updating stock:", error);
    throw error;
  }

  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createProduct(productData: {
  name: string;
  sale_price: number;
  cost_price: number;
  sku: string | null;
  upc: string | null;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  productData: {
    name: string;
    sale_price: number;
    cost_price: number;
    sku: string | null;
    upc: string | null;
  },
) {
  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}

export async function createOrder(orderData: {
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  quantity: number;
}) {
  // First check if we have enough stock
  const { data: currentStock } = await supabase
    .from("stock")
    .select("current_quantity")
    .eq("id", 1)
    .single();

  if (!currentStock || currentStock.current_quantity < orderData.quantity) {
    throw new Error("Not enough stock available");
  }

  // Get product pricing
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("name", "Carton of eggs")
    .single();

  if (!product) {
    throw new Error("Product not found");
  }

  // Create order and update stock in a transaction using RPC
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order details
  const { error: detailsError } = await supabase.from("order_details").insert({
    order_id: order.id,
    product: product.name,
    sku: product.sku,
    upc: product.upc,
    qty: orderData.quantity,
    sale: product.sale_price,
    cost: product.cost_price,
  });

  if (detailsError) throw detailsError;

  // Update stock
  const { error: stockError } = await supabase.rpc(
    "update_stock_with_validation",
    {
      new_quantity: currentStock.current_quantity - orderData.quantity,
    },
  );

  if (stockError) {
    throw stockError;
  }

  return order;
}
