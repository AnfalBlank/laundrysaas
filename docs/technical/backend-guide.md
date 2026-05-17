# Backend Guide

Drizzle ORM patterns, repositories, dan API route conventions.

## Layers

```
┌─────────────────────────┐
│   API Routes / Pages    │   src/app/**
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│     Repositories        │   src/db/repositories.ts
│  (business queries)     │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│     Drizzle ORM         │   src/db/client.ts
│   (schema, type-safe)   │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│       Turso DB          │
└─────────────────────────┘
```

## Database Client

Single instance untuk seluruh app:

```typescript
// src/db/client.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

## Repository Pattern

Business logic queries dipisahkan ke `repositories.ts`. **Selalu** include `tenantId` filter.

### Naming Convention

| Prefix     | For                        | Example                          |
| ---------- | -------------------------- | -------------------------------- |
| `list*`    | Get many records           | `listOrders()`                   |
| `get*`     | Get single record / stat   | `getOrderStats()`, `getOrder()`  |
| `create*`  | Insert new record          | `createOrder()`                  |
| `update*`  | Update record              | `updateOrderStatus()`            |
| `delete*`  | Soft/hard delete           | `deleteCustomer()`               |

### Example Repository

```typescript
import { db } from "./client";
import { orders, customers, branches } from "./schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export async function listOrders(opts?: {
  status?: string;
  limit?: number;
}) {
  const tenantId = getCurrentTenantId();
  const conditions = [eq(orders.tenantId, tenantId)];

  if (opts?.status && opts.status !== "ALL") {
    conditions.push(eq(orders.status, opts.status as never));
  }

  return db
    .select({
      id: orders.id,
      invoice: orders.invoiceNumber,
      total: orders.total,
      customerName: customers.name,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(opts?.limit ?? 100);
}
```

## Drizzle Query Patterns

### Select

```typescript
// Simple select all
const all = await db.select().from(orders);

// Select specific columns (better performance)
const minimal = await db
  .select({
    id: orders.id,
    invoice: orders.invoiceNumber,
  })
  .from(orders);

// With where
const active = await db
  .select()
  .from(orders)
  .where(eq(orders.status, "WASHING"));

// Multiple conditions
.where(and(
  eq(orders.tenantId, tenantId),
  eq(orders.status, "WASHING"),
  sql`${orders.total} > 50000`
))
```

### Joins

```typescript
// Left join (customers might be null)
db.select()
  .from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id));

// Inner join (only orders WITH customer)
db.select()
  .from(orders)
  .innerJoin(customers, eq(orders.customerId, customers.id));
```

### Aggregations

```typescript
import { sql } from "drizzle-orm";

const [stats] = await db
  .select({
    total: sql<number>`coalesce(sum(${orders.total}), 0)`,
    count: sql<number>`count(*)`,
  })
  .from(orders)
  .where(eq(orders.tenantId, tenantId));

// Note: sum/count return as bigint, cast to number:
return Number(stats.total);
```

### Group By

```typescript
const byMethod = await db
  .select({
    method: payments.method,
    total: sql<number>`sum(${payments.amount})`,
  })
  .from(payments)
  .groupBy(payments.method);
```

### Insert

```typescript
import { generateId } from "./repositories";

await db.insert(orders).values({
  id: generateId("ord"),
  tenantId,
  customerId: "cst_xxx",
  invoiceNumber: "INV-...",
  status: "RECEIVED",
  paymentStatus: "unpaid",
  pickupType: "pickup",
  total: 36000,
  // createdAt auto-default
});

// Bulk insert
await db.insert(orderItems).values([
  { id: generateId("itm"), orderId, serviceId, ... },
  { id: generateId("itm"), orderId, serviceId, ... },
]);

// Insert and return
const [inserted] = await db
  .insert(customers)
  .values({ id: generateId("cst"), tenantId, name, phone })
  .returning();
```

### Update

```typescript
await db
  .update(orders)
  .set({ status: "WASHING", updatedAt: new Date() })
  .where(eq(orders.id, orderId));

// Conditional update
await db
  .update(customers)
  .set({
    totalOrders: sql`${customers.totalOrders} + 1`,
    totalSpending: sql`${customers.totalSpending} + ${amount}`,
  })
  .where(eq(customers.id, customerId));
```

### Delete

```typescript
await db
  .delete(orders)
  .where(eq(orders.id, orderId));

// Soft delete (recommended for audit trail)
await db
  .update(customers)
  .set({ isBlacklisted: true })
  .where(eq(customers.id, customerId));
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  // Insert order
  await tx.insert(orders).values({ ... });

  // Insert items
  await tx.insert(orderItems).values([ ... ]);

  // Update customer stats
  await tx.update(customers).set({ ... }).where(...);

  // If any throws, all rollback
});
```

## API Routes Pattern

### Basic GET

```typescript
// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { listOrders } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const orders = await listOrders({ status, limit: 100 });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders API error:", err);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
```

### POST with body

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // TODO: validate with zod
    const { customerId, items } = body;

    if (!customerId || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await createOrder({ customerId, items });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### PATCH for updates

```typescript
// src/app/api/orders/[id]/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const updated = await updateOrder(params.id, body);
  return NextResponse.json({ order: updated });
}
```

### Cache headers

```typescript
// Force fresh data (default for /api/*)
export const dynamic = "force-dynamic";

