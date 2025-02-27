/**
 * Application configuration
 * 
 * This file contains configuration settings for the application.
 * Modify these values based on your deployment environment.
 */

// API configuration
export const API_CONFIG = {
  // Base URL for the email server API
  // For local development: http://localhost:3001
  // For production with Apache proxy: /api (relative URL)
  // For production with separate domains: https://your-api-domain.com
  EMAIL_SERVER_URL: 'http://solbe.info:3001',
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
