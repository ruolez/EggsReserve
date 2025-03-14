# XAMPP Deployment Guide for Eggsperience

This guide explains the changes made to fix the routing issue with the `/eggs` route when deployed to an XAMPP server running on port 81.

## Changes Made

1. **Updated Vite Base Path Configuration**
   - Modified `vite.config.ts` to use `/` as the base path for production builds
   - This ensures that assets are loaded correctly

2. **Added .htaccess File**
   - Created a `.htaccess` file in the project root
   - This file configures Apache to redirect all requests to `index.html`
   - Enables client-side routing to work correctly

3. **Updated API Configuration**
   - Modified `src/lib/config.ts` to dynamically determine the API server URL
   - Now uses the current hostname with port 3001 for API requests
   - Ensures API calls work correctly in both development and production

4. **Updated API Call in api.ts**
   - Updated the API call in `sendOrderNotification` function to use the configured URL
   - Replaced hardcoded URL with dynamic configuration

5. **Created Build Script**
   - Added `build-for-xampp.bat` to simplify the build process
   - Ensures the `.htaccess` file is included in the build

## Deployment Instructions

### Prerequisites

1. XAMPP installed with Apache configured to run on port 81
2. Node.js installed for running the email server
3. Apache mod_rewrite module enabled

### Enable mod_rewrite in Apache

1. Open XAMPP Control Panel
2. Click on "Config" for Apache
3. Select "httpd.conf"
4. Ensure these lines are uncommented (remove # if present):
   ```
   LoadModule rewrite_module modules/mod_rewrite.so
   ```
5. Save the file and restart Apache

### Build and Deploy the Frontend

1. Navigate to the Eggsperience project directory
2. Run the build script:
   ```
   build-for-xampp.bat
   ```
3. Copy the contents of the `dist` folder to your XAMPP htdocs directory
   (e.g., `C:\xampp\htdocs\eggs` or a subdirectory)

### Configure and Run the Email Server

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies if not already done:
   ```
   npm install
   ```

3. Start the server:
   ```
   node server.js
   ```
   
   For production, consider using PM2 as described in `server/DEPLOYMENT.md`

## Testing

1. Access your application at `http://localhost:81/eggs` (adjust the port if needed)
2. Verify that the `/eggs` route works correctly and shows the admin PIN dialog
3. Test other routes to ensure they're working as expected

## Troubleshooting

If you encounter issues:

1. **404 Errors on Routes**: 
   - Ensure the `.htaccess` file was copied to the root of your deployment directory
   - Verify that mod_rewrite is enabled in Apache

2. **API Connection Issues**:
   - Check that the Node.js server is running on port 3001
   - Verify there are no firewall rules blocking the connection
   - Check the browser console for CORS errors

3. **Asset Loading Issues**:
   - If images or other assets aren't loading, check the network tab in browser dev tools
   - Ensure the base path in `vite.config.ts` is set correctly

## Additional Notes

- The email server must be running for email notifications to work
- If you change the port of the email server, update the `EMAIL_SERVER_URL` in `src/lib/config.ts`
- For a more robust production setup, consider setting up a reverse proxy as described in `server/DEPLOYMENT.md`
