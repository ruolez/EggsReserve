import { supabase } from "./supabase";
import { API_CONFIG, EMAIL_CONFIG } from "./config";

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
    .select("id, quantity, status")
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

  // If quantity was updated, also update the order_details to trigger total recalculation
  if (newQuantity !== undefined && newQuantity !== currentOrder.quantity) {
    // Get the order details
    const { data: orderDetails, error: detailsError } = await supabase
      .from("order_details")
      .select("*")
      .eq("order_id", currentOrder.id)
      .single();

    if (detailsError) {
      console.error("Error fetching order details:", detailsError);
      throw detailsError;
    }

    // Update the quantity in order_details
    const { error: updateDetailsError } = await supabase
      .from("order_details")
      .update({ qty: newQuantity })
      .eq("id", orderDetails.id);

    if (updateDetailsError) {
      console.error("Error updating order details:", updateDetailsError);
      throw updateDetailsError;
    }
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

export async function getEmailSettings() {
  const { data, error } = await supabase
    .from("email_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching email settings:", error);
    // Return default settings if there's an error
    return {
      smtp_host: "",
      smtp_port: 587,
      smtp_user: "",
      smtp_password: "",
      notification_email: "",
    };
  }
  return data;
}

export async function updateEmailSettings(settings: {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  notification_email: string;
}) {
  try {
    // First check if the record exists
    const { data: existingSettings, error: checkError } = await supabase
      .from("email_settings")
      .select("id")
      .eq("id", 1)
      .single();

    if (checkError) {
      console.log("Email settings record doesn't exist, creating it");
      // If it doesn't exist, insert it
      const { data: insertedData, error: insertError } = await supabase
        .from("email_settings")
        .insert([{
          id: 1,
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return insertedData;
    } else {
      // If it exists, update it
      const { data, error } = await supabase
        .from("email_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Error updating email settings:", error);
    throw error;
  }
}


// Send order notification via the server API
async function sendOrderNotification(order: any, orderDetails: any) {
  try {
    // Get email settings to check if they're configured
    const { data: emailSettings, error } = await supabase
      .from("email_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.log("Email notification skipped: Error fetching email settings");
      return;
    }

    // Skip if email settings are not configured
    if (!emailSettings || !emailSettings.notification_email || !emailSettings.smtp_host) {
      console.log("Email notification skipped: Email settings not fully configured");
      return;
    }

    // Call the server API to send the email
    const response = await fetch(`http://solbe.info:3001/api/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order, orderDetails }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email notification');
    }
    
    console.log(`Email notification sent successfully. Message ID: ${result.messageId}`);
    
  } catch (error) {
    console.error("Failed to send order notification:", error);
    // Don't throw the error - we don't want to fail the order if notification fails
  }
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

  // Get order details for email notification
  const { data: orderDetails, error: orderDetailsError } = await supabase
    .from("order_details")
    .select("*")
    .eq("order_id", order.id)
    .single();

  if (!orderDetailsError && orderDetails) {
    // Send email notification (don't await to avoid delaying the response)
    sendOrderNotification(order, orderDetails).catch(err => {
      console.error("Error sending notification email:", err);
    });
  }

  return order;
}
