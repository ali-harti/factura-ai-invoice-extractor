# API Reference

Factura exposes a RESTful API built with FastAPI. All endpoints requiring authentication expect a Firebase JWT token passed in the `Authorization: Bearer <token>` header.

The interactive API documentation (Swagger UI) is available at `http://localhost:8000/docs` when the backend is running.

## Authentication

All secured routes depend on `app.core.security.get_current_user`. 
If the token is invalid or missing, a `401 Unauthorized` is returned.

## Invoices

### `POST /api/v1/invoices/extract`

Extracts data from an uploaded invoice image/PDF.

- **Request**: `multipart/form-data`
  - `file`: The invoice file (PDF, PNG, JPG). Max 10MB.
- **Response**: `200 OK`
  ```json
  {
    "task_id": "string",
    "status": "processing"
  }
  ```
  *(Note: Currently implemented synchronously or via background tasks depending on config. See Swagger docs for live schema).*

### `GET /api/v1/invoices/history`

Retrieves the extraction history for the authenticated user.

- **Request**: None
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "invoice_number": "INV-123",
      "vendor_name": "Acme Corp",
      "total_amount": 150.0,
      "currency": "USD",
      "created_at": "2026-09-06T12:00:00Z"
    }
  ]
  ```

### `GET /api/v1/invoices/{invoice_id}`

Retrieves a specific invoice by ID.

- **Response**: `200 OK`
  Returns the full invoice data including line items.

### `PUT /api/v1/invoices/{invoice_id}`

Updates an existing invoice (used for human-in-the-loop corrections).

- **Request**: `application/json` (Invoice Schema)
- **Response**: `200 OK`
