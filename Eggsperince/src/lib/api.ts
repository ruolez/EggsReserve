import { supabase } from "./supabase";
import { API_CONFIG, EMAIL_CONFIG } from "./config";
import { parse, unparse } from 'papaparse';
import { isValid } from 'date-fns';

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
  isFlagged?: boolean,
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
  }
  // Removed the condition that was adjusting inventory when status changes from pending to complete

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
  const updateData: { status?: string; quantity?: number; is_flagged?: boolean } = {};
  if (status) updateData.status = status;
  if (newQuantity !== undefined) updateData.quantity = newQuantity;
  if (isFlagged !== undefined) updateData.is_flagged = isFlagged;

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

export async function getOrderDetails(orderId: string) {
  const { data, error } = await supabase
    .from("order_details")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }

  return data;
}

export async function updateOrderFlag(orderNumber: string, isFlagged: boolean) {
  const { data, error } = await supabase
    .from("orders")
    .update({ is_flagged: isFlagged })
    .eq("order_number", orderNumber)
    .select()
    .single();

  if (error) {
    console.error("Error updating order flag:", error);
    throw error;
  }

  return data;
}

export async function getOrdersWithDetails() {
  // First get all orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
    throw ordersError;
  }

  // Then get all order details
  const { data: allOrderDetails, error: detailsError } = await supabase
    .from("order_details")
    .select("*");

  if (detailsError) {
    console.error("Error fetching order details:", detailsError);
    throw detailsError;
  }

  // Create a map of order details by order_id for quick lookup
  const orderDetailsMap = allOrderDetails.reduce((map, detail) => {
    map[detail.order_id] = detail;
    return map;
  }, {});

  // Combine orders with their details
  const ordersWithDetails = orders.map(order => ({
    ...order,
    details: orderDetailsMap[order.id] || null
  }));

  return ordersWithDetails;
}

export function exportOrdersToCSV(ordersWithDetails) {
  // Define the CSV columns
  const csvData = ordersWithDetails.map(order => {
    const details = order.details || {};
    return {
      order_number: order.order_number,
      customer_name: order.customer_name,
      email: order.email,
      phone: order.phone,
      status: order.status,
      created_at: order.created_at,
      product: details.product || '',
      sku: details.sku || '',
      upc: details.upc || '',
      quantity: order.quantity,
      sale_price: details.sale || 0,
      cost_price: details.cost || 0,
      total: order.total || 0
    };
  });

  // Convert to CSV
  const csv = unparse(csvData);
  return csv;
}

// Coop Management Functions
export async function getCoops() {
  const { data, error } = await supabase
    .from("coops")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching coops:", error);
    throw error;
  }

  return data;
}

export async function getCoop(id: string) {
  const { data, error } = await supabase
    .from("coops")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching coop:", error);
    throw error;
  }

  return data;
}

export async function createCoop(coopData: {
  name: string;
  num_birds: number;
  has_rooster: boolean;
}) {
  const { data, error } = await supabase
    .from("coops")
    .insert([coopData])
    .select()
    .single();

  if (error) {
    console.error("Error creating coop:", error);
    throw error;
  }

  return data;
}

export async function updateCoop(
  id: string,
  coopData: {
    name?: string;
    num_birds?: number;
    has_rooster?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("coops")
    .update(coopData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating coop:", error);
    throw error;
  }

  return data;
}

export async function deleteCoop(id: string) {
  const { error } = await supabase
    .from("coops")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting coop:", error);
    throw error;
  }
}

