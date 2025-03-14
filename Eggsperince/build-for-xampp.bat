@echo off
echo Building Eggsperience for XAMPP deployment...

:: Set environment variables for production build
set NODE_ENV=production
set VITE_BASE_PATH=/

:: Build the React app
echo Building React application...
call npm run build

:: Copy .htaccess to the dist folder
echo Copying .htaccess to dist folder...
copy .htaccess dist\

echo Build completed successfully!
echo.
echo To deploy to XAMPP:
echo 1. Copy the contents of the 'dist' folder to your XAMPP htdocs directory
echo    (e.g., C:\xampp\htdocs\eggs or a subdirectory)
echo 2. Make sure Apache has mod_rewrite enabled
echo 3. Ensure your Node.js server is running on port 3001
echo.
echo Note: If you're using a different port for XAMPP (e.g., port 81),
echo make sure to access the site using that port: http://localhost:81/
