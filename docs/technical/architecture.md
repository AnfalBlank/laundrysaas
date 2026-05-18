# Architecture Overview

System design, tech stack, dan key architectural decisions.

## High-Level Architecture

LaundryHub adalah **fullstack monolith** dengan Next.js 14 App Router. Tidak ada backend terpisah — API route &amp; server components handle data fetching langsung dari database.

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js 14 App                        │
│                                                          │
│  ┌─────────────────┐         ┌──────────────────────┐    │
│  │  Server Comps   │  ←→     │   API Routes         │    │
│  │  (default)      │         │   /api/* (REST)      │    │
│  └────────┬────────┘         └──────────┬───────────┘    │
│           │                             │                │
│           └─────────────┬───────────────┘                │
│                         │                                │
│              ┌──────────▼──────────┐                     │
│              │  Repositories       │                     │
│              │  (Drizzle queries)  │                     │
│              └──────────┬──────────┘                     │
└─────────────────────────┼────────────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │  Turso (libSQL)   │
                │  Edge SQLite      │
                └───────────────────┘
```

## Tech Stack Justification

### Why Next.js 14 (App Router)?

✅ **Server Components by default** — less JS to client, better TTFB  
✅ **Streaming &amp; Suspense** — progressive page load  
✅ **Edge runtime** — deploy ke edge untuk latency rendah  
✅ **Built-in API routes** — no separate backend needed  
✅ **TypeScript first-class** — type safety end-to-end  

### Why Turso (libSQL)?

✅ **SQLite-as-a-service** — proven, reliable, simple  
✅ **Edge replication** — read replicas di seluruh dunia  
✅ **Cheap** — generous free tier, predictable pricing  
✅ **Embedded mode possible** — sync ke local SQLite untuk offline  
✅ **No vendor lock-in** — bisa export ke SQLite file  

❌ **Limitations**:
- No advanced features seperti full-text search (use external)
- Eventually consistent across replicas
- 256KB row size limit

### Why Drizzle ORM?

✅ **TypeScript-first** — schema defines types  
✅ **SQL-like syntax** — predictable, no magic  
✅ **Lightweight** — &lt; 10KB runtime  
✅ **Migrations friendly** — `drizzle-kit` generate SQL  
✅ **Multiple dialects** — bisa swap ke PostgreSQL/MySQL  

vs Prisma:
- Prisma lebih powerful tapi heavier (~ 10x larger bundle)
- Drizzle lebih "close to metal", less abstractions

### Why Tailwind?

✅ **Utility-first** — fast iteration  
✅ **Small bundle** — purged unused classes  
✅ **Customizable** — design tokens di `tailwind.config.ts`  
✅ **Component-friendly** — pakai dengan cva untuk variants  

## Folder Structure

```
src/
├── app/                       # Next.js App Router
│   ├── (pages)/               # Authenticated pages
│   │   ├── page.tsx           # / Dashboard
│   │   ├── orders/page.tsx
│   │   ├── customers/page.tsx
│   │   └── ...
│   ├── api/                   # REST API endpoints
│   │   ├── dashboard/route.ts
│   │   ├── orders/route.ts
│   │   └── ...
│   ├── login/page.tsx         # Public login
│   ├── track/[invoice]/       # Public tracking
│   ├── globals.css            # Tailwind + CSS vars
│   ├── layout.tsx             # Root layout
│   └── not-found.tsx
│
├── components/
│   ├── dashboard/             # Dashboard-specific widgets
│   ├── orders/                # Order list view
│   ├── customers/             # Customer view
│   ├── whatsapp/              # WhatsApp UI
│   ├── reports/               # Charts
│   ├── layout/                # Sidebar, Topbar, AppShell
│   └── ui/                    # Reusable primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── icon3d.tsx         # 3D icon wrapper
│       └── laundry-icons.tsx  # 30+ custom 3D SVG
│
├── db/
│   ├── schema.ts              # Drizzle schema (18 tables)
│   ├── client.ts              # libSQL client
│   ├── repositories.ts        # Query functions
│   └── seed.ts                # Demo data
│
└── lib/
    ├── utils.ts               # cn(), formatCurrency(), etc
    ├── tenant.ts              # getCurrentTenantId()
    ├── auth.ts                # getCurrentUser(), hasPermission(), canAccessPage()
    ├── auth-types.ts          # Role type, AuthUser interface (client-safe)
    ├── export.ts              # CSV/PDF export utilities
    └── dummy-data.ts          # UI constants (status labels)
```

## Component Composition Pattern

### Server Components (default)

Pages fetch data langsung di server:

```tsx
// app/orders/page.tsx
import { listOrders } from "@/db/repositories";

export default async function OrdersPage() {
  const orders = await listOrders();
  return <OrdersView orders={orders} />;
}
```

### Client Components (interactivity)

Komponen yang butuh state / event handler:

```tsx
// components/orders/orders-view.tsx
"use client";

export function OrdersView({ orders }) {
  const [filter, setFilter] = useState("ALL");
  // ... interactive UI
}
```

### Hybrid Pattern

Server fetches → pass to client for interactivity. Reduces client JS bundle while keeping UX dynamic.

## Data Flow

```
1. Browser request:  GET /orders
                        ↓
2. Server Component:  app/orders/page.tsx (async)
                        ↓
3. Repository:        listOrders({ tenantId })
                        ↓
4. Drizzle ORM:       db.select().from(orders)...
                        ↓
5. Turso libSQL:      executes SQL via HTTPS
                        ↓
6. Response:          JSON results
                        ↓
7. Page renders:      <OrdersView initialOrders={data}>
                        ↓
8. Client hydrates:   filtering, sorting, etc.
```

## Multi-Tenant Strategy

**Soft isolation** via `tenantId` column di setiap tabel:

```sql
-- Every tenant-scoped query includes:
WHERE tenant_id = 'tenant_laundrysukses'
```

Implemented via `getCurrentTenantId()` di repositories. Production akan derive dari subdomain / JWT.

Lihat [Multi-Tenant](./multi-tenant.md) untuk detail.

## Authentication &amp; RBAC

### Current Implementation (Demo)

Cookie-based user switching for testing:

```
src/lib/auth.ts          — Server-only: getCurrentUser(), hasPermission(), canAccessPage()
src/lib/auth-types.ts    — Client-safe: Role type, AuthUser interface, ROLE_LABELS
src/app/api/auth/switch  — POST endpoint to switch user (sets cookie)
```

**Flow**:
1. Cookie `laundryhub_user` stores user ID
2. `getCurrentUser()` reads cookie → queries DB → returns `AuthUser`
3. `AppShell` (server component) calls `getCurrentUser()` → passes to Sidebar/Topbar
4. Sidebar filters menu items via `canAccessPage(role, path)`
5. Dashboard renders role-specific component based on `user.role`

### 4 Roles

| Role   | Dashboard          | Menu Count | Financial Access |
|--------|--------------------|------------|------------------|
| owner  | Full executive     | 14         | Full             |
| admin  | Operational        | 11         | None             |
| staff  | Production Board   | 4          | None             |
| driver | Task List          | 4          | None             |

### Permission Matrix

```typescript
// src/lib/auth.ts
const ROLE_PERMISSIONS = {
  owner: ["*"],
  admin: ["orders:*", "customers:*", "payments:*", "pickups:*", ...],
  staff: ["orders:read", "orders:update_status", "inventory:read", "inventory:adjust"],
  driver: ["pickups:read", "pickups:update_status", "orders:read"],
}
```

### Limitations (Current)

- API routes do NOT enforce permission checks server-side (planned)
- No middleware blocking protected routes per role (planned)
- Password hashing not implemented (demo uses plain text comparison)

### Production Plan

- NextAuth.js / Auth.js with credentials provider
- bcrypt password hashing
- JWT session tokens
- Middleware for route protection
- API route guards
- 2FA via OTP

Lihat [Authentication](./authentication.md).

## State Management

| Type                  | Solution                                    |
| --------------------- | ------------------------------------------- |
| Server data           | Server Components + repositories            |
| Form state            | React `useState` (lightweight)              |
| URL state             | `useSearchParams`, `usePathname`            |
| Client cache          | None yet (consider SWR / TanStack Query)    |
| Global state          | None yet (consider Zustand if needed)       |

Default approach: keep state local, only lift up when needed.

## Styling Strategy

### Tailwind utility classes

```tsx
<div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition">
```

### Component variants via cva

```tsx
const buttonVariants = cva(
  "inline-flex items-center rounded-xl",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white",
        secondary: "bg-white border",
      },
      size: { sm: "h-8", md: "h-10", lg: "h-12" },
    },
  }
);
```

### Custom CSS via `globals.css`

For complex styling that's hard di Tailwind:
- Glassmorphism
- 3D icon effects
- Animations (keyframes already di tailwind config)

## Icon System

3D illustrated icons sebagai signature design:

1. **`<Icon3D>`** — generic 3D container dengan tilt
2. **`<WashingMachine3D>` etc** — 30+ custom SVG illustrations
3. **Lucide Icons** — utility icons (Search, Plus, dll)

Lihat [Icon System](./icon-system.md).

## Performance Considerations

### Build optimizations

- Server components → less client JS
- Code splitting per route (Next.js automatic)
- Image optimization (next/image)
- Font optimization (next/font)

### Runtime optimizations

- `dynamic = "force-dynamic"` for fresh data
- `Promise.all()` untuk parallel queries
- DB indexes pada `tenantId`, `status`, `phone`
- Turso edge replication for read latency

### Future optimizations

- Add Redis caching layer
- ISR (Incremental Static Regeneration) untuk public pages
- Service Worker untuk offline-first
- Lazy load charts (recharts dependency)

## Security

- Multi-tenant isolation via `tenantId`
- Input validation (planned: Zod)
- SQL injection: prevented by Drizzle parameterized queries
- XSS: React auto-escapes
- CSRF: SameSite cookies + Origin check (planned)
- Rate limiting (planned: Upstash)

Lihat [Security](./security.md).

## Deployment Target

| Environment   | Platform                                          |
| ------------- | ------------------------------------------------- |
| Development   | localhost                                         |
| Staging       | Vercel preview / Coolify                          |
| Production    | Vercel / Coolify / Dokploy / self-hosted Docker   |

Lihat [Deployment Guide](./deployment.md).

## Selanjutnya

- [Installation](./installation.md)
- [Database Schema](./database-schema.md)
- [API Reference](./api-reference.md)
