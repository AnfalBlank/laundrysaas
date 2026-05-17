# Multi-Tenant Architecture

LaundryHub adalah SaaS platform — banyak tenant (laundry business) berbagi satu deployment.

## Strategi: Shared Database, Soft Isolation

Pilihan strategi multi-tenancy:

| Strategy                  | Pros                            | Cons                                 |
| ------------------------- | ------------------------------- | ------------------------------------ |
| Database per tenant       | Strong isolation, custom schema | Expensive, hard to manage 1000+ DBs  |
| Schema per tenant         | Medium isolation                | Complex, not all DBs support         |
| **Shared DB + tenantId**  | Cheap, simple, scalable         | Risk if filter forgotten             |

LaundryHub pakai **shared DB + `tenantId`** untuk balance antara cost dan complexity.

## Implementation

### 1. Schema-level

Setiap tabel (kecuali `tenants` dan child tables seperti `order_items`) punya `tenantId`:

```typescript
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  // ... other columns
}, (t) => ({
  tenantIdx: index("orders_tenant_idx").on(t.tenantId),
}));
```

### 2. Repository-level

`getCurrentTenantId()` resolve tenant aktif. Setiap query selalu filter:

```typescript
export async function listOrders() {
  const tenantId = getCurrentTenantId();
  return db
    .select()
    .from(orders)
    .where(eq(orders.tenantId, tenantId));  // ← always include
}
```

### 3. Cascade Delete

`onDelete: "cascade"` memastikan data tenant terhapus saat tenant dihapus:

```sql
-- Hapus tenant_xxx → semua orders, customers, payments terkait ikut terhapus
DELETE FROM tenants WHERE id = 'tenant_xxx';
```

## Tenant Resolution

### Current (Development)

Hardcoded di `src/lib/tenant.ts`:

```typescript
export const DEFAULT_TENANT_ID = "tenant_laundrysukses";

export function getCurrentTenantId(): string {
  return DEFAULT_TENANT_ID;
}
```

### Production Strategies

#### Strategy 1: Subdomain-based

```
https://laundrysukses.laundryhub.id  → tenant_laundrysukses
https://washhouse.laundryhub.id      → tenant_washhouse
```

Implementation:

```typescript
import { headers } from "next/headers";
import { db } from "@/db/client";

export async function getCurrentTenantId(): Promise<string> {
  const host = headers().get("host") ?? "";
  const subdomain = host.split(".")[0];

  if (!subdomain || subdomain === "www") {
    throw new Error("No tenant in subdomain");
  }

  // Lookup tenant by subdomain
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain))
    .limit(1);

  if (!tenant) throw new Error("Tenant not found");
  return tenant.id;
}
```

⚠️ Note: this becomes async, refactor repositories accordingly.

#### Strategy 2: JWT-based

Token issued at login:

```typescript
{
  "sub": "user_xxx",
  "tenantId": "tenant_xxx",
  "role": "owner",
  "exp": ...
}
```

Resolve:

```typescript
import { headers } from "next/headers";
import { verify } from "jsonwebtoken";

export function getCurrentTenantId(): string {
  const auth = headers().get("authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Unauthenticated");

  const token = auth.slice(7);
  const payload = verify(token, process.env.JWT_SECRET!) as {
    tenantId: string;
  };
  return payload.tenantId;
}
```

#### Strategy 3: Custom Domain

Bila tenant beli plan Pro+ untuk custom domain:

```
https://app.laundrysukses.com        → tenant_laundrysukses
```

Resolution:

```typescript
const host = headers().get("host");

// Try custom domain first
const [tenant] = await db
  .select()
  .from(tenants)
  .where(eq(tenants.customDomain, host))
  .limit(1);

if (tenant) return tenant.id;

// Fallback to subdomain
const subdomain = host.split(".")[0];
return resolveBySubdomain(subdomain);
```

## DNS Setup

### Wildcard DNS

Untuk subdomain dynamic (`*.laundryhub.id`):

```
Type: A
Name: *
Value: [server-ip]
TTL: 3600
```

Dengan ini, SEMUA subdomain otomatis resolve ke server.

### Custom Domain (Tenant-side)

Tenant set:

```
Type: CNAME
Name: app
Value: laundryhub.id
```

DNS verifikasi auto via Vercel / Cloudflare API.

## SSL

### Wildcard Certificate

