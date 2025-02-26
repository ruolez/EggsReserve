import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
