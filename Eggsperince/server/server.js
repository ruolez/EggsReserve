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
app.use(cors());
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

    // Create email content
    const mailOptions = {
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

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Order notification email sent to ${emailSettings.notification_email}`, info.messageId);
    
    // Store notification in Supabase
    try {
      await supabase.from("email_notifications").insert({
        order_id: order.id,
        recipient: emailSettings.notification_email,
        subject: `New Order: #${order.order_number}`,
        sent_at: new Date().toISOString(),
        status: 'sent',
        message_id: info.messageId
      });
    } catch (err) {
      console.log("Note: email_notifications table not available, skipping log entry");
    }

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Failed to send order notification email:", error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Daily stock increase scheduled for midnight');
});
