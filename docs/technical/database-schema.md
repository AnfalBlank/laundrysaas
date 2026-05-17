# Database Schema

12 tabel dengan multi-tenant isolation via Drizzle ORM untuk Turso (libSQL).

## ERD

```
                        ┌──────────┐
                        │ tenants  │
                        └────┬─────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
  ┌────▼────┐          ┌────▼─────┐          ┌────▼─────┐
  │branches │          │  users   │          │customers │
  └────┬────┘          └──────────┘          └────┬─────┘
       │                                          │
       │                                          │
       │     ┌───────────┐                        │
       └─────►  orders   ◄────────────────────────┘
             └─────┬─────┘
                   │
       ┌───────────┼───────────┬─────────────┐
       │           │           │             │
  ┌────▼─────┐ ┌──▼──┐  ┌─────▼────┐  ┌────▼─────┐
  │order_    │ │pay- │  │ pickups  │  │whatsapp_ │
  │items     │ │ments│  └────┬─────┘  │templates │
  └────┬─────┘ └─────┘       │        └──────────┘
       │                     │
   ┌───▼────┐           ┌────▼─────┐
   │services│           │ drivers  │
   └────────┘           └──────────┘

           ┌──────────┐
           │inventory │
           └──────────┘
```

## Multi-Tenant Pattern

Semua tabel kecuali `tenants` dan `order_items` punya kolom `tenantId` (TEXT):

```typescript
tenantId: text("tenant_id")
  .notNull()
  .references(() => tenants.id, { onDelete: "cascade" }),
```

Setiap query di repositories selalu filter `WHERE tenant_id = ?`. Cascade delete memastikan saat tenant dihapus, semua data terkait ikut terhapus.

## Tables

### 1. `tenants`

SaaS-level tenant info.

| Column         | Type      | Constraints           | Description                          |
| -------------- | --------- | --------------------- | ------------------------------------ |
| id             | TEXT      | PK                    | `tenant_xxx`                         |
| name           | TEXT      | NOT NULL              | Display name                         |
| subdomain      | TEXT      | NOT NULL UNIQUE       | URL slug                             |
| customDomain   | TEXT      |                       | Custom domain (Pro+)                 |
| plan           | TEXT      | enum, default 'basic' | basic / pro / enterprise             |
| planExpiresAt  | INTEGER   |                       | Unix timestamp                       |
| logoUrl        | TEXT      |                       | URL ke logo                          |
| primaryColor   | TEXT      | default '#2563eb'     | Hex color                            |
| createdAt      | INTEGER   | NOT NULL              | Unix timestamp                       |

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

| Column         | Type    | Description                                  |
| -------------- | ------- | -------------------------------------------- |
| id             | TEXT PK |                                              |
| tenantId       | TEXT FK |                                              |
| name           | TEXT    | NOT NULL                                     |
| phone          | TEXT    | NOT NULL                                     |
| address        | TEXT    |                                              |
| notes          | TEXT    | Free-form admin notes                        |
| tier           | TEXT    | enum: silver / gold / platinum               |
| points         | INTEGER | Loyalty points                               |
| totalOrders    | INTEGER | Cached count for performance                 |
| totalSpending  | INTEGER | Cached sum                                   |
| isBlacklisted  | BOOLEAN |                                              |
| createdAt      | INTEGER |                                              |

**Indexes**: `tenantId`, `(tenantId, phone)`

🔵 **Note**: `totalOrders` dan `totalSpending` di-denormalize untuk performance. Update via trigger atau di repository saat order completed.

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
| method      | TEXT    | enum: cash / transfer / qris / ewallet   |
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

Hapus tenant → semua tabel terkait ikut terhapus. Hapus order → orderItems &amp; payments ikut terhapus.

## TypeScript Types

Drizzle auto-generate types dari schema:

```typescript
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Order = typeof orders.$inferSelect;
// ... dll
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
turso db shell laundryhub-prod &lt; drizzle/0001_xxx.sql
```

⚠️ **Penting**: 
- Selalu backup sebelum apply migration di production
- Test di staging dulu
- Migrations harus reversible (sediakan rollback)

## Performance Tips

### Indexes

Sudah ada index di columns yang sering di-filter:
- `tenantId` (semua tabel)
- `(tenantId, status)` di orders, pickups
- `(tenantId, phone)` di customers
- `(tenantId, invoiceNumber)` di orders

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
