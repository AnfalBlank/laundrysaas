# LaundryHub — Full-Stack ERP Laundry SaaS

Next.js 14 fullstack app dengan Turso (libSQL) sebagai database, Drizzle ORM, dan UI 3D-illustrated.

## Tech Stack

| Layer       | Tech                                               |
| ----------- | -------------------------------------------------- |
| Framework   | Next.js 14 (App Router) + TypeScript               |
| Database    | Turso (libSQL) — SQLite di edge                    |
| ORM         | Drizzle ORM                                        |
| Styling     | Tailwind CSS                                       |
| Charts      | Recharts                                           |
| Icons       | Lucide React + custom 3D SVG icons (laundry-icons) |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Turso

Buat `.env.local` di root frontend:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 3. Push schema dan seed

```bash
npm run db:push     # Buat tables
npm run db:seed     # Seed data demo
```

### 4. Run

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

| Script             | Function                                  |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Dev server                                |
| `npm run build`    | Production build                          |
| `npm run db:push`  | Push schema ke Turso                      |
| `npm run db:seed`  | Seed data demo                            |
| `npm run db:studio`| Buka Drizzle Studio (DB browser)          |

## Folder Structure

```
src/
├── app/                       # Next.js App Router
│   ├── api/                   # API endpoints (REST)
│   │   ├── dashboard/route.ts
│   │   ├── orders/route.ts
│   │   ├── customers/route.ts
│   │   └── ...
│   ├── (pages)/               # UI pages
│   │   ├── page.tsx           # / Dashboard
│   │   ├── orders/page.tsx
│   │   └── ...
│   └── track/[invoice]/       # Public customer tracking
├── db/
│   ├── schema.ts              # Drizzle schema (12 tables)
│   ├── client.ts              # libSQL client + drizzle instance
│   ├── repositories.ts        # Query functions
│   └── seed.ts                # Demo data seeder
├── components/
│   ├── dashboard/             # Dashboard widgets
│   ├── orders/                # Order list components
│   ├── customers/             # Customer components
│   ├── whatsapp/              # WhatsApp UI
│   ├── reports/               # Charts
│   ├── layout/                # Sidebar, Topbar, AppShell
│   └── ui/                    # Primitives + 3D icons
└── lib/
    ├── tenant.ts              # Multi-tenant resolver
    ├── utils.ts               # Helpers
    └── dummy-data.ts          # UI constants (status labels)
```

## Database Schema

12 tables dengan multi-tenant isolation via `tenantId`:

- `tenants` — SaaS tenants (multi-tenant)
- `branches` — Cabang per tenant
- `users` — Owner/Admin/Staff/Driver
- `customers` — Pelanggan + tier (silver/gold/platinum)
- `services` — Layanan + pricing
- `orders` — Order utama dengan 11 status
- `order_items` — Detail item per order
- `payments` — Pembayaran multi-method
- `drivers` — Driver pickup/delivery
- `pickups` — Task pickup & delivery
- `inventory` — Stok detergent/parfum/packaging
- `whatsapp_templates` — Template auto-reply

## API Endpoints

| Endpoint            | Method | Returns                                         |
| ------------------- | ------ | ----------------------------------------------- |
| `/api/dashboard`    | GET    | stats, charts, branches, recent orders          |
| `/api/orders`       | GET    | List orders (filterable by status)              |
| `/api/customers`    | GET    | List customers + stats                          |
| `/api/services`     | GET    | List services                                   |
| `/api/payments`     | GET    | Payment history + summary + outstanding         |
| `/api/pickups`      | GET    | Pickup tasks + drivers                          |
| `/api/inventory`    | GET    | Inventory items                                 |
| `/api/whatsapp`     | GET    | WA templates                                    |

Semua endpoint scope ke `tenantId` aktif (default `tenant_laundrysukses`).

## Pages

| Route                      | Data Source                             |
| -------------------------- | --------------------------------------- |
| `/`                        | Dashboard — stats, chart, recent orders |
| `/orders`                  | Real order list dengan filter           |
| `/customers`               | Customer list + tier filter             |
| `/services`                | Pricing per kategori                    |
| `/payments`                | Riwayat & summary pembayaran            |
| `/pickup`                  | Pickup tasks + driver status            |
| `/inventory`               | Stok dengan low-stock alert             |
| `/whatsapp`                | Template auto-reply + chat preview      |
| `/reports`                 | Analytics: omzet, profit, top services  |
| `/staff`                   | Staff per role + branch                 |
| `/marketing`               | Campaign + AI promo generator           |
| `/settings`                | Tenant config + integrations            |
| `/track/[invoice]`         | Public customer tracking by invoice     |
| `/login`                   | Auth UI                                 |

## Multi-Tenant Architecture

Semua tabel scope dengan `tenantId`. `getCurrentTenantId()` di `lib/tenant.ts` menentukan tenant aktif.

Production: derive tenant dari subdomain (`laundrysukses.laundryos.com` → `tenant_laundrysukses`) atau JWT.

## 3D Icon System

- **`<Icon3D>`**: container dengan tilt-on-hover dan animasi (float/wiggle/spin), 10 variant warna
- **`laundry-icons.tsx`**: 30+ illustrated SVG icons (WashingMachine3D, TruckDelivery3D, dll)

## Roadmap

- [ ] JWT authentication (NextAuth.js + Argon2)
- [ ] WhatsApp webhook integration (Fonnte)
- [ ] Payment gateway (Midtrans)
- [ ] Realtime via Supabase Realtime atau Pusher
- [ ] Print thermal invoice via WebUSB
- [ ] AI features: auto-reply OpenAI, promo generator
- [ ] Tenant signup flow
