# Deploying the Email Server with XAMPP

This guide explains how to deploy the email server alongside your React application using XAMPP.

## Option 1: Run the Node.js Server Separately (Recommended for Development)

This is the simplest approach but requires you to manually start the server.

1. Build your React app as usual:
   ```bash
   npm run build
   ```

2. Copy the contents of the `dist` folder to your XAMPP htdocs folder.

3. Install the server dependencies:
   ```bash
   cd server
   npm install
   ```

4. Start the server:
   ```bash
   node server.js
   ```

5. The server will run on port 3001 (or the port specified in your .env file).

## Option 2: Use PM2 to Keep the Server Running (Recommended for Production)

PM2 is a process manager for Node.js applications that keeps your server running and restarts it if it crashes.

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Navigate to your server directory:
   ```bash
   cd server
   ```

3. Start the server with PM2:
   ```bash
   pm2 start server.js --name "eggs-reserve-email-server"
   ```

4. Set PM2 to start on system boot:
   ```bash
   pm2 startup
   ```
   Follow the instructions provided by the command.

5. Save the current PM2 process list:
   ```bash
   pm2 save
   ```

6. To check the status of your server:
   ```bash
   pm2 status
   ```

7. To view logs:
   ```bash
   pm2 logs eggs-reserve-email-server
   ```

## Option 3: Configure Apache to Proxy Requests to Node.js

This approach allows you to serve both the React app and the API from the same domain/port.

1. Enable required Apache modules:
   - Open XAMPP Control Panel
   - Click on "Config" for Apache
   - Select "httpd.conf"
   - Ensure these lines are uncommented (remove # if present):
     ```
     LoadModule proxy_module modules/mod_proxy.so
     LoadModule proxy_http_module modules/mod_proxy_http.so
     ```

2. Create a virtual host configuration:
   - Create or edit your virtual host file (usually in `xampp/apache/conf/extra/httpd-vhosts.conf`)
   - Add the following configuration:

   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       DocumentRoot "C:/xampp/htdocs/eggs-reserve"
       
       # Proxy API requests to Node.js server
       ProxyRequests Off
       ProxyPreserveHost On
       
       <Location /api>
           ProxyPass http://localhost:3001/api
           ProxyPassReverse http://localhost:3001/api
       </Location>
       
       <Directory "C:/xampp/htdocs/eggs-reserve">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

3. Update your client-side API calls:
   - Modify `src/lib/api.ts` to use relative URLs instead of absolute URLs:
   
   ```typescript
   // Change this:
   const response = await fetch('http://localhost:3001/api/send-notification', {...});
   
   // To this:
   const response = await fetch('/api/send-notification', {...});
   ```

4. Restart Apache from the XAMPP Control Panel.

5. Start your Node.js server using Option 1 or Option 2 above.

## Option 4: Deploy to a Hosting Service

For a more robust production setup, consider deploying to a hosting service:

1. **Heroku**: Offers easy deployment for Node.js applications
2. **Vercel**: Great for React frontends and serverless functions
3. **DigitalOcean**: Provides VPS options for more control
4. **Render**: Simple deployment for both static sites and Node.js servers

Each service has its own deployment instructions, but generally you would:
1. Push your code to a Git repository
2. Connect the repository to the hosting service
3. Configure environment variables for your Supabase credentials
4. Deploy the application

## Important Considerations

1. **Environment Variables**: Make sure your server's `.env` file is properly configured on the production server with the correct Supabase credentials.

2. **CORS**: If you're hosting the frontend and backend on different domains, you may need to configure CORS in your server.js file:

   ```javascript
   // In server.js
   app.use(cors({
     origin: 'https://your-frontend-domain.com',
     methods: ['GET', 'POST'],
     allowedHeaders: ['Content-Type']
   }));
   ```

3. **Security**: For production, consider:
   - Using HTTPS
   - Implementing rate limiting
   - Adding authentication to your API endpoints
   - Securing your environment variables

4. **Database Migration**: Don't forget to run the migration for the `email_notifications` table on your production Supabase instance.