Use Let's Encrypt wildcard (DNS-01 challenge):

```bash
certbot certonly --manual --preferred-challenges dns \
  -d "*.laundryhub.id" -d "laundryhub.id"
```

### Per-domain (Custom domain)

Auto-issued saat tenant verify domain. Vercel dan Coolify support ini built-in.

## Cross-Tenant Concerns

### Risk: Tenant Bleed

Bug di repository bisa accidentally show data tenant lain. Mitigations:

1. **Code review**: setiap PR yang touch repository di-review khusus untuk filter `tenantId`
2. **Test multi-tenant**: integration test dengan 2 tenant, assert tidak bocor
3. **Database trigger**: enforce di DB level (advanced)

Example test:

```typescript
test("listOrders only returns current tenant", async () => {
  // Setup: 2 tenants
  await createTestTenant("tenant_a");
  await createTestTenant("tenant_b");
  await createOrder({ tenantId: "tenant_a", ... });
  await createOrder({ tenantId: "tenant_b", ... });

  // Mock current tenant = a
  mockTenant("tenant_a");

  const orders = await listOrders();
  expect(orders.every(o => o.tenantId === "tenant_a")).toBe(true);
});
```

### Risk: User Switching Tenant

Bila user owner di multiple tenant, JWT harus include `tenantId` dan validate di repository.

```typescript
// Don't trust client-provided tenantId in body
const body = await req.json();
const tenantId = getCurrentTenantId();  // from JWT
// NOT: const { tenantId } = body
```

## Tenant Onboarding Flow

```
1. Public landing → "Daftar"
2. Form: nama bisnis, email, subdomain
3. Validate subdomain available (cek tenants.subdomain)
4. Create tenant + admin user
5. Send welcome email + verification link
6. Redirect ke laundrysukses.laundryhub.id
7. Setup wizard: cabang, layanan, staff, integrasi
8. Done!
```

API endpoint `POST /api/tenants/signup` (planned).

## Tenant Deactivation

Bila plan expired atau cancel:

```typescript
await db
  .update(tenants)
  .set({ planExpiresAt: new Date(), plan: "expired" })
  .where(eq(tenants.id, tenantId));
```

Middleware redirect ke `/billing/expired`:

```typescript
// middleware.ts
if (tenant.planExpiresAt &lt; new Date()) {
  return NextResponse.redirect("/billing/expired");
}
```

Data tetap accessible read-only sampai 30 hari, lalu archived.

## Tenant Migration

### Export Data

```typescript
async function exportTenantData(tenantId: string) {
  const data = {
    tenant: await db.select().from(tenants).where(eq(tenants.id, tenantId)),
    branches: await db.select().from(branches).where(eq(branches.tenantId, tenantId)),
    customers: await db.select().from(customers).where(...),
    orders: await db.select().from(orders).where(...),
    // ... all tables
  };
  return JSON.stringify(data, null, 2);
}
```

Endpoint: `GET /api/tenant/export` returns ZIP.

### Import to Another Instance

```typescript
async function importTenantData(data: ExportPayload) {
  await db.transaction(async tx => {
    await tx.insert(tenants).values(data.tenant);
    await tx.insert(branches).values(data.branches);
    // ... in dependency order
  });
}
```

## Performance Considerations

### Index Strategy

Setiap query mulai dengan `WHERE tenant_id = ?`. Composite indexes prefix dengan tenantId:

```typescript
index("orders_status_idx").on(t.tenantId, t.status)
index("orders_invoice_idx").on(t.tenantId, t.invoiceNumber)
index("customers_phone_idx").on(t.tenantId, t.phone)
```

Dengan ini, query rata-rata cuma scan rows tenant aktif, bukan global table.

### Per-Tenant Sharding (Future)

Untuk scale &gt; 100K tenants, consider shard by tenant region:

```
tenant_a, tenant_b → DB shard 1 (asia)
tenant_c, tenant_d → DB shard 2 (us)
```

Turso support multi-region replication built-in, jadi sharding biasanya tidak perlu sampai sangat besar.

## Tenant Settings

Setiap tenant punya settings sendiri (di `tenants` table):

- `primaryColor` — branding
- `logoUrl` — logo
- `customDomain` — vanity URL
- `plan` — feature flags

Future: separate `tenant_settings` table untuk granular config.

## Selanjutnya

- [Authentication](./authentication.md)
- [Deployment](./deployment.md)
