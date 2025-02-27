# EggsReserve Application

A React application for managing egg reservations with Supabase backend integration.

## Features

- Customer reservation form for ordering eggs
- Admin panel for managing orders, inventory, and products
- Email notifications for new orders
- Responsive design with dark/light mode support

## Project Structure

- `src/` - Frontend React application
- `server/` - Server-side component for email notifications
- `supabase/` - Supabase migrations and database schema

## Setup and Running

### Frontend Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at http://localhost:5173 (or the port shown in the terminal)

### Email Server (Required for Email Notifications)

1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

2. Start the server:
   ```bash
   cd server
   npm run dev
   ```

3. The server will run on http://localhost:3001

## Email Notifications

The application supports email notifications for new orders. To enable this feature:

1. Make sure the email server is running
2. Configure email settings in the admin panel:
   - Access the admin section (PIN: 321)
   - Go to the Email tab
   - Configure SMTP settings (for Gmail, use smtp.gmail.com and port 587)
   - For Gmail, you'll need to use an App Password instead of your regular password

## Technologies Used

- React with TypeScript
- Vite for frontend build
- Supabase for backend and database
- Express.js for the email server
- Nodemailer for sending emails
- Tailwind CSS for styling

## Development

- Frontend code is in the `src/` directory
- Server code for email notifications is in the `server/` directory
- Database migrations are in the `supabase/migrations/` directory
