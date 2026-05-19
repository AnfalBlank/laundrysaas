# Database Schema

22 tabel dengan multi-tenant isolation via Drizzle ORM untuk Turso (libSQL).

## ERD

```
                        ┌──────────┐
                        │ tenants  │
                        └────┬─────┘
                             │
       ┌─────────────────────┼─────────────────────────────────┐
       │                     │                                 │
  ┌────▼────┐          ┌────▼─────┐          ┌────▼─────┐     │
  │branches │          │  users   │          │customers │     │
  └────┬────┘          └──────────┘          └────┬─────┘     │
       │                                          │           │
       │     ┌───────────┐                        │           │
       └─────►  orders   ◄────────────────────────┘           │
             └─────┬─────┘                                    │
                   │                                          │
       ┌───────────┼───────────┬─────────────┐                │
       │           │           │             │                │
  ┌────▼─────┐ ┌──▼──┐  ┌─────▼────┐  ┌────▼─────┐          │
  │order_    │ │pay- │  │ pickups  │  │whatsapp_ │          │
  │items     │ │ments│  └────┬─────┘  │templates │          │
  └────┬─────┘ └─────┘       │        └──────────┘          │
       │                     │                               │
   ┌───▼────┐           ┌────▼─────┐                         │
   │services│           │ drivers  │                         │
   └────────┘           └──────────┘                         │
                                                             │
  ┌──────────┐     ┌──────────────────┐                      │
  │inventory │◄────│inventory_movements│                      │
  └────┬─────┘     └──────────────────┘                      │
       │                                                     │
       │     ┌──────────────────┐     ┌──────────────┐       │
       └─────│purchase_order_   │─────│purchase_     │       │
             │items             │     │orders        │       │
             └──────────────────┘     └──────┬───────┘       │
                                             │               │
                                        ┌────▼─────┐         │
                                        │suppliers │         │
                                        └──────────┘         │
                                                             │
  ┌──────────────────┐     ┌──────────────┐                  │
  │expense_categories│─────│  expenses    │──────────────────┘
  └──────────────────┘     └──────────────┘

  ┌──────────────────────────────────────────────────────────┐
  │              New Tables (v0.5.0)                          │
  │                                                          │
  │  ┌─────────────┐  ┌──────────┐  ┌───────────────────┐   │
  │  │notifications│  │campaigns │  │     messages      │   │
  │  └─────────────┘  └──────────┘  └───────────────────┘   │
  │                                                          │
  │  ┌───────────────────────────┐                           │
  │  │tenant_security_settings   │                           │
  │  └───────────────────────────┘                           │
  └──────────────────────────────────────────────────────────┘
```

## Multi-Tenant Pattern

Semua tabel kecuali `tenants`, `order_items`, dan `purchase_order_items` punya kolom `tenantId` (TEXT):

```typescript
tenantId: text("tenant_id")
  .notNull()
  .references(() => tenants.id, { onDelete: "cascade" }),
```

Setiap query di repositories selalu filter `WHERE tenant_id = ?`. Cascade delete memastikan saat tenant dihapus, semua data terkait ikut terhapus.

## Tables

### 1. `tenants`

SaaS-level tenant info.

| Column           | Type      | Constraints           | Description                          |
| ---------------- | --------- | --------------------- | ------------------------------------ |
| id               | TEXT      | PK                    | `tenant_xxx`                         |
| name             | TEXT      | NOT NULL              | Display name                         |
| subdomain        | TEXT      | NOT NULL UNIQUE       | URL slug                             |
| customDomain     | TEXT      |                       | Custom domain (Pro+)                 |
| plan             | TEXT      | enum, default 'basic' | basic / pro / enterprise             |
| planExpiresAt    | INTEGER   |                       | Unix timestamp                       |
| logoUrl          | TEXT      |                       | URL ke logo                          |
| primaryColor     | TEXT      | default '#2563eb'     | Hex color                            |
| messagingChannel | TEXT      | default 'whatsapp'    | Active channel: whatsapp / telegram  |
| whatsappNumber   | TEXT      |                       | Nomor WA (format 628xxx)             |
| whatsappToken    | TEXT      |                       | Fonnte API token                     |
| telegramBotToken | TEXT      |                       | Telegram Bot API token               |
| telegramBotUsername | TEXT   |                       | Bot username (tanpa @)               |
| createdAt        | INTEGER   | NOT NULL              | Unix timestamp                       |

