# Technical Documentation

Dokumentasi teknis untuk developer, DevOps, dan integrator.

## Daftar Isi

1. [Architecture Overview](./architecture.md) — system design, tech stack
2. [Installation Guide](./installation.md) — setup development environment
3. [Database Schema](./database-schema.md) — 12 tables Drizzle schema
4. [API Reference](./api-reference.md) — REST endpoints
5. [Frontend Guide](./frontend-guide.md) — Next.js patterns, components
6. [Backend Guide](./backend-guide.md) — Drizzle ORM, repositories
7. [3D Icon System](./icon-system.md) — custom icon library
8. [Multi-Tenant Architecture](./multi-tenant.md) — SaaS isolation
9. [Authentication](./authentication.md) — auth flow (planned)
10. [WhatsApp Integration](./whatsapp-integration.md) — Fonnte/WAHA
11. [Payment Integration](./payment-integration.md) — Midtrans/Xendit
12. [Deployment Guide](./deployment.md) — production setup
13. [Performance &amp; Caching](./performance.md) — optimization
14. [Security](./security.md) — best practices
15. [Testing](./testing.md) — unit, integration, e2e
16. [Contributing](./contributing.md) — git workflow, code style
17. [Troubleshooting](./troubleshooting.md) — common dev issues

## Quick Reference

### Project Structure

```
LaundrySaas/
├── README.md                    # Root readme
├── CHANGELOG.md                 # Version history
├── prdlaundry.md                # Product Requirements Doc
├── docs/                        # All documentation
│   ├── manual/                  # User-facing manual
│   └── technical/               # Developer docs
└── frontend/                    # Next.js fullstack app
    ├── src/
    │   ├── app/                 # App Router pages + API routes
    │   ├── components/          # React components
    │   ├── db/                  # Drizzle schema, client, repos
    │   └── lib/                 # Utils, helpers
    ├── drizzle.config.ts
    ├── next.config.mjs
    ├── package.json
    └── tailwind.config.ts
```

### Stack

| Layer        | Tech                                    |
| ------------ | --------------------------------------- |
| Framework    | Next.js 14 (App Router) + TypeScript    |
| Database     | Turso (libSQL distributed SQLite)       |
| ORM          | Drizzle ORM                             |
| UI           | Tailwind CSS + custom 3D SVG icons      |
| Charts       | Recharts                                |
| Icons        | Lucide React + custom 3D                |

### Key Decisions

| Decision                       | Why                                                   |
| ------------------------------ | ----------------------------------------------------- |
| **Next.js App Router**         | Server components, edge runtime, RSC streaming        |
| **Turso (libSQL)**             | SQLite-as-a-service, cheap, fast, edge replication    |
| **Drizzle ORM**                | TypeScript-first, lightweight, SQL-like               |
| **Tailwind**                   | Utility-first, easy to customize                      |
| **Server Components default**  | Less client JS, better SEO, simpler data fetching     |
| **Multi-tenant via tenantId**  | Single DB, soft isolation (vs DB-per-tenant)          |

### Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Run production build

# Database
npm run db:push          # Push schema to Turso
npm run db:generate      # Generate migrations
npm run db:studio        # Open Drizzle Studio (DB browser)
npm run db:seed          # Seed demo data

# Code quality
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit (manual)
```

### Environment Variables

`.env.local` (lokal development):

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token

# Coming soon:
# JWT_SECRET=your-jwt-secret
# OPENAI_API_KEY=sk-...
# FONNTE_API_KEY=your-fonnte-key
# MIDTRANS_SERVER_KEY=...
```

`.env.production`:
- Same vars but production credentials
- Use platform secret manager (Vercel env, Coolify, etc)

## Reading Order

For new developers, read in this order:

1. [Architecture](./architecture.md) — big picture (15 min)
2. [Installation](./installation.md) — get it running locally (30 min)
3. [Database Schema](./database-schema.md) — understand data model (20 min)
4. [Frontend Guide](./frontend-guide.md) — Next.js patterns used (30 min)
5. [API Reference](./api-reference.md) — REST endpoints (15 min)
6. [Contributing](./contributing.md) — workflow (10 min)

Total: ~2 jam reading + hands-on.

## Architecture Diagram

```
                        ┌─────────────────────┐
                        │   Customer Portal   │
                        │  /track/[invoice]   │
                        │   (no auth, public) │
                        └──────────┬──────────┘
                                   │
            ┌──────────────────────┴──────────────────────┐
            │                                              │
┌───────────▼───────────┐                      ┌──────────▼──────────┐
│      Web App          │                      │    WhatsApp Bot     │
│   Next.js 14 App      │                      │  (Fonnte webhook)   │
│   Owner / Admin / Staff│                     │                     │
└───────────┬───────────┘                      └──────────┬──────────┘
            │                                              │
            └──────────────────────┬───────────────────────┘
                                   │
                         ┌─────────▼─────────┐
                         │    Next.js API    │
                         │   /api/* routes   │
                         │   Server Actions  │
                         └─────────┬─────────┘
                                   │
                         ┌─────────▼─────────┐
                         │   Drizzle ORM     │
                         │   Repositories    │
                         └─────────┬─────────┘
                                   │
                         ┌─────────▼─────────┐
                         │   Turso (libSQL)  │
                         │   12 tables       │
                         │   Multi-tenant    │
                         └───────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼─────┐  ┌────▼────┐  ┌─────▼──────┐
            │ Cloudflare  │  │ Fonnte  │  │  Midtrans  │
            │     R2      │  │   WA    │  │   QRIS     │
            │  (storage)  │  │         │  │            │
            └─────────────┘  └─────────┘  └────────────┘
```

## Versioning

Project mengikuti [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking change
- **MINOR** — new feature backward compatible
- **PATCH** — bug fix

Current version: see `package.json`.

## Selanjutnya

Mulai dari [Installation Guide](./installation.md).
