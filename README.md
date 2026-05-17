# LaundryHub

Platform ERP Laundry berbasis SaaS dengan WhatsApp automation, pickup &amp; delivery, multi cabang, dan AI analytics. Dirancang untuk bisnis laundry modern di Indonesia.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Turso](https://img.shields.io/badge/Turso-libSQL-purple)](https://turso.tech)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)](https://tailwindcss.com)

## Quick Links

| Dokumen                                                    | Untuk siapa                  |
| ---------------------------------------------------------- | ---------------------------- |
| [Manual Book](./docs/manual/README.md)                     | Pengguna akhir (owner/admin) |
| [Technical Docs](./docs/technical/README.md)               | Developer                    |
| [Installation Guide](./docs/technical/installation.md)     | DevOps / Setup awal          |
| [API Reference](./docs/technical/api-reference.md)         | Integrasi & developer        |
| [Database Schema](./docs/technical/database-schema.md)     | Database admin / developer   |
| [Deployment Guide](./docs/technical/deployment.md)         | DevOps / production          |
| [Contributing](./docs/technical/contributing.md)           | Kontributor                  |
| [Changelog](./CHANGELOG.md)                                | Semua                        |

## Cepat Mulai

```bash
cd frontend
npm install
cp .env.example .env.local   # isi TURSO_DATABASE_URL & TURSO_AUTH_TOKEN
npm run db:push              # push schema ke Turso
npm run db:seed              # seed demo data
npm run dev                  # http://localhost:3000
```

## Fitur Utama

- 📊 **Dashboard Owner** — omzet realtime, performa cabang, top services
- 🧺 **Order Management** — 11 status workflow, filter, search, invoice
- 🛵 **Pickup & Delivery** — assign driver, tracking realtime, route management
- 👤 **Customer Management** — tier loyalty (Silver/Gold/Platinum), poin reward
- 💳 **Multi Payment** — Cash, QRIS, Transfer, E-Wallet, split payment
- 💬 **WhatsApp Automation** — auto-reply, broadcast, AI-suggested replies
- 📦 **Inventory** — stok detergent/parfum, low-stock alert
- 📈 **Reports & Analytics** — omzet, profit, jam tersibuk, top services
- 🏢 **Multi Cabang** — manajemen multi outlet dalam satu tenant
- 🎨 **3D Interactive Icons** — illustrated SVG icons dengan tilt &amp; animation

## Tech Stack

| Layer       | Tech                                  |
| ----------- | ------------------------------------- |
| Framework   | Next.js 14 (App Router) + TypeScript  |
| Database    | Turso (libSQL) — SQLite di edge       |
| ORM         | Drizzle ORM                           |
| Styling     | Tailwind CSS                          |
| Charts      | Recharts                              |
| Icons       | Lucide React + custom 3D SVG          |

## Lisensi

Proprietary — internal LaundryHub product.
