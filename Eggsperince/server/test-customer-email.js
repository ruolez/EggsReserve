import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load config from the client app if available
let apiUrl = 'http://localhost:3001';
let apiEndpoint = '/api/send-notification';

try {
  // Check if the config file exists in the client app
  const configPath = path.resolve(__dirname, '../src/lib/config.ts');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Extract EMAIL_SERVER_URL using regex
    const serverUrlMatch = configContent.match(/EMAIL_SERVER_URL:\s*['"]([^'"]+)['"]/);
    if (serverUrlMatch && serverUrlMatch[1]) {
      apiUrl = serverUrlMatch[1];
    }
    
    // Extract SEND_NOTIFICATION_ENDPOINT using regex
    const endpointMatch = configContent.match(/SEND_NOTIFICATION_ENDPOINT:\s*['"]([^'"]+)['"]/);
    if (endpointMatch && endpointMatch[1]) {
      apiEndpoint = endpointMatch[1];
    }
    
    console.log(`Loaded configuration from client app: ${apiUrl}${apiEndpoint}`);
  }
} catch (error) {
  console.log('Could not load config from client app, using defaults');
}

// Prompt for email address
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter your email address to receive a test customer confirmation: ', async (email) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format. Please enter a valid email address.');
    readline.close();
    return;
  }

  // Test data with the provided email
  const testOrder = {
    id: 'test-123',
    order_number: 'TEST-ORDER-' + Math.floor(Math.random() * 10000),
    customer_name: 'Test Customer',
    email: email,
    phone: '123-456-7890',
    created_at: new Date().toISOString()
  };

  const testOrderDetails = {
    product: 'Carton of eggs',
    qty: 2,
    sale: 10.00
  };

  try {
    console.log(`Sending test customer confirmation email to ${email}...`);
    
    const response = await fetch(`${apiUrl}${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: testOrder,
        orderDetails: testOrderDetails
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test emails sent successfully!');
      console.log(`Admin Message ID: ${result.adminMessageId}`);
      console.log(`Customer Message ID: ${result.customerMessageId}`);
      console.log(`Admin email sent to: [configured admin email]`);
      console.log(`Customer confirmation email sent to: ${email}`);
      console.log('\nPlease check your inbox for the confirmation email.');
      console.log('Note: It might take a few minutes to arrive, and check your spam folder if you don\'t see it.');
    } else {
      console.error('❌ Failed to send test emails:');
      console.error(result.error || 'Unknown error');
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error(error.message);
    console.error('Make sure the email server is running on http://localhost:3001');
  }
  
  readline.close();
});