### 2. `branches`

Cabang per tenant.

| Column     | Type      | Description                          |
| ---------- | --------- | ------------------------------------ |
| id         | TEXT PK   | `branch_xxx`                         |
| tenantId   | TEXT FK   | → tenants.id (cascade)               |
| name       | TEXT      | Nama cabang                          |
| address    | TEXT      | Alamat                               |
| phone      | TEXT      |                                      |
| isActive   | BOOLEAN   | default true                         |
| createdAt  | INTEGER   |                                      |

**Indexes**: `tenantId`

### 3. `users`

Staff/karyawan dengan role-based access.

| Column        | Type    | Description                                     |
| ------------- | ------- | ----------------------------------------------- |
| id            | TEXT PK |                                                 |
| tenantId      | TEXT FK |                                                 |
| branchId      | TEXT FK | → branches.id (nullable)                        |
| name          | TEXT    |                                                 |
| email         | TEXT    | NOT NULL                                        |
| passwordHash  | TEXT    | NOT NULL (bcrypt/argon2)                        |
| role          | TEXT    | enum: owner / admin / staff / driver            |
| phone         | TEXT    |                                                 |
| isActive      | BOOLEAN |                                                 |
| createdAt     | INTEGER |                                                 |

**Indexes**: `tenantId`, `(tenantId, email)`

### 4. `customers`

Pelanggan dengan tier loyalty.

| Column           | Type    | Description                                  |
| ---------------- | ------- | -------------------------------------------- |
| id               | TEXT PK |                                              |
| tenantId         | TEXT FK |                                              |
| name             | TEXT    | NOT NULL                                     |
| phone            | TEXT    | NOT NULL                                     |
| address          | TEXT    |                                              |
| notes            | TEXT    | Free-form admin notes                        |
| tier             | TEXT    | enum: silver / gold / platinum               |
| points           | INTEGER | Loyalty points                               |
| totalOrders      | INTEGER | Cached count for performance                 |
| totalSpending    | INTEGER | Cached sum                                   |
| isBlacklisted    | BOOLEAN |                                              |
| telegramChatId   | TEXT    | Telegram chat ID for messaging               |
| telegramUsername | TEXT    | Telegram username (tanpa @)                  |
| createdAt        | INTEGER |                                              |

**Indexes**: `tenantId`, `(tenantId, phone)`

🔵 **Note**: `totalOrders`, `totalSpending`, `tier`, dan `points` di-denormalize untuk performance. Auto-update via repository saat payment recorded:
- `totalSpending` += payment amount
- `points` += payment amount / 1000
- `tier` upgrade otomatis: Silver (default), Gold (≥ Rp 500K), Platinum (≥ Rp 2M)

### 5. `services`

Pricing layanan.

| Column        | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| id            | TEXT PK |                                          |
| tenantId      | TEXT FK |                                          |
| name          | TEXT    | "Cuci Setrika", dll                      |
| category      | TEXT    | enum: regular / express / special        |
| pricingType   | TEXT    | enum: per_kg / per_item / per_unit       |
| price         | INTEGER | IDR (no decimal)                         |
| durationDays  | INTEGER | Estimasi hari selesai                    |
| isActive      | BOOLEAN |                                          |
| createdAt     | INTEGER |                                          |

**Indexes**: `tenantId`

### 6. `orders`

Order utama dengan 11 status workflow.

