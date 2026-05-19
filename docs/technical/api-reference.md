# API Reference

REST API endpoints di `src/app/api/*`. Semua endpoints scope ke tenant aktif.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://[bisnis].laundryhub.id/api
```

## Authentication

**Cookie-based auth with bcrypt password verification**:
- Cookie `laundryhub_user` berisi user ID
- `getCurrentUser()` di `src/lib/auth.ts` resolve user dari cookie
- Tenant ID derived dari user record
- Login via `POST /api/auth/login` dengan email + password (bcrypt verified)

**RBAC API Guards**:
- Semua API routes dilindungi oleh `api-guard.ts` middleware
- Permission check server-side berdasarkan role user
- Return `403 Forbidden` bila role tidak punya akses ke endpoint

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

---

## Core Endpoints

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
    { "day": "Sen", "revenue": 0, "orders": 0 }
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

---

### `GET /api/orders`

List orders dengan filter optional.

**Query Params**:
- `status` — filter by status (e.g. `WASHING`, `ALL`)
- `limit` — default 100
- `q` — search by invoice number atau customer name

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

### `POST /api/orders`

Create new order.

**Request**:
```json
{
  "customerId": "cst_xxx",
  "branchId": "branch_xxx",
  "serviceId": "svc_xxx",
  "pickupType": "pickup",
  "pickupAddress": "Jl. ...",
  "weight": 5.2,
  "notes": "Parfum lavender",
  "isExpress": false
}
```

**Response**: 201 Created with full order object.

### `GET /api/orders/[id]`

Get single order detail.

### `PATCH /api/orders/[id]`

Update order (status, payment status, etc).

**Request**:
```json
{
  "status": "WASHING"
}
```

---

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

### `GET /api/customers/[id]`

Get customer detail with order history.

### `PATCH /api/customers/[id]`

Update customer (name, phone, address, notes, blacklist, tier).

### `DELETE /api/customers/[id]`

Delete customer (cascade).

---

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

---

### `GET /api/payments`

Payment history + summary.

**Response**:

```json
{
  "payments": [...],
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

---

### `GET /api/pickups`

Pickup tasks + driver list.

**Response**:

```json
{
  "pickups": [...],
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

### `PATCH /api/pickups/[id]`

Update pickup status (scheduled → ongoing → completed).

---

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

### `POST /api/inventory`

Create inventory item.

### `PATCH /api/inventory/[id]`

Update inventory item (name, category, unit, minimumStock).

### `DELETE /api/inventory/[id]`

Delete inventory item (cascade movements).

### `POST /api/inventory/[id]/adjust`

Adjust stock (in/out).

**Request**:
```json
{
  "type": "out",
  "quantity": 2.5,
  "reason": "production",
  "notes": "Cuci batch pagi"
}
```

**Effect**: Updates `inventory.stock` and creates `inventory_movements` record.

### `GET /api/inventory/movements`

List inventory movements (history pemakaian).

**Response**:

```json
{
  "movements": [
    {
      "id": "mov_xxx",
      "inventoryId": "inv_xxx",
      "itemName": "Detergent Premium",
      "type": "out",
      "quantity": 2.5,
      "unitCost": 15000,
      "totalCost": 37500,
      "reason": "production",
      "reference": "ORD-001",
      "createdAt": "..."
    }
  ]
}
```

---

### `GET /api/branches`

List branches for current tenant.

### `POST /api/branches`

Create branch.

**Request**:
```json
{
  "name": "Cabang Selatan",
  "address": "Jl. Raya Selatan 45",
  "phone": "0812-xxxx-xxxx"
}
```

### `PATCH /api/branches/[id]`

Update branch.

### `DELETE /api/branches/[id]`

Delete branch.

---

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

---

## Financial Endpoints (v0.4.0)

### `GET /api/expenses`

List expenses for current tenant.

**Query Params**:
- `period` — `today`, `7d`, `30d`, `month`, `all` (default: `month`)

**Response**:

```json
{
  "expenses": [
    {
      "id": "exp_xxx",
      "title": "Bayar listrik Mei",
      "amount": 850000,
      "categoryId": "expcat_xxx",
      "categoryName": "Listrik & Air",
      "categoryColor": "#f59e0b",
      "paymentMethod": "qris",
      "vendor": "PLN",
      "expenseDate": "2026-05-17T00:00:00.000Z",
      "branchName": "Cabang Pusat"
    }
  ],
  "stats": {
    "totalThisMonth": 4800000,
    "topCategory": "Gaji & Tunjangan",
    "average": 480000,
    "activeCategories": 7
  },
  "categories": [
    { "id": "expcat_xxx", "name": "Gaji & Tunjangan", "color": "#ef4444" }
  ]
}
```

### `POST /api/expenses`

Create expense.

**Request**:
```json
{
  "title": "Bayar listrik Mei",
  "categoryId": "expcat_xxx",
  "amount": 850000,
  "paymentMethod": "qris",
  "vendor": "PLN",
  "branchId": "branch_xxx",
  "expenseDate": "2026-05-17",
  "notes": ""
}
```

### `PATCH /api/expenses/[id]`

Update expense.

### `DELETE /api/expenses/[id]`

Delete expense.

---

### `GET /api/reports/pnl`

Income Statement (Profit &amp; Loss) report.

**Query Params**:
- `period` — `today`, `7d`, `30d`, `month`, `all` (default: `month`)

**Response**:

```json
{
  "revenue": 12500000,
  "cogs": 1200000,
  "grossProfit": 11300000,
  "grossMargin": 90.4,
  "opex": 4800000,
  "netProfit": 6500000,
  "netMargin": 52.0,
  "orderCount": 156,
  "aov": 80128,
  "cogsRatio": 9.6,
  "opexRatio": 38.4,
  "expensesByCategory": [
    { "category": "Gaji & Tunjangan", "amount": 2500000, "color": "#ef4444" }
  ],
  "revenueByService": [
    { "service": "Cuci Setrika", "revenue": 5200000, "orders": 74 }
  ]
}
```

---

### `GET /api/suppliers`

List suppliers.

**Response**:

```json
{
  "suppliers": [
    {
      "id": "sup_xxx",
      "name": "PT Daia Indonesia",
      "phone": "021-xxx",
      "email": "sales@daia.co.id",
      "contactPerson": "Budi",
      "isActive": true
    }
  ]
}
```

### `POST /api/suppliers`

Create supplier.

### `PATCH /api/suppliers/[id]`

Update supplier.

---

### `GET /api/purchase-orders`

List purchase orders.

**Response**:

```json
{
  "purchaseOrders": [
    {
      "id": "po_xxx",
      "poNumber": "PO-20260517-001",
      "status": "ordered",
      "supplierName": "PT Daia Indonesia",
      "total": 2500000,
      "itemCount": 5,
      "createdAt": "..."
    }
  ],
  "stats": {
    "total": 12,
    "pendingValue": 2500000,
    "receivedValue": 8700000,
    "lowStockCount": 3
  }
}
```

### `POST /api/purchase-orders`

Create purchase order.

**Request**:
```json
{
  "supplierId": "sup_xxx",
  "notes": "Restock bulanan",
  "items": [
    { "inventoryId": "inv_xxx", "quantity": 50, "unitPrice": 15000 },
    { "inventoryId": "inv_yyy", "quantity": 20, "unitPrice": 25000 }
  ]
}
```

### `PATCH /api/purchase-orders/[id]`

Update PO (status change, receive).

**Receive PO**:
```json
{
  "action": "receive"
}
```

Effect:
1. Status → `received`
2. For each item: `receivedQuantity` = `quantity`
3. Insert `inventory_movements` type=`in` per item (with unitCost)
4. Update `inventory.stock` += quantity per item

**Cancel PO**:
```json
{
  "action": "cancel"
}
```

---

### `GET /api/settings`

Get tenant settings.

### `PATCH /api/settings`

Update tenant settings (name, logo, color, etc).

**Request**:
```json
{
  "name": "Laundry Sukses Jaya"
}
```

---

### `POST /api/auth/switch`

Switch user (demo auth).

**Request**:
```json
{
  "userId": "usr_xxx"
}
```

**Effect**: Sets `laundryhub_user` cookie → redirect to dashboard.

---

## Auth Endpoints (v0.5.0)

### `POST /api/auth/login`

Authenticate user with email + password (bcrypt verification).

**Request**:
```json
{
  "email": "owner@laundrysukses.com",
  "password": "securepassword123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "usr_xxx",
    "name": "Budi Owner",
    "email": "owner@laundrysukses.com",
    "role": "owner"
  }
}
```

**Error** (401):
```json
{
  "error": "Email atau password salah"
}
```

**Effect**: Sets `laundryhub_user` cookie on success.

---

## Chat Endpoints (v0.5.0)

### `GET /api/chat`

List conversations (grouped by customer, latest message first).

**Response**:
```json
{
  "conversations": [
    {
      "customerId": "cst_xxx",
      "customerName": "Rina Marlina",
      "customerPhone": "0813-3344-5566",
      "lastMessage": "Mau cuci 3kg pickup besok",
      "lastMessageAt": "2026-05-19T10:30:00Z",
      "unreadCount": 2,
      "channel": "telegram",
      "isBot": false
    }
  ]
}
```

### `POST /api/chat`

Send a message to a customer (admin reply).

**Request**:
```json
{
  "customerId": "cst_xxx",
  "body": "Baik Kak, driver kami akan datang besok jam 10."
}
```

### `GET /api/chat/[customerId]`

Get message thread for a specific customer.

**Response**:
```json
{
  "messages": [
    {
      "id": "msg_xxx",
      "direction": "inbound",
      "channel": "telegram",
      "body": "Mau cuci 3kg pickup besok",
      "isBot": false,
      "isRead": true,
      "createdAt": "2026-05-19T10:30:00Z"
    },
    {
      "id": "msg_yyy",
      "direction": "outbound",
      "channel": "telegram",
      "body": "Baik Kak, driver kami akan datang besok jam 10.",
      "isBot": false,
      "isRead": true,
      "createdAt": "2026-05-19T10:32:00Z"
    }
  ],
  "customer": {
    "id": "cst_xxx",
    "name": "Rina Marlina",
    "phone": "0813-3344-5566"
  }
}
```

### `POST /api/chat/[customerId]`

Send reply to specific customer thread.

**Request**:
```json
{
  "body": "Laundry Kakak sudah selesai, bisa diambil hari ini."
}
```

---

## Telegram Endpoints (v0.5.0)

### `POST /api/telegram/webhook`

Incoming message webhook from Telegram Bot API. Called by Telegram servers.

**Request** (Telegram Update object):
```json
{
  "update_id": 123456,
  "message": {
    "message_id": 789,
    "from": { "id": 12345, "first_name": "Rina", "username": "rina_m" },
    "chat": { "id": 12345, "type": "private" },
    "text": "harga"
  }
}
```

**Effect**:
1. Find/create customer by telegram chat ID
2. Save message to `messages` table
3. Process auto-reply (if keyword matched)
4. Process auto-create order (if order data detected)

### `POST /api/telegram/setup`

Register webhook URL with Telegram Bot API.

**Request**: No body needed (uses tenant's bot token from settings).

**Response**:
```json
{
  "success": true,
  "webhookUrl": "https://laundrysukses.laundryhub.id/api/telegram/webhook"
}
```

### `GET /api/telegram/setup`

Check current webhook status.

**Response**:
```json
{
  "isActive": true,
  "webhookUrl": "https://laundrysukses.laundryhub.id/api/telegram/webhook",
  "lastError": null
}
```

---

## Messaging Endpoints (v0.5.0)

### `POST /api/messaging/send`

Generic send message via active channel (WhatsApp or Telegram).

**Request**:
```json
{
  "customerId": "cst_xxx",
  "body": "Halo Kak, laundry sudah selesai!"
}
```

**Effect**: Sends via tenant's active messaging channel. Creates `messages` record.

---

## Campaign Endpoints (v0.5.0)

### `GET /api/campaigns`

List marketing campaigns.

**Response**:
```json
{
  "campaigns": [
    {
      "id": "camp_xxx",
      "name": "Promo Akhir Bulan",
      "segment": "all",
      "channel": "whatsapp",
      "status": "sent",
      "recipientCount": 150,
      "deliveredCount": 142,
      "readCount": 98,
      "conversionCount": 12,
      "sentAt": "2026-05-15T19:00:00Z",
      "createdAt": "2026-05-15T10:00:00Z"
    }
  ]
}
```

### `POST /api/campaigns`

Create and optionally send a campaign.

**Request**:
```json
{
  "name": "Promo Weekend",
  "segment": "gold",
  "body": "Halo {customer}! Diskon 20% khusus member Gold weekend ini. Yuk cuci sekarang!",
  "status": "sent"
}
```

**Segment options**: `all`, `gold`, `platinum`, `inactive`, `new`

---

## Notification Endpoints (v0.5.0)

### `GET /api/notifications`

List notifications for current user.

**Response**:
```json
{
  "notifications": [
    {
      "id": "notif_xxx",
      "type": "order",
      "title": "Order Baru",
      "message": "Order INV-20260519-003 dari Rina Marlina",
      "link": "/orders",
      "isRead": false,
      "createdAt": "2026-05-19T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### `PATCH /api/notifications`

Mark all notifications as read.

**Response**:
```json
{
  "success": true,
  "markedCount": 5
}
```

### `PATCH /api/notifications/[id]`

Mark single notification as read.

**Response**:
```json
{
  "success": true
}
```

---

## Security Endpoints (v0.5.0)

### `GET /api/security`

Get tenant security settings.

**Response**:
```json
{
  "twoFactorEnabled": false,
  "auditLogEnabled": true,
  "ipWhitelistEnabled": false,
  "sessionTimeoutEnabled": true,
  "sessionTimeoutMinutes": 60,
  "ipWhitelist": null
}
```

### `PATCH /api/security`

Update security settings.

**Request**:
```json
{
  "twoFactorEnabled": true,
  "sessionTimeoutMinutes": 30
}
```

---

## Payment Endpoints (v0.5.0)

### `POST /api/payments/[id]/refund`

Refund a payment. Creates negative payment record.

**Response**:
```json
{
  "refund": {
    "id": "pay_xxx",
    "orderId": "ord_xxx",
    "amount": -35000,
    "method": "refund",
    "reference": "Refund of pay_original",
    "paidAt": "2026-05-19T12:00:00Z"
  }
}
```

**Effect**:
1. Creates payment record with negative amount
2. Updates order `paymentStatus` (paid → unpaid/partial)

### `POST /api/payments/reminder`

Send payment reminder to all customers with unpaid orders.

**Response**:
```json
{
  "success": true,
  "sentCount": 5,
  "message": "Reminder terkirim ke 5 customer"
}
```

**Effect**: Sends notification via active messaging channel to each customer with outstanding payment.

---

## Purchase Order Endpoints (v0.5.0)

### `GET /api/purchase-orders/[id]`

Get PO detail with line items.

**Response**:
```json
{
  "purchaseOrder": {
    "id": "po_xxx",
    "poNumber": "PO-20260519-001",
    "status": "ordered",
    "supplierName": "PT Daia Indonesia",
    "total": 2500000,
    "notes": "Restock bulanan",
    "createdAt": "2026-05-19T08:00:00Z"
  },
  "items": [
    {
      "id": "poi_xxx",
      "itemName": "Detergent Premium",
      "quantity": 50,
      "unitPrice": 15000,
      "total": 750000,
      "receivedQuantity": 0
    }
  ]
}
```

---

## WhatsApp Template Endpoints (v0.5.0)

### `PATCH /api/whatsapp/templates/[id]`

Toggle template active/inactive.

**Request**:
```json
{
  "isActive": false
}
```

---

## Rate Limiting (Planned)

Production akan apply rate limit via Upstash:

| Tier         | Rate              |
| ------------ | ----------------- |
| Anonymous    | 60 req/min        |
| Authenticated| 600 req/min       |
| Pro plan     | 2000 req/min      |
| Enterprise   | Unlimited         |

## Webhooks (Planned)

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
- `expense.created`
- `purchase_order.received`

## Testing API

### Curl

```bash
curl http://localhost:3000/api/dashboard
curl "http://localhost:3000/api/orders?status=WASHING"
curl http://localhost:3000/api/expenses
curl "http://localhost:3000/api/reports/pnl?period=month"
curl http://localhost:3000/api/purchase-orders
```

## Selanjutnya

- [Backend Guide](./backend-guide.md)
- [Frontend Guide](./frontend-guide.md)
