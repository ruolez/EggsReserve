import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// URL for the API endpoint
const API_URL = 'http://localhost:3001/api/increase-stock';

async function testStockIncrease() {
  try {
    console.log('Testing stock increase API...');
    
    // Call the API endpoint
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Parse the response
    const result = await response.json();
    
    console.log('API Response:', result);
  } catch (error) {
    console.error('Error testing stock increase:', error);
  }
}

// Run the test
testStockIncrease();
