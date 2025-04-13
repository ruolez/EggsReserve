/**
 * Application configuration
 * 
 * This file contains configuration settings for the application.
 * Modify these values based on your deployment environment.
 */

// API configuration
export const API_CONFIG = {
  // Base URL for the server API
  // For local development: http://localhost:3001
  // For production with Apache proxy: /api (relative URL)
  // For production with separate domains: https://your-api-domain.com
  // SERVER_URL is now configurable via the .env file (VITE_BACKEND_HOST)
  SERVER_URL: (() => {
    // For Vite: import.meta.env
    // Fallback for Node: process.env
    const host =
      typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_HOST
        ? import.meta.env.VITE_BACKEND_HOST
        : (process.env.VITE_BACKEND_HOST || 'localhost');
    return `https://${host}:3001`;
  })(),
  
  // Alias for backward compatibility
  get EMAIL_SERVER_URL() {
    return this.SERVER_URL;
  }
};

// Email configuration
export const EMAIL_CONFIG = {
  // Default SMTP settings for Gmail
  DEFAULT_SMTP_HOST: 'smtp.gmail.com',
  DEFAULT_SMTP_PORT: 587,
  
  // Email notification endpoints
  SEND_NOTIFICATION_ENDPOINT: '/api/send-notification',
  HEALTH_CHECK_ENDPOINT: '/api/health',
};
