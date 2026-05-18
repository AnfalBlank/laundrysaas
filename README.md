# LaundryHub

Platform ERP Laundry berbasis SaaS dengan WhatsApp automation, pickup &amp; delivery, multi-cabang, multi-role, financial reporting, dan AI analytics. Dirancang untuk bisnis laundry modern di Indonesia.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Turso](https://img.shields.io/badge/Turso-libSQL-purple)](https://turso.tech)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)](https://tailwindcss.com)

## Quick Links

| Dokumen                                                    | Untuk siapa                  |
| ---------------------------------------------------------- | ---------------------------- |
| [Manual Book](./docs/manual/README.md)                     | Pengguna akhir (semua role)  |
| [Multi-Role Guide](./docs/manual/roles.md)                 | Owner / Admin (panduan role) |
| [Expenses &amp; Reports](./docs/manual/expenses-reports.md)    | Owner / Admin (keuangan)     |
| [Purchase Orders](./docs/manual/purchase-orders.md)        | Owner / Admin (procurement)  |
| [Technical Docs](./docs/technical/README.md)               | Developer                    |
| [Installation Guide](./docs/technical/installation.md)     | DevOps / Setup awal          |
| [API Reference](./docs/technical/api-reference.md)         | Integrasi &amp; developer        |
| [Database Schema](./docs/technical/database-schema.md)     | Database admin / developer   |
| [Deployment Guide](./docs/technical/deployment.md)         | DevOps / production          |
| [Changelog](./CHANGELOG.md)                                | Semua                        |

## Cepat Mulai

```bash
npm install
cp .env.example .env.local   # isi TURSO_DATABASE_URL & TURSO_AUTH_TOKEN
npm run db:push              # push schema ke Turso
npm run db:seed              # seed demo data
npm run dev                  # http://localhost:3000
```

## Demo Multi-Role

Klik avatar di pojok kanan atas → **Switch User** untuk test dashboard berbeda:

| Role               | Dashboard                                         | Menu Sidebar                          |
| ------------------ | ------------------------------------------------- | ------------------------------------- |
| **Owner**          | Stats, omzet, profit, branch performance          | 14 menu (semua)                       |
| **Admin / Kasir**  | Stats &amp; orders (tanpa angka omzet)                | 11 menu (no Settings/Reports/Staff)   |
| **Staff Laundry**  | Production Board kanban (5 status workflow)       | 4 menu (Dashboard/Orders/Inventory/Notif) |
| **Driver**         | Task list pickup/delivery dengan Maps integration | 4 menu (Dashboard/Pickup/Orders/Notif) |

## Fitur Utama

### Operasional
- 📊 **Dashboard per role** — Owner full, Admin restricted, Staff production focus, Driver task list
- 🧺 **Order Management** — 11 status workflow, filter, search, invoice auto-generate
- 🛵 **Pickup &amp; Delivery** — assign driver, tracking realtime, route via Google Maps
- 👤 **Customer Management** — tier loyalty (Silver/Gold/Platinum), poin reward, blacklist
- 💳 **Multi Payment** — Cash, QRIS, Transfer, E-Wallet, split payment

### Keuangan &amp; Laporan
- 💰 **Expenses (NEW)** — pencatatan biaya operasional dengan 10 kategori default
- 📈 **Reports — Income Statement (NEW)** — P&amp;L lengkap: Revenue → COGS → Gross Profit → OPEX → Net Profit
- 📊 **COGS auto-tracking** — dari inventory movements
- 📑 **Export PDF** Income Statement formal untuk laporan keuangan

### Inventory &amp; Procurement
- 📦 **Inventory** — stok detergent/parfum/packaging, low-stock alert
- 📜 **History Pemakaian (NEW)** — track setiap stok masuk/keluar dengan unit cost
- 🛒 **Purchase Orders (NEW)** — pemesanan ke supplier dengan auto-fill dari low-stock
- 🏭 **Supplier Management** — kelola data supplier

### Komunikasi &amp; Marketing
- 💬 **WhatsApp Automation** — auto-reply, broadcast, AI-suggested replies
- 📣 **Marketing Campaign** — segmentasi customer, A/B test, AI promo generator

### SaaS Multi-Tenant
- 🏢 **Multi Cabang** — manajemen multi outlet dalam satu tenant
- 🔐 **Role-Based Access Control** — 4 role dengan permission matrix
- 🎨 **Branding Custom** — warna primer, logo, custom domain (Pro+)

## Tech Stack

| Layer       | Tech                                  |
| ----------- | ------------------------------------- |
| Framework   | Next.js 14 (App Router) + TypeScript  |
| Database    | Turso (libSQL) — SQLite di edge       |
| ORM         | Drizzle ORM                           |
| Styling     | Tailwind CSS                          |
| Charts      | Recharts                              |
| Icons       | Lucide React + custom 3D SVG (30+)    |

## Database Schema

**18 tabel** dengan multi-tenant isolation:

- `tenants`, `branches`, `users` — SaaS layer
- `customers`, `services` — operational catalog
- `orders`, `order_items`, `payments` — transaksi
- `drivers`, `pickups` — logistik
- `inventory`, `inventory_movements` — stok &amp; tracking
- `suppliers`, `purchase_orders`, `purchase_order_items` — procurement
- `expenses`, `expense_categories` — keuangan
- `whatsapp_templates` — komunikasi

## Deployment ke Vercel

1. Import repo di [vercel.com/new](https://vercel.com/new)
2. Tambahkan Environment Variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
3. Deploy — Vercel auto-detect Next.js

Lihat [Deployment Guide](./docs/technical/deployment.md) untuk detail.

## Project Status

✅ **MVP Phase Complete** (sesuai PRD Phase 1-3):
- Login, dashboard, order management, customer management, pembayaran, tracking
- Pickup/delivery, QR code (planned), customer portal
- Multi-cabang, AI analytics (preparation), loyalty system, inventory
- **NEW**: Multi-role (Owner/Admin/Staff/Driver), Expenses, P&amp;L Reports, Purchase Orders

🔄 **Phase 4 In Progress**:
- Real authentication (NextAuth + bcrypt)
- API role guards
- Production WhatsApp/Payment integration

## Lisensi

Proprietary — internal LaundryHub product.
