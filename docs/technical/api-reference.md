# API Reference

REST API endpoints di `src/app/api/*`. Semua endpoints scope ke tenant aktif.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://[bisnis].laundryhub.id/api
```

## Authentication

⚠️ **Saat ini**: tenant hardcoded di `lib/tenant.ts` (`tenant_laundrysukses`).

🔜 **Production**: JWT Bearer token di header:
```
Authorization: Bearer eyJhbGc...
```

## Conventions

### Request

- Content-Type: `application/json`
- Encoding: UTF-8

### Response

Sukses:
```json
{
  "data": [...],
  "meta": { ... }
}
```

Atau langsung object/array bila simpel.

Error:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

HTTP Status:
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Server Error

### Pagination

Query params:
- `?limit=20` — items per page (default 100, max 200)
- `?offset=0` — skip N items

Or cursor-based (planned):
- `?cursor=xxx`

## Endpoints

### `GET /api/dashboard`

Dashboard metrics &amp; charts data.

**Response**:

```json
{
  "stats": {
    "ordersToday": 8,
    "revenueToday": 471000,
    "activeOrders": 7,
    "pickupPending": 1
  },
  "revenueChart": [
    { "day": "Sen", "revenue": 0, "orders": 0 },
    { "day": "Sel", "revenue": 0, "orders": 0 },
    { "day": "Min", "revenue": 471000, "orders": 8 }
  ],
  "serviceBreakdown": [
    { "name": "Cuci Setrika", "value": 25, "color": "#10b981" }
  ],
  "branches": [
    { "name": "Cabang Pusat", "revenue": 331000, "orders": 5 }
  ],
  "recentOrders": [...]
}
```

### `GET /api/orders`

List orders dengan filter optional.

**Query Params**:
- `status` — filter by status (e.g. `WASHING`, `ALL`)
- `limit` — default 100

**Response**:

```json
{
  "orders": [
    {
      "id": "ord_psqzqazt",
      "invoice": "INV-20240517-001",
      "status": "WASHING",
      "paymentStatus": "paid",
      "pickupType": "pickup",
      "isExpress": false,
      "weight": 5.2,
      "total": 36000,
      "createdAt": "2026-05-16T18:46:22.000Z",
      "estimatedAt": "2026-05-18T18:46:22.000Z",
      "customerId": "cst_qejhvpv1",
      "customerName": "Andi Pratama",
      "customerPhone": "0812-3456-7890",
      "branchName": "Cabang Pusat",
      "service": "Cuci Setrika"
    }
  ]
}
```

### `GET /api/customers`

List customers + stats.

**Query Params**:
- `tier` — filter (`silver`, `gold`, `platinum`, atau `ALL`)
- `q` — search by name atau phone

**Response**:

```json
{
  "customers": [
    {
      "id": "cst_xxx",
      "name": "Rina Marlina",
      "phone": "0813-3344-5566",
      "tier": "platinum",
      "points": 6240,
      "totalOrders": 102,
      "totalSpending": 6240000,
      "createdAt": "..."
    }
  ],
  "stats": {
    "total": 8,
    "vip": 2
  }
}
```

### `GET /api/services`

List active services.

**Response**:

```json
{
  "services": [
    {
      "id": "svc_xxx",
      "name": "Cuci Setrika",
      "category": "regular",
      "pricingType": "per_kg",
      "price": 7000,
      "durationDays": 2,
      "isActive": true
    }
  ]
}
```

### `GET /api/payments`

Payment history + summary.

**Response**:

```json
{
  "payments": [
    {
      "id": "pay_xxx",
      "orderId": "ord_xxx",
      "amount": 36000,
      "method": "qris",
      "paidAt": "...",
      "invoice": "INV-20240517-001",
      "customerName": "Andi Pratama",
      "customerPhone": "0812-3456-7890",
      "paymentStatus": "paid"
    }
  ],
  "summary": [
    { "method": "cash", "total": 180000, "count": 1 },
    { "method": "qris", "total": 66000, "count": 2 }
  ],
  "outstanding": {
    "total": 140000,
    "count": 3
  }
}
```

### `GET /api/pickups`

Pickup tasks + driver list.

**Response**:

```json
{
  "pickups": [
    {
      "id": "pck_xxx",
      "type": "pickup",
      "status": "scheduled",
      "address": "Jl. Mawar 22",
      "scheduledAt": "...",
      "orderId": "ord_xxx",
      "invoice": "INV-...",
      "customerName": "Dimas Anggara",
      "driverName": "Pak Anto"
    }
  ],
  "drivers": [
    {
      "id": "drv_xxx",
      "name": "Pak Anto",
      "phone": "0812-1111-2222",
      "isActive": true,
      "taskCount": 6,
      "ongoingCount": 0
    }
  ]
}
```

### `GET /api/inventory`

List inventory items.

**Response**:

```json
{
  "inventory": [
    {
      "id": "inv_xxx",
      "name": "Detergent Premium",
      "category": "Sabun",
      "unit": "kg",
      "stock": 28,
      "minimumStock": 10
    }
  ]
}
```

### `GET /api/whatsapp`

WhatsApp templates.

**Response**:

```json
{
  "templates": [
    {
      "id": "tpl_xxx",
      "key": "order_received",
      "name": "Order Diterima",
      "body": "Halo {customer}, order Anda...",
      "isActive": true,
      "sentCount": 1842
    }
  ]
}
```

## Planned Endpoints

### `POST /api/orders`

Create new order.

**Request**:
```json
{
  "customerId": "cst_xxx",
  "branchId": "branch_xxx",
  "pickupType": "pickup",
  "pickupAddress": "Jl. ...",
  "items": [
    { "serviceId": "svc_xxx", "qty": 5.2 }
  ],
  "notes": "Parfum lavender"
}
```

**Response**: 201 Created with full order object.

### `PATCH /api/orders/[id]/status`

Update order status (used by QR scan).

**Request**:
```json
{ "status": "WASHING" }
```

### `POST /api/payments`

Record payment.

**Request**:
```json
{
  "orderId": "ord_xxx",
  "amount": 36000,
  "method": "qris",
  "reference": "MID-XXX"
}
```

### `POST /api/pickups`

Create pickup task.

**Request**:
```json
{
  "orderId": "ord_xxx",
  "driverId": "drv_xxx",
  "type": "pickup",
  "scheduledAt": "2026-05-17T16:00:00Z"
}
```

### `POST /api/customers`

Create customer.

**Request**:
```json
{
  "name": "John Doe",
  "phone": "0812-xxxx-xxxx",
  "address": "Jl. ..."
}
```

### `POST /api/whatsapp/send`

Send WhatsApp message (broadcast or individual).

**Request**:
```json
{
  "to": ["628..."],
  "templateKey": "order_received",
  "variables": { "customer": "Andi", "invoice": "INV-..." }
}
```

### `POST /api/whatsapp/webhook`

Webhook endpoint untuk receive incoming WA messages dari Fonnte.

### `POST /api/inventory/[id]/adjust`

Adjust stock.

**Request**:
```json
{
  "delta": -2.5,
  "reason": "production",
  "orderId": "ord_xxx"
}
```

## Rate Limiting

🔜 Production akan apply rate limit via Upstash:

| Tier         | Rate              |
| ------------ | ----------------- |
| Anonymous    | 60 req/min        |
| Authenticated| 600 req/min       |
| Pro plan     | 2000 req/min      |
| Enterprise   | Unlimited         |

Header response:
```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1684328400
```

## Webhooks (Outgoing)

Untuk integrate ke external systems:

### Order Status Changed

POST ke `webhookUrl` (configured in Settings):

```json
{
  "event": "order.status_changed",
  "timestamp": "...",
  "tenant": "tenant_xxx",
  "data": {
    "orderId": "ord_xxx",
    "invoiceNumber": "INV-...",
    "oldStatus": "WASHING",
    "newStatus": "DRYING"
  }
}
```

### Other Events

- `order.created`
- `order.completed`
- `order.cancelled`
- `payment.received`
- `pickup.scheduled`
- `pickup.completed`

## Testing API

### Curl

```bash
curl http://localhost:3000/api/dashboard
curl "http://localhost:3000/api/orders?status=WASHING"
```

### Postman / Insomnia

Import collection: `docs/technical/postman-collection.json` (planned).

### Integration Tests

```bash
npm run test:api
```

(Test framework belum di-setup, lihat [Testing](./testing.md).)

## Selanjutnya

- [Backend Guide](./backend-guide.md)
- [Frontend Guide](./frontend-guide.md)