| Column          | Type    | Description                                         |
| --------------- | ------- | --------------------------------------------------- |
| id              | TEXT PK |                                                     |
| tenantId        | TEXT FK |                                                     |
| branchId        | TEXT FK | nullable                                            |
| customerId      | TEXT FK | NOT NULL                                            |
| invoiceNumber   | TEXT    | Format: `INV-YYYYMMDD-XXX`                          |
| status          | TEXT    | enum: 11 statuses (lihat di bawah)                  |
| paymentStatus   | TEXT    | enum: unpaid / partial / paid                       |
| pickupType      | TEXT    | enum: walk_in / pickup                              |
| pickupAddress   | TEXT    |                                                     |
| deliveryAddress | TEXT    |                                                     |
| isExpress       | BOOLEAN |                                                     |
| notes           | TEXT    |                                                     |
| weight          | REAL    | kg (nullable untuk per-item)                        |
| subtotal        | INTEGER |                                                     |
| discount        | INTEGER |                                                     |
| total           | INTEGER |                                                     |
| estimatedAt     | INTEGER |                                                     |
| completedAt     | INTEGER |                                                     |
| createdAt       | INTEGER |                                                     |
| updatedAt       | INTEGER |                                                     |

**Status enum**:
```
WAITING_PICKUP, PICKUP_PROCESS, RECEIVED, WASHING, DRYING,
IRONING, PACKING, READY_DELIVERY, DELIVERING, COMPLETED, CANCELLED
```

**Indexes**: `tenantId`, `(tenantId, status)`, `(tenantId, invoiceNumber)`, `customerId`

### 7. `order_items`

Detail item per order (multiple items per order possible).

| Column        | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| id            | TEXT PK |                                          |
| orderId       | TEXT FK | → orders.id (cascade)                    |
| serviceId     | TEXT FK |                                          |
| serviceName   | TEXT    | Snapshot saat order dibuat               |
| qty           | REAL    | kg untuk per_kg, count untuk per_item    |
| pricePerUnit  | INTEGER | Snapshot                                 |
| total         | INTEGER | qty × pricePerUnit                       |

**Indexes**: `orderId`

🔵 **Note**: `serviceName` dan `pricePerUnit` di-snapshot untuk preserve order history bila harga service berubah kemudian.

### 8. `payments`

Multiple payments per order (split payment).

| Column      | Type    | Description                              |
| ----------- | ------- | ---------------------------------------- |
| id          | TEXT PK |                                          |
| orderId     | TEXT FK |                                          |
| amount      | INTEGER |                                          |
| method      | TEXT    | enum: cash / transfer / qris / ewallet / other |
| reference   | TEXT    | Bank ref, QRIS ref, dll                  |
| paidAt      | INTEGER |                                          |

**Indexes**: `orderId`

### 9. `drivers`

Driver pickup &amp; delivery.

| Column         | Type    | Description                              |
| -------------- | ------- | ---------------------------------------- |
| id             | TEXT PK |                                          |
| tenantId       | TEXT FK |                                          |
| userId         | TEXT FK | → users.id (link ke user account)        |
| name           | TEXT    |                                          |
| phone          | TEXT    |                                          |
| vehicleType    | TEXT    | "Motor", "Mobil"                         |
| vehiclePlate   | TEXT    |                                          |
| isActive       | BOOLEAN |                                          |

**Indexes**: `tenantId`

### 10. `pickups`

Task pickup atau delivery.

| Column        | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| id            | TEXT PK |                                            |
| tenantId      | TEXT FK |                                            |
| orderId       | TEXT FK |                                            |
| driverId      | TEXT FK | nullable (sebelum di-assign)               |
| type          | TEXT    | enum: pickup / delivery                    |
| status        | TEXT    | enum: scheduled / ongoing / completed / cancelled |
| address       | TEXT    |                                            |
| scheduledAt   | INTEGER | NOT NULL                                   |
| completedAt   | INTEGER |                                            |
| proofUrl      | TEXT    | URL foto bukti                             |
| createdAt     | INTEGER |                                            |

**Indexes**: `tenantId`, `(tenantId, status)`

### 11. `inventory`

Stok operasional.

