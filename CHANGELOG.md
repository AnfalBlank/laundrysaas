# Changelog

All notable changes to LaundryHub akan dicatat di file ini.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/)

## [Unreleased]

### Planned
- JWT authentication via NextAuth
- WhatsApp webhook integration (Fonnte production)
- Payment gateway (Midtrans) integration
- Realtime updates via Pusher / Supabase Realtime
- Print thermal invoice via WebUSB
- AI auto-reply via OpenAI
- Tenant signup flow

## [0.1.0] — 2026-05-17

### Added — Initial Release

#### Frontend
- Next.js 14 App Router setup with TypeScript
- Tailwind CSS dengan custom 3D icon system
- 30+ custom illustrated 3D SVG icons (`laundry-icons.tsx`)
- `Icon3D` wrapper dengan tilt-on-hover dan animations
- Reusable UI primitives: Button, Card, Input, Badge
- Responsive Sidebar (fixed desktop, drawer mobile)
- Topbar dengan search, notifications, profile

#### Pages
- `/` Dashboard Owner — stats, charts, recent orders, branch performance
- `/orders` Order Management — filter, search, table desktop, card mobile
- `/customers` Customer Management — tier filter (Silver/Gold/Platinum)
- `/services` Pricing — grouped per category
- `/payments` Multi-method payment — Cash, QRIS, Transfer, E-Wallet
- `/pickup` Pickup &amp; Delivery — task list, driver status
- `/inventory` Stock management dengan low-stock alert
- `/whatsapp` Automation — template, chat preview, AI suggestion
- `/marketing` Campaign + AI promo generator
- `/reports` Analytics — omzet, profit, top services, busy hour heatmap
- `/staff` Staff per role (Owner/Admin/Staff/Driver)
- `/settings` 6 tabs — Profile, Branches, Branding, Integrations, Subscription, Security
- `/login` Split-screen login dengan illustrated hero
- `/track/[invoice]` Public customer tracking — no auth needed

#### Backend
- Turso (libSQL) database with Drizzle ORM
- 12 tables dengan multi-tenant isolation via `tenantId`
- Repository layer di `src/db/repositories.ts`
- Server Components fetch data langsung dari DB
- 8 REST API endpoints di `/api/*`
- Demo data seeder

#### Database Schema
- `tenants` — SaaS tenant with plan, subdomain, custom domain
- `branches` — multi-outlet support
- `users` — Owner/Admin/Staff/Driver roles
- `customers` — dengan tier loyalty (silver/gold/platinum) dan poin
- `services` — pricing per kg / item / unit
- `orders` — 11 status workflow
- `order_items` — multi-item per order
- `payments` — multi-method dengan split payment support
- `drivers` — dengan vehicle info
- `pickups` — pickup &amp; delivery tasks
- `inventory` — stok dengan minimum threshold
- `whatsapp_templates` — auto-reply templates

#### Documentation
- Root README dengan quick links
- User Manual Book di `docs/manual/`:
  - Getting Started
  - Dashboard, Orders, Pickup, Customers, Services
  - Payments, Inventory, WhatsApp, Marketing
  - Reports, Staff, Settings, Customer Portal, FAQ
- Technical Docs di `docs/technical/`:
  - Architecture overview
  - Installation guide
  - Database schema
  - API reference
  - Frontend guide
  - Backend guide
  - Icon system
  - Multi-tenant architecture
  - Deployment guide
  - Contributing guide

### Tech Stack
- Next.js 14.2.5
- React 18.3
- TypeScript 5.6
- Tailwind CSS 3.4
- Drizzle ORM 0.x
- @libsql/client (Turso)
- Recharts 2.13
- Lucide React 0.460

### Design Philosophy
- Mobile-first responsive
- 3D illustrated icons sebagai signature
- No emoji policy untuk konsistensi cross-platform
- Server Components default untuk performance
- Multi-tenant SaaS-ready

---

## Versioning Notes

### MAJOR (X.0.0)

Breaking changes:
- API response shape changes
- Schema migration requiring code update
- Removed features

### MINOR (0.X.0)

Backward-compatible features:
- New endpoints
- New pages
- New optional config

### PATCH (0.0.X)

Bug fixes &amp; small improvements:
- UI polish
- Performance
- Documentation
- Security patches