// Harvest Management Functions
export async function getHarvests(filters?: {
  coop_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  let query = supabase
    .from("harvests")
    .select(`
      *,
      coops (
        id,
        name
      )
    `)
    .order("collection_date", { ascending: false });

  if (filters?.coop_id) {
    query = query.eq("coop_id", filters.coop_id);
  }

  if (filters?.start_date) {
    query = query.gte("collection_date", filters.start_date);
  }

  if (filters?.end_date) {
    query = query.lte("collection_date", filters.end_date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching harvests:", error);
    throw error;
  }

  return data;
}

export async function recordHarvest(harvestData: {
  coop_id: string;
  eggs_collected: number;
  collection_date?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("harvests")
    .insert([harvestData])
    .select()
    .single();

  if (error) {
    console.error("Error recording harvest:", error);
    throw error;
  }

  return data;
}

export async function updateHarvest(
  id: string,
  harvestData: {
    coop_id?: string;
    eggs_collected?: number;
    collection_date?: string;
    notes?: string;
  }
) {
  const { data, error } = await supabase
    .from("harvests")
    .update(harvestData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating harvest:", error);
    throw error;
  }

  return data;
}

export async function deleteHarvest(id: string) {
  const { error } = await supabase
    .from("harvests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting harvest:", error);
    throw error;
  }
}

// Statistics Functions
export async function getHarvestStatistics(filters?: {
  coop_id?: string;
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month' | 'coop';
}) {
  // Get all harvests based on filters
  const harvests = await getHarvests(filters);
  
  if (!harvests || harvests.length === 0) {
    return {
      totalEggs: 0,
      averagePerDay: 0,
      byCoops: [],
      byDate: []
    };
  }

  // Calculate total eggs
  const totalEggs = harvests.reduce((sum, h) => sum + h.eggs_collected, 0);
  
  // Group by coop
  const coopMap = new Map();
  harvests.forEach(h => {
    const coopId = h.coop_id;
    const coopName = h.coops?.name || 'Unknown';
    
    if (!coopMap.has(coopId)) {
      coopMap.set(coopId, { 
        id: coopId, 
        name: coopName, 
        totalEggs: 0 
      });
    }
    
    coopMap.get(coopId).totalEggs += h.eggs_collected;
  });
  
  // Group by date
  const dateMap = new Map();
  harvests.forEach(h => {
    const date = h.collection_date;
    
    if (!dateMap.has(date)) {
      dateMap.set(date, { 
        date, 
        totalEggs: 0 
      });
    }
    
    dateMap.get(date).totalEggs += h.eggs_collected;
  });
  
  // Calculate average per day
  const uniqueDates = new Set(harvests.map(h => h.collection_date)).size;
  const averagePerDay = uniqueDates > 0 ? totalEggs / uniqueDates : 0;
  
  return {
    totalEggs,
    averagePerDay,
    byCoops: Array.from(coopMap.values()),
    byDate: Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  };
}

export function exportHarvestData(harvests) {
  // Define the CSV columns
  const csvData = harvests.map(harvest => {
    return {
      coop_name: harvest.coops?.name || 'Unknown',
      collection_date: harvest.collection_date,
      eggs_collected: harvest.eggs_collected,
      notes: harvest.notes || ''
    };
  });

  // Convert to CSV
  const csv = unparse(csvData);
  return csv;
}

export async function importOrdersFromCSV(csvContent: string) {
  // Parse CSV content
  interface CSVRow {
    order_number: string;
    customer_name: string;
    email: string;
    phone?: string;
    status?: string;
    quantity: string;
    product?: string;
    sku?: string;
    upc?: string;
    sale_price?: string;
    cost_price?: string;
    created_at?: string; // Added created_at field
  }
  
  const { data } = parse<CSVRow>(csvContent, { header: true, skipEmptyLines: true });
  
  const results = {
    success: 0,
    errors: [] as string[]
  };
  
  // Process each row
  for (const row of data) {
    try {
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", row.order_number)
        .single();
      
      if (existingOrder) {
        results.errors.push(`Order ${row.order_number} already exists`);
        continue;
      }
      
      // Validate required fields
      if (!row.order_number || !row.customer_name || !row.email || !row.quantity) {
        results.errors.push(`Missing required fields for order ${row.order_number || 'unknown'}`);
        continue;
      }
      
      // Parse and validate the created_at date if provided
      let createdAt = new Date().toISOString();
      if (row.created_at) {
        try {
          // Try to parse the date from the CSV
          const parsedDate = new Date(row.created_at);
          if (isValid(parsedDate)) {
            createdAt = parsedDate.toISOString();
          }
        } catch (e) {
          console.warn(`Invalid date format for order ${row.order_number}, using current date instead`);
        }
      }
      
      // Create order data
      const orderData = {
        order_number: row.order_number,
        customer_name: row.customer_name,
        email: row.email,
        phone: row.phone || '',
        quantity: parseInt(row.quantity),
        status: row.status === 'complete' ? 'complete' : 'pending',
        created_at: createdAt // Use the date from CSV or default to current date
      };
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();
      
      if (orderError) {
        results.errors.push(`Error creating order ${row.order_number}: ${orderError.message}`);
        continue;
      }
      
      // Create order details
      const detailsData = {
        order_id: order.id,
        product: row.product || 'Carton of eggs',
        sku: row.sku || '',
        upc: row.upc || '',
        qty: parseInt(row.quantity),
        sale: parseFloat(row.sale_price) || 10.00,
        cost: parseFloat(row.cost_price) || 7.50
      };
      
      const { error: detailsError } = await supabase
        .from("order_details")
        .insert([detailsData]);
      
      if (detailsError) {
        results.errors.push(`Error creating details for order ${row.order_number}: ${detailsError.message}`);
        // Delete the order since details failed
        await supabase.from("orders").delete().eq("id", order.id);
        continue;
      }
      
      results.success++;
    } catch (error) {
      results.errors.push(`Unexpected error processing order ${row.order_number || 'unknown'}: ${error.message}`);
    }
  }
  
  // Note: We no longer update stock when importing orders
  
  return results;
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
