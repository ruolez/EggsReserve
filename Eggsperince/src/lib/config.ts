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
  SERVER_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : `${window.location.protocol}//${window.location.hostname}:3001`,
  
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
