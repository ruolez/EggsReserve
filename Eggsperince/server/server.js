import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
/* app.use(cors()); */ // Disabled: CORS handled by nginx
app.use(express.json());

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API endpoint to send email notifications
app.post('/api/send-notification', async (req, res) => {
  try {
    const { order, orderDetails } = req.body;
    
    if (!order || !orderDetails) {
      return res.status(400).json({ error: 'Missing order or order details' });
    }

    // Get email settings from Supabase
    const { data: emailSettings, error } = await supabase
      .from("email_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.log("Email notification skipped: Error fetching email settings");
      return res.status(500).json({ error: 'Failed to fetch email settings' });
    }

    // Skip if email settings are not configured
    if (!emailSettings || !emailSettings.notification_email || !emailSettings.smtp_host) {
      console.log("Email notification skipped: Email settings not fully configured");
      return res.status(400).json({ error: 'Email settings not fully configured' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port,
      secure: emailSettings.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: emailSettings.smtp_user,
        pass: emailSettings.smtp_password,
      },
    });

    // Format the order details
    const orderDate = new Date(order.created_at).toLocaleString();
    const totalAmount = orderDetails.qty * orderDetails.sale;

    // Create email content for admin notification
    const adminMailOptions = {
      from: emailSettings.smtp_user,
      to: emailSettings.notification_email,
      subject: `New Order: #${order.order_number}`,
      html: `
        <h1>New Order Received</h1>
        <p><strong>Order #:</strong> ${order.order_number}</p>
        <p><strong>Date:</strong> ${orderDate}</p>
        <p><strong>Customer:</strong> ${order.customer_name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <h2>Order Details</h2>
        <table border="1" cellpadding="5" style="border-collapse: collapse;">
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
          <tr>
            <td>${orderDetails.product}</td>
            <td>${orderDetails.qty}</td>
            <td>$${orderDetails.sale.toFixed(2)}</td>
            <td>$${totalAmount.toFixed(2)}</td>
          </tr>
        </table>
        <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
      `,
    };

    // Create email content for customer confirmation
    const customerMailOptions = {
      from: emailSettings.smtp_user,
      to: order.email,
      subject: `Order Confirmation: #${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #4CAF50;">Order Confirmed!</h1>
            <p>Thank you for your reservation, ${order.customer_name}.</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Total</th>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${orderDetails.product}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${orderDetails.qty}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${orderDetails.sale.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </table>
            
            <p style="font-size: 18px;"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>If you have any questions about your order, please contact us.</p>
            <p>© ${new Date().getFullYear()} SolBe Organics Inc. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send admin notification email
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log(`Order notification email sent to admin (${emailSettings.notification_email})`, adminInfo.messageId);
    
    // Store admin notification in Supabase
    try {
      await supabase.from("email_notifications").insert({
        order_id: order.id,
        recipient: emailSettings.notification_email,
        subject: `New Order: #${order.order_number}`,
        sent_at: new Date().toISOString(),
        status: 'sent',
        message_id: adminInfo.messageId
      });
    } catch (err) {
      console.log("Note: email_notifications table not available, skipping log entry");
    }

    // Send customer confirmation email
    const customerInfo = await transporter.sendMail(customerMailOptions);
    console.log(`Order confirmation email sent to customer (${order.email})`, customerInfo.messageId);
    
    // Store customer notification in Supabase
    try {
      await supabase.from("email_notifications").insert({
        order_id: order.id,
        recipient: order.email,
        subject: `Order Confirmation: #${order.order_number}`,
        sent_at: new Date().toISOString(),
        status: 'sent',
        message_id: customerInfo.messageId
      });
    } catch (err) {
      console.log("Note: email_notifications table not available, skipping log entry");
    }

    return res.status(200).json({ 
      success: true, 
      adminMessageId: adminInfo.messageId,
      customerMessageId: customerInfo.messageId
    });
  } catch (error) {
    console.error("Failed to send order notification email:", error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Expenses API endpoints
app.get('/api/expenses', async (req, res) => {
  try {
    const { name, start_date, end_date } = req.query;
    
    let query = supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });
    
    if (name) {
      query = query.ilike("name", `%${name}%`);
    }
    
    if (start_date) {
      query = query.gte("date", start_date);
    }
    
    if (end_date) {
      query = query.lte("date", end_date);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching expenses:", error);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in expenses endpoint:", error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { name, quantity, cost, date, total_cost } = req.body;
    
    if (!name || !quantity || !cost || !date || !total_cost) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
      .from("expenses")
      .insert([{
        name,
        quantity,
        cost,
        date,
        total_cost
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating expense:", error);
      return res.status(500).json({ error: 'Failed to create expense' });
    }
    
    return res.status(201).json(data);
  } catch (error) {
    console.error("Error in create expense endpoint:", error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, cost, date, total_cost } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing expense ID' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (cost !== undefined) updateData.cost = cost;
    if (date !== undefined) updateData.date = date;
    if (total_cost !== undefined) updateData.total_cost = total_cost;
    
    const { data, error } = await supabase
      .from("expenses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating expense:", error);
      return res.status(500).json({ error: 'Failed to update expense' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in update expense endpoint:", error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing expense ID' });
    }
    
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting expense:", error);
      return res.status(500).json({ error: 'Failed to delete expense' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in delete expense endpoint:", error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Function to automatically increase stock by 3 cartons
async function increaseStockDaily() {
  try {
    console.log('Running daily stock increase...');
    
    // Get current stock
    const { data: currentStock, error: fetchError } = await supabase
      .from("stock")
      .select("current_quantity, max_quantity")
      .eq("id", 1)
      .single();
    
    if (fetchError) {
      console.error("Error fetching current stock:", fetchError);
      return;
    }
    
    // Calculate new stock (current + 3)
    const newQuantity = Math.min(currentStock.current_quantity + 3, currentStock.max_quantity);
    
    // Update stock using the existing validation function
    const { data: updatedStock, error: updateError } = await supabase.rpc(
      "update_stock_with_validation",
      { new_quantity: newQuantity }
    );
    
    if (updateError) {
      console.error("Error updating stock:", updateError);
      return;
    }
    
    console.log(`Stock automatically increased to ${updatedStock.current_quantity}`);
  } catch (error) {
    console.error("Error in daily stock increase:", error);
  }
}

// API endpoint to manually trigger stock increase (for testing)
app.post('/api/increase-stock', async (req, res) => {
  try {
    await increaseStockDaily();
    res.status(200).json({ success: true, message: 'Stock increased successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to increase stock', details: error.message });
  }
});

// Schedule the stock increase to run daily at midnight
cron.schedule('0 0 * * *', increaseStockDaily, {
  scheduled: true,
  timezone: "America/Los_Angeles" // Adjust timezone as needed
});

// Start the server
/*
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Daily stock increase scheduled for midnight');
});
*/
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT} (localhost only)`);
  console.log('Daily stock increase scheduled for midnight');
});