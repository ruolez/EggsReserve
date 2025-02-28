# EggsReserve Email Server

This is a server-side component for the EggsReserve application that handles sending email notifications for new orders using nodemailer. It sends both admin notifications and customer order confirmations.

## Setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables:
   - The `.env` file should already be set up with the Supabase credentials
   - You can modify the `PORT` if needed (default is 3001)

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Send Email Notification
- **URL**: `/api/send-notification`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "order": {
      "id": "123",
      "order_number": "ORD-123456",
      "customer_name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "created_at": "2025-02-25T12:00:00Z"
    },
    "orderDetails": {
      "product": "Carton of eggs",
      "qty": 2,
      "sale": 10.00
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "adminMessageId": "admin-message-id-from-email-service",
    "customerMessageId": "customer-message-id-from-email-service"
  }
  ```

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

## How It Works

1. The server receives order data from the client application
2. It retrieves email settings from Supabase
3. It uses nodemailer to send two emails:
   - An admin notification to the configured notification email
   - A customer confirmation to the customer's email address
4. It logs both email notifications in Supabase

## Testing Email Functionality

### Testing Admin Notifications

To test if your email configuration is working correctly for admin notifications:

1. Make sure the server is running
2. Configure email settings in the EggsReserve admin panel
3. Run the test script:
   ```bash
   npm run test-email
   ```

This will send test emails (both admin and customer) using your configured settings and display the result.

### Testing Customer Confirmations

To test the customer confirmation email specifically:

1. Make sure the server is running
2. Configure email settings in the EggsReserve admin panel
3. Run the customer test script:
   ```bash
   npm run test-customer-email
   ```

This script will:
- Prompt you to enter an email address
- Send a test order confirmation to that email
- Send the admin notification to your configured admin email
- Display the results of both email operations

## Notes

- This server must be running for email notifications to work
- Email settings must be configured in the admin panel of the EggsReserve application
- For Gmail, you'll need to use an App Password instead of your regular password
- The server stores email notification records in the `email_notifications` table in Supabase
- Both admin notifications and customer confirmations use the same email settings
- Customer confirmation emails have a different template and subject line than admin notifications
