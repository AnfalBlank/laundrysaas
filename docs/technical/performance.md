# Performance & Caching

Optimasi performa untuk LaundryHub.

## Current Baseline

| Metric                  | Current     | Target      |
| ----------------------- | ----------- | ----------- |
| Dashboard TTFB          | ~500ms      | < 300ms     |
| Orders page load        | ~400ms      | < 300ms     |
| API response time       | ~200-800ms  | < 200ms     |
| Lighthouse Performance  | ~75         | > 90        |
| Core Web Vitals LCP     | ~2.5s       | < 2.5s      |
| Core Web Vitals FID     | ~50ms       | < 100ms     |
| Core Web Vitals CLS     | ~0.05       | < 0.1       |

## Database Performance

### Indexes (Already Implemented)

```typescript
// orders table
tenantIdx: index("orders_tenant_idx").on(t.tenantId),
statusIdx: index("orders_status_idx").on(t.tenantId, t.status),
invoiceIdx: index("orders_invoice_idx").on(t.tenantId, t.invoiceNumber),
customerIdx: index("orders_customer_idx").on(t.customerId),

// customers table
tenantIdx: index("customers_tenant_idx").on(t.tenantId),
phoneIdx: index("customers_phone_idx").on(t.tenantId, t.phone),
```

### Query Optimization

#### Parallel Queries

```typescript
// ❌ Sequential: 3 × DB latency
const stats = await getOrderStats();
const chart = await getRevenueChart();
const orders = await listOrders();

// ✅ Parallel: 1 × DB latency
const [stats, chart, orders] = await Promise.all([
  getOrderStats(),
  getRevenueChart(),
  listOrders(),
]);
```

#### Select Only Needed Columns

```typescript
// ❌ SELECT * (fetches all columns)
db.select().from(orders);

// ✅ Select specific columns
db.select({
  id: orders.id,
  invoice: orders.invoiceNumber,
  total: orders.total,
}).from(orders);
```

#### Limit Results

```typescript
// Always limit unless you need all
.limit(100)

// Pagination
.limit(20).offset(page * 20)
```

#### Avoid N+1

```typescript
// ❌ N+1: 1 + N queries
const orders = await listOrders();
for (const o of orders) {
  o.customer = await getCustomer(o.customerId);
}

// ✅ JOIN: 1 query
db.select()
  .from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id));
```

### Turso Edge Replication

Turso auto-replicates reads ke nearest region. Untuk SE Asia:

```bash
turso db create laundryhub-prod --location sin  # Singapore primary
turso db replicate laundryhub-prod --location nrt  # Tokyo replica
```

Reads dari Indonesia → Singapore (~20ms) vs US (~200ms).

## Caching Strategy

### Layer 1: Next.js Built-in Cache

Server Components auto-cache per request (deduplication):

```typescript
// These 2 calls in same request → only 1 DB query
const a = await listOrders();
const b = await listOrders();  // cached
```

### Layer 2: Route Segment Cache

```typescript
// Cache page for 60 seconds
export const revalidate = 60;

// Always fresh (current default)
export const dynamic = "force-dynamic";
```

For semi-static data (services, branches):

```typescript
// app/services/page.tsx
export const revalidate = 300;  // 5 minutes
```

### Layer 3: Redis Cache (Future)

For hot data accessed frequently:

```typescript
// src/lib/cache.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  const data = await fn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Usage
export async function listServicesCache(tenantId: string) {
  return withCache(
    `services:${tenantId}`,
    300,  // 5 min TTL
    () => listServices()
  );
}
```

#### Cache Invalidation

```typescript
// When service is updated
await db.update(services).set({ price: newPrice }).where(...);
await redis.del(`services:${tenantId}`);  // Invalidate cache
```

### Layer 4: Browser Cache

Static assets (JS, CSS, images) auto-cached by Next.js with content hash:

```
/_next/static/chunks/xxx-[hash].js  → Cache-Control: max-age=31536000
```

API responses: no cache by default (`Cache-Control: no-store`).

For public data (customer portal):

```typescript
// app/track/[invoice]/page.tsx
export async function generateMetadata() {
  return {
    other: {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
    },
  };
}
```

## Frontend Performance

### Bundle Size

Current bundle analysis:

```bash
npm run build
# Check .next/analyze/ (add @next/bundle-analyzer)
```

Add bundle analyzer:

```bash
npm install -D @next/bundle-analyzer
```

`next.config.mjs`:

```js
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

### Optimize Package Imports

```js
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@libsql/client",
    ],
  },
};
```

### Lazy Load Heavy Components

```tsx
import dynamic from "next/dynamic";

// Charts only loaded when needed
const RevenueChart = dynamic(
  () => import("@/components/dashboard/revenue-chart").then(m => m.RevenueChartCard),
  {
    loading: () => <div className="h-72 animate-pulse bg-slate-100 rounded-2xl" />,
    ssr: false,  // recharts needs browser
  }
);
```

### Image Optimization

```tsx
import Image from "next/image";

// ✅ Optimized (WebP, lazy load, size hints)
<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={40}
  priority  // for above-fold images
/>

// ❌ Unoptimized
<img src="/logo.png" alt="Logo" />
```

### Font Optimization

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",  // FOUT instead of FOIT
  variable: "--font-inter",
  preload: true,
});
```

### Code Splitting

Next.js auto-splits per route. Manual split untuk large components:

```tsx
// Only load when user navigates to /reports
const ReportsPage = dynamic(() => import("./reports-page"));
```

## Server Performance

### Streaming (React Suspense)

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <>
      {/* Renders immediately */}
      <StatCards />

      {/* Streams in when ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </>
  );
}
```

### Edge Runtime

For API routes yang tidak butuh Node.js APIs:

```typescript
// src/app/api/orders/route.ts
export const runtime = "edge";  // Runs at CDN edge
```

⚠️ Edge runtime tidak support semua Node.js APIs. Test dulu.

### Connection Pooling

Turso client auto-manages connections. Untuk high concurrency:

```typescript
// src/db/client.ts
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
  // Turso handles pooling internally
});
```

## Monitoring

### Core Web Vitals

Vercel Analytics (built-in):

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Metrics

```typescript
// Track slow queries
const start = performance.now();
const orders = await listOrders();
const duration = performance.now() - start;

if (duration > 500) {
  console.warn(`Slow query: listOrders took ${duration}ms`);
}
```

### Lighthouse CI

`.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
        working-directory: frontend
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/orders
          budgetPath: ./lighthouse-budget.json
```

`lighthouse-budget.json`:

```json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "first-contentful-paint", "budget": 2000 },
      { "metric": "largest-contentful-paint", "budget": 3000 },
      { "metric": "total-blocking-time", "budget": 300 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "total", "budget": 500 }
    ]
  }
]
```

## Performance Checklist

### Database

- [x] Indexes on tenantId + commonly filtered columns
- [x] Parallel queries with Promise.all
- [x] Select specific columns (not SELECT *)
- [x] Limit results
- [ ] Redis cache for hot data
- [ ] Query profiling (identify slow queries)

### Frontend

- [x] Server Components by default
- [x] Tailwind CSS (purged)
- [x] Next.js font optimization
- [ ] Bundle analyzer run
- [ ] Lazy load charts
- [ ] Image optimization (next/image)
- [ ] Streaming with Suspense

### Infrastructure

- [ ] Turso edge replication
- [ ] CDN (Cloudflare)
- [ ] Gzip/Brotli compression
- [ ] HTTP/2 enabled

## Selanjutnya

- [Deployment](./deployment.md)
- [Security](./security.md)