// Or cache for N seconds
export const revalidate = 60;
```

## Tenant Resolution

`getCurrentTenantId()` saat ini hardcoded:

```typescript
// src/lib/tenant.ts
export const DEFAULT_TENANT_ID = "tenant_laundrysukses";

export function getCurrentTenantId(): string {
  return DEFAULT_TENANT_ID;
}
```

🔜 Production:

```typescript
import { headers } from "next/headers";
import { verify } from "jsonwebtoken";

export function getCurrentTenantId(): string {
  // Option 1: from subdomain
  const host = headers().get("host") ?? "";
  const subdomain = host.split(".")[0];
  if (subdomain && subdomain !== "www") {
    return `tenant_${subdomain}`;
  }

  // Option 2: from JWT
  const token = headers().get("authorization")?.replace("Bearer ", "");
  if (token) {
    const payload = verify(token, process.env.JWT_SECRET!) as {
      tenantId: string;
    };
    return payload.tenantId;
  }

  throw new Error("Unauthenticated");
}
```

## Validation (Coming Soon)

Implement Zod untuk type-safe validation:

```typescript
import { z } from "zod";

const CreateOrderSchema = z.object({
  customerId: z.string().min(1),
  branchId: z.string().optional(),
  pickupType: z.enum(["walk_in", "pickup"]),
  items: z.array(
    z.object({
      serviceId: z.string(),
      qty: z.number().positive(),
    })
  ).min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // parsed.data is fully typed
  const order = await createOrder(parsed.data);
  return NextResponse.json({ order });
}
```

## Error Handling

### Patterns

```typescript
try {
  await dangerousOperation();
} catch (err) {
  // Log dengan context
  console.error("Operation X failed:", {
    tenantId,
    userId,
    error: err instanceof Error ? err.message : err,
  });

  // Return user-friendly error
  return NextResponse.json(
    { error: "Operation failed" },
    { status: 500 }
  );
}
```

### Custom Error Classes

```typescript
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

// Use:
if (!order) throw new NotFoundError("Order");
if (order.tenantId !== currentTenantId) throw new ForbiddenError();
```

## Performance Tips

### Index hints

Drizzle doesn't have explicit index hints, but design schema dengan proper indexes:

```typescript
(t) => ({
  tenantIdx: index("orders_tenant_idx").on(t.tenantId),
  statusIdx: index("orders_status_idx").on(t.tenantId, t.status),
})
```

### Avoid N+1

```typescript
// BAD: 1 + N queries
const orders = await listOrders();
for (const o of orders) {
  o.customer = await getCustomer(o.customerId);  // N queries!
}

// GOOD: 1 query with join
const orders = await db
  .select({...})
  .from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id));

// Or: 2 queries with batch
const orders = await listOrders();
const customerIds = orders.map(o => o.customerId);
const customers = await db
  .select()
  .from(customers)
  .where(sql`${customers.id} in ${customerIds}`);
const map = new Map(customers.map(c => [c.id, c]));
orders.forEach(o => o.customer = map.get(o.customerId));
```

### Parallel queries

```typescript
// Sequential (slow): ~3 × DB latency
const stats = await getOrderStats();
const chart = await getRevenueChart();
const orders = await listOrders();

// Parallel (fast): ~1 × DB latency
const [stats, chart, orders] = await Promise.all([
  getOrderStats(),
  getRevenueChart(),
  listOrders(),
]);
```

### Limit result size

```typescript
// Always limit unless you need all
.limit(100)

// Pagination
.limit(20).offset(page * 20)
```

## Caching Strategy (Future)

### In-memory cache

```typescript
import LRU from "lru-cache";

const cache = new LRU<string, any>({ max: 100, ttl: 60_000 });

export async function getServicesCache(tenantId: string) {
  const key = `services:${tenantId}`;
  if (cache.has(key)) return cache.get(key);

  const services = await listServices();
  cache.set(key, services);
  return services;
}
```

### Redis (for multi-instance)

```typescript
import { redis } from "@/lib/redis";

const cached = await redis.get(`services:${tenantId}`);
if (cached) return JSON.parse(cached);

const services = await listServices();
await redis.setex(`services:${tenantId}`, 60, JSON.stringify(services));
return services;
```

## Logging

Currently console-based. Future: structured logging:

```typescript
import pino from "pino";

const logger = pino();

logger.info({ tenantId, orderId, action: "created" }, "Order created");
logger.error({ err, tenantId }, "Failed to create order");
```

## Selanjutnya

- [API Reference](./api-reference.md)
- [Database Schema](./database-schema.md)
