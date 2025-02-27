# Automatic Stock Increase Feature

This document describes the automatic stock increase feature implemented in the Eggsperince project.

## Overview

The system automatically increases the stock of egg cartons by 3 units every day at midnight. This feature runs alongside the existing manual stock management functionality, allowing administrators to continue updating stock levels manually as needed.

## Implementation Details

The automatic stock increase is implemented using the following components:

1. **Scheduled Job**: A cron job runs daily at midnight (00:00) to increase the stock.
2. **Stock Validation**: The system ensures that the stock never exceeds the maximum allowed quantity.
3. **Error Handling**: The process includes error handling to log any issues that might occur during the automatic update.

## Technical Implementation

- The feature uses `node-cron` to schedule the daily stock increase.
- The stock increase logic is implemented in the `increaseStockDaily()` function in `server.js`.
- The function retrieves the current stock, adds 3 units (up to the maximum allowed), and updates the database.

## Testing

A test script is provided to manually trigger the stock increase:

```bash
# Start the server
npm start

# In a separate terminal, run the test script
node test-stock-increase.js
```

## API Endpoint

For testing or manual triggering, an API endpoint is available:

- **URL**: `/api/increase-stock`
- **Method**: POST
- **Response**: JSON with success status and message

Example response:
```json
{
  "success": true,
  "message": "Stock increased successfully"
}
```

## Logs

The system logs information about the automatic stock increase process:

- When the scheduled job starts: "Running daily stock increase..."
- After successful update: "Stock automatically increased to [new quantity]"
- Any errors that occur during the process

## Notes

- The stock will never exceed the maximum quantity set in the database.
- The automatic increase happens regardless of the current stock level (as long as it's below the maximum).
- The feature works alongside the existing manual stock management functionality.
