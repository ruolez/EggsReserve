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
) {
  // Update the order status
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("order_number", orderNumber)
    .select()
    .single();

  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }

  return data;
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

  // Create order and update stock in a transaction using RPC
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (orderError) throw orderError;

  // Update stock
  const { error: stockError } = await supabase.rpc(
    "update_stock_with_validation",
    {
      new_quantity: currentStock.current_quantity - orderData.quantity,
    },
  );

  if (stockError) {
    // If stock update fails, we should ideally roll back the order
    // but since we don't have transaction support in the client,
    // we'll just throw an error
    throw stockError;
  }

  return order;
}