| Column         | Type    | Description                              |
| -------------- | ------- | ---------------------------------------- |
| id             | TEXT PK |                                          |
| tenantId       | TEXT FK |                                          |
| name           | TEXT    |                                          |
| category       | TEXT    | "Sabun", "Parfum", "Packaging", "Chemical" |
| unit           | TEXT    | "kg", "L", "pcs"                         |
| stock          | REAL    | Current stock level                      |
| minimumStock   | REAL    | Threshold low-stock alert                |

**Indexes**: `tenantId`

### 12. `whatsapp_templates`

Template auto-reply &amp; notifikasi.

| Column      | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| id          | TEXT PK |                                            |
| tenantId    | TEXT FK |                                            |
| key         | TEXT    | Unique key: "order_received", dll          |
| name        | TEXT    |                                            |
| body        | TEXT    | Pesan dengan placeholder `{customer}` dll  |
| isActive    | BOOLEAN |                                            |
| sentCount   | INTEGER | Counter total terkirim                     |

**Indexes**: `tenantId`

---

## Tabel Baru (v0.4.0) — Financial &amp; Supply Chain

### 13. `inventory_movements`

Track setiap pergerakan stok — basis untuk COGS di P&amp;L.

| Column          | Type    | Description                                    |
| --------------- | ------- | ---------------------------------------------- |
| id              | TEXT PK |                                                |
| tenantId        | TEXT FK |                                                |
| inventoryId     | TEXT FK | → inventory.id (cascade)                       |
| type            | TEXT    | enum: in / out / adjustment                    |
| quantity        | REAL    | Jumlah unit                                    |
| unitCost        | INTEGER | Harga per unit (IDR)                           |
| totalCost       | INTEGER | quantity × unitCost                            |
| reason          | TEXT    | manual / restock / production / damage         |
| reference       | TEXT    | PO number, order ID, atau free text            |
| purchaseOrderId | TEXT    | Link ke PO (nullable)                          |
| orderId         | TEXT    | Link ke order (nullable)                       |
| notes           | TEXT    |                                                |
| createdAt       | INTEGER |                                                |

**Indexes**: `tenantId`, `inventoryId`, `(tenantId, type)`

**Relasi**: 
- `inventoryId` → `inventory.id` (cascade delete)
- `purchaseOrderId` → referensi PO (soft link)
- `orderId` → referensi order (soft link)

**Use case**: 
- Saat PO di-receive → insert movement type=`in` dengan unitCost
- Saat staff pakai bahan → insert movement type=`out`
- COGS = SUM(totalCost) WHERE type=`out` dalam periode

### 14. `suppliers`

Data supplier untuk purchase orders.

| Column        | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| id            | TEXT PK |                                          |
| tenantId      | TEXT FK |                                          |
| name          | TEXT    | NOT NULL                                 |
| phone         | TEXT    |                                          |
| email         | TEXT    |                                          |
| address       | TEXT    |                                          |
| contactPerson | TEXT    | Nama PIC                                 |
| notes         | TEXT    |                                          |
| isActive      | BOOLEAN |                                          |
| createdAt     | INTEGER |                                          |

**Indexes**: `tenantId`

### 15. `purchase_orders`

Header purchase order ke supplier.

| Column      | Type    | Description                                    |
| ----------- | ------- | ---------------------------------------------- |
| id          | TEXT PK |                                                |
| tenantId    | TEXT FK |                                                |
| supplierId  | TEXT FK | → suppliers.id (nullable)                      |
| poNumber    | TEXT    | Format: `PO-YYYYMMDD-XXX`                      |
| status      | TEXT    | enum: draft / ordered / partial / received / cancelled |
| subtotal    | INTEGER |                                                |
| discount    | INTEGER |                                                |
| tax         | INTEGER |                                                |
| total       | INTEGER |                                                |
| notes       | TEXT    |                                                |
| orderedAt   | INTEGER | Timestamp saat status → ordered                |
| receivedAt  | INTEGER | Timestamp saat status → received               |
| createdAt   | INTEGER |                                                |

**Indexes**: `tenantId`, `(tenantId, status)`

### 16. `purchase_order_items`

Line items per PO.

| Column           | Type    | Description                              |
| ---------------- | ------- | ---------------------------------------- |
| id               | TEXT PK |                                          |
| purchaseOrderId  | TEXT FK | → purchase_orders.id (cascade)           |
| inventoryId      | TEXT FK | → inventory.id                           |
| itemName         | TEXT    | Snapshot nama item                       |
| quantity         | REAL    | Qty yang dipesan                         |
| unitPrice        | INTEGER | Harga per unit                           |
| total            | INTEGER | quantity × unitPrice                     |
| receivedQuantity | REAL    | Qty yang sudah diterima (default 0)      |

**Indexes**: `purchaseOrderId`

**Workflow**:
1. Buat PO (status=draft) → isi items
2. Kirim ke supplier (status=ordered)
3. Barang datang → Receive PO:
   - Update `receivedQuantity`
   - Insert `inventory_movements` type=`in` per item
   - Update `inventory.stock` += receivedQuantity
   - Status → received (atau partial jika belum semua)

### 17. `expense_categories`

Kategori pengeluaran operasional.

| Column   | Type    | Description                              |
| -------- | ------- | ---------------------------------------- |
| id       | TEXT PK |                                          |
| tenantId | TEXT FK |                                          |
| name     | TEXT    | NOT NULL (e.g. "Gaji &amp; Tunjangan")       |
| icon     | TEXT    | Lucide icon name (optional)              |
| color    | TEXT    | Hex color (default #64748b)              |
| isActive | BOOLEAN |                                          |

**Indexes**: `tenantId`

**10 kategori default** (seeded):
1. Gaji &amp; Tunjangan
2. Sewa Tempat
3. Listrik &amp; Air
4. Internet &amp; Telepon
5. Bahan Operasional
6. Transport &amp; BBM
7. Marketing &amp; Iklan
8. Maintenance Mesin
9. Pajak &amp; Retribusi
10. Lain-lain

### 18. `expenses`

Pencatatan pengeluaran operasional (OPEX).

| Column        | Type    | Description                                    |
| ------------- | ------- | ---------------------------------------------- |
| id            | TEXT PK |                                                |
| tenantId      | TEXT FK |                                                |
| branchId      | TEXT FK | → branches.id (nullable, untuk attribution)    |
| categoryId    | TEXT FK | → expense_categories.id                        |
| title         | TEXT    | NOT NULL (e.g. "Bayar listrik Mei")            |
| amount        | INTEGER | NOT NULL (IDR)                                 |
| paymentMethod | TEXT    | enum: cash / transfer / qris / ewallet / other |
| vendor        | TEXT    | Nama vendor/tujuan (optional)                  |
| receiptUrl    | TEXT    | URL foto receipt (optional)                    |
| notes         | TEXT    |                                                |
| expenseDate   | INTEGER | NOT NULL — tanggal pengeluaran                 |
| createdAt     | INTEGER |                                                |

**Indexes**: `tenantId`, `(tenantId, expenseDate)`, `categoryId`

**Integrasi P&amp;L**: 
- Total expenses dalam periode = Operating Expenses (OPEX) di Income Statement
- Net Profit = Gross Profit − OPEX

---

## Tabel Baru (v0.5.0) — Messaging, Notifications & Security

### 19. `notifications`

Persistent notifications per user.

| Column      | Type    | Description                                    |
| ----------- | ------- | ---------------------------------------------- |
| id          | TEXT PK | `notif_xxx`                                    |
| tenantId    | TEXT FK |                                                |
| userId      | TEXT FK | → users.id (nullable, null = all users)        |
| type        | TEXT    | order / payment / pickup / system / marketing  |
| title       | TEXT    | NOT NULL                                       |
| message     | TEXT    | NOT NULL                                       |
| link        | TEXT    | URL path to navigate (e.g. `/orders`)          |
| isRead      | BOOLEAN | default false                                  |
| createdAt   | INTEGER |                                                |

**Indexes**: `tenantId`, `(tenantId, userId)`, `(tenantId, isRead)`

**Use case**:
- Order status change → create notification
- Payment received → create notification
- Low stock alert → create notification
- Mark read via PATCH `/api/notifications/[id]`
- Mark all read via PATCH `/api/notifications`

### 20. `campaigns`

Marketing campaigns persistent storage.

| Column           | Type    | Description                                    |
| ---------------- | ------- | ---------------------------------------------- |
| id               | TEXT PK | `camp_xxx`                                     |
| tenantId         | TEXT FK |                                                |
| name             | TEXT    | NOT NULL — campaign name                       |
| segment          | TEXT    | all / gold / platinum / inactive / new         |
| channel          | TEXT    | whatsapp / telegram (from tenant setting)      |
| body             | TEXT    | Message body with placeholders                 |
| status           | TEXT    | enum: draft / scheduled / sent / cancelled     |
| scheduledAt      | INTEGER | Scheduled send time (nullable)                 |
| sentAt           | INTEGER | Actual send time                               |
| recipientCount   | INTEGER | Total recipients targeted                      |
| deliveredCount   | INTEGER | Successfully delivered                         |
| readCount        | INTEGER | Read/opened                                    |
| conversionCount  | INTEGER | Resulted in order                              |
| createdAt        | INTEGER |                                                |

**Indexes**: `tenantId`, `(tenantId, status)`

**Segment stats**: Recipient count calculated from real customer data:
- `all` → all active customers
- `gold` → customers with tier = gold
- `platinum` → customers with tier = platinum
- `inactive` → customers with no order in 30 days
- `new` → customers created in last 7 days

### 21. `messages`

Persistent chat messages (WhatsApp & Telegram).

| Column      | Type    | Description                                    |
| ----------- | ------- | ---------------------------------------------- |
| id          | TEXT PK | `msg_xxx`                                      |
| tenantId    | TEXT FK |                                                |
| customerId  | TEXT FK | → customers.id                                 |
| direction   | TEXT    | enum: inbound / outbound                       |
| channel     | TEXT    | whatsapp / telegram                            |
| body        | TEXT    | Message content                                |
| isBot       | BOOLEAN | true if sent/replied by bot                    |
| isRead      | BOOLEAN | default false (for inbound)                    |
| createdAt   | INTEGER |                                                |

**Indexes**: `tenantId`, `(tenantId, customerId)`, `(tenantId, isRead)`

**Use case**:
- Incoming message from webhook → insert with direction=`inbound`
- Admin reply from chat UI → insert with direction=`outbound`, isBot=false
- Bot auto-reply → insert with direction=`outbound`, isBot=true
- Chat inbox: GROUP BY customerId, ORDER BY createdAt DESC
- Thread view: WHERE customerId=? ORDER BY createdAt ASC

### 22. `tenant_security_settings`

Security configuration per tenant (persisted toggles).

| Column                  | Type    | Description                                    |
| ----------------------- | ------- | ---------------------------------------------- |
| tenantId                | TEXT PK | → tenants.id (1:1 relationship)                |
| twoFactorEnabled        | BOOLEAN | default false                                  |
| auditLogEnabled         | BOOLEAN | default true                                   |
| ipWhitelistEnabled      | BOOLEAN | default false                                  |
| sessionTimeoutEnabled   | BOOLEAN | default true                                   |
| sessionTimeoutMinutes   | INTEGER | default 60                                     |
| ipWhitelist             | TEXT    | Comma-separated IPs or CIDR (nullable)         |
| updatedAt               | INTEGER |                                                |

**Note**: This is a 1:1 table with `tenants`. Created on first access if not exists. No separate tenantId FK — tenantId IS the PK.

---

## Schema Conventions

### Primary Keys

Semua PK adalah `TEXT` dengan prefix:
- `tenant_xxx`
- `branch_xxx`
- `usr_xxx`
- `cst_xxx`
- `svc_xxx`
- `ord_xxx`
- `itm_xxx`
- `pay_xxx`
- `drv_xxx`
- `pck_xxx`
- `inv_xxx`
- `tpl_xxx`
- `mov_xxx` (inventory movements)
- `sup_xxx` (suppliers)
- `po_xxx` (purchase orders)
- `poi_xxx` (purchase order items)
- `expcat_xxx` (expense categories)
- `exp_xxx` (expenses)
- `notif_xxx` (notifications)
- `camp_xxx` (campaigns)
- `msg_xxx` (messages)

Generated via `generateId(prefix)` helper di `repositories.ts`.

### Timestamps

Stored as Unix timestamp (INTEGER seconds since epoch).

```typescript
createdAt: integer("created_at", { mode: "timestamp" })
  .notNull()
  .default(sql`(unixepoch())`)
```

Drizzle auto-convert ke `Date` object di TypeScript.

### Money

Disimpan sebagai `INTEGER` (Rupiah, no decimals). Untuk currency dengan decimals, simpan dalam smallest unit (cents) dan format di display.

### Booleans

SQLite tidak punya native BOOLEAN. Drizzle map `INTEGER` (0/1) ke `boolean` via `mode: "boolean"`.

## Foreign Keys &amp; Cascade

Cascade delete diaktifkan untuk dependent data:

```typescript
.references(() => tenants.id, { onDelete: "cascade" })
```

Hapus tenant → semua tabel terkait ikut terhapus. Hapus order → orderItems &amp; payments ikut terhapus. Hapus inventory → movements ikut terhapus. Hapus PO → PO items ikut terhapus.

## TypeScript Types

Drizzle auto-generate types dari schema:

```typescript
// Original 12 tables
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
// ... dll

// Financial tables (v0.4.0)
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

// New tables (v0.5.0)
export type Notification = typeof notifications.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type TenantSecuritySettings = typeof tenantSecuritySettings.$inferSelect;
```

Used di repositories dan API layer untuk type safety end-to-end.

## Migrations

### Push schema (development)

```bash
npm run db:push
```

Apply schema langsung ke DB. **Destructive** untuk perubahan kolom.

### Generate migration (production)

```bash
npm run db:generate
```

Generate file SQL di `drizzle/` folder. Review dulu sebelum apply.

```bash
# Apply manually via Turso CLI
turso db shell laundryhub-prod < drizzle/0001_xxx.sql
```

⚠️ **Penting**: 
- Selalu backup sebelum apply migration di production
- Test di staging dulu
- Migrations harus reversible (sediakan rollback)

## Performance Tips

### Indexes

Sudah ada index di columns yang sering di-filter:
- `tenantId` (semua tabel)
- `(tenantId, status)` di orders, pickups, purchase_orders
- `(tenantId, phone)` di customers
- `(tenantId, invoiceNumber)` di orders
- `(tenantId, type)` di inventory_movements
- `(tenantId, expenseDate)` di expenses
- `inventoryId` di inventory_movements
- `categoryId` di expenses

### Query Patterns

✅ Always filter by `tenantId` first:
```typescript
.where(and(eq(orders.tenantId, tenantId), eq(orders.status, "WASHING")))
```

✅ Use `Promise.all` untuk parallel queries:
```typescript
const [stats, orders, customers] = await Promise.all([
  getOrderStats(),
  listOrders(),
  listCustomers(),
]);
```

❌ Avoid N+1:
```typescript
// Bad
for (const order of orders) {
  order.customer = await getCustomer(order.customerId);  // N queries
}

// Good - JOIN
db.select().from(orders).leftJoin(customers, eq(orders.customerId, customers.id))
```

### Denormalization

`customers.totalOrders` dan `customers.totalSpending` di-denormalize untuk speed. Update di repository saat order completed.

## Selanjutnya

- [Backend Guide](./backend-guide.md) — pattern repositories
- [API Reference](./api-reference.md)
