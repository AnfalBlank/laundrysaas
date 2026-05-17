# Installation Guide

Setup development environment dari nol.

## Prerequisites

| Tool        | Min Version | Install                                                   |
| ----------- | ----------- | --------------------------------------------------------- |
| Node.js     | 20.0+       | [nodejs.org](https://nodejs.org)                          |
| npm / pnpm  | 10.0+       | bundled dengan Node                                       |
| Git         | 2.30+       | [git-scm.com](https://git-scm.com)                        |
| Turso CLI   | latest      | `curl -sSfL https://get.tur.so/install.sh \| bash`        |

Optional:
- VS Code dengan ekstensi: ESLint, Prettier, Tailwind CSS IntelliSense
- TablePlus / Drizzle Studio untuk DB browsing

## Step 1: Clone Repository

```bash
git clone https://github.com/your-org/laundryhub.git
cd laundryhub/frontend
```

## Step 2: Install Dependencies

```bash
npm install
```

Akan install:
- next, react, react-dom
- drizzle-orm, @libsql/client
- tailwindcss, recharts, lucide-react
- typescript, eslint
- (lihat package.json untuk full list)

## Step 3: Setup Turso Database

### Option A: Pakai existing database (development shared)

Bila sudah ada database team:
1. Minta `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` ke admin
2. Skip ke Step 4

### Option B: Create database baru (untuk dev pribadi)

```bash
# Login Turso (sekali aja)
turso auth login

# Create database
turso db create laundryhub-dev

# Get URL
turso db show laundryhub-dev --url
# Output: libsql://laundryhub-dev-[xxx].turso.io

# Create auth token
turso db tokens create laundryhub-dev
# Output: eyJhbGc...
```

## Step 4: Konfigurasi Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

⚠️ **Penting**: `.env.local` sudah di-gitignore. Jangan commit kredensial.

## Step 5: Push Schema &amp; Seed

```bash
# Push schema ke Turso (create tables)
npm run db:push

# Output:
# [✓] Pulling schema from database...
# [✓] Changes applied

# Seed demo data
npm run db:seed

# Output:
# 🧹 Clearing existing data...
# 🌱 Seeding tenants...
# 🏠 Seeding branches...
# ...
# ✅ Seeding complete!
```

⚠️ **Penting**: `db:seed` clear semua data dulu. Hati-hati di production database!

## Step 6: Run Development Server

```bash
npm run dev
```

Output:
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 1.5s
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Verify Installation

✅ Dashboard menampilkan stats dengan angka (bukan 0 semua)  
✅ Klik **Orders** — list 8 order muncul  
✅ Klik **Customers** — 8 customer muncul  
✅ Klik **Settings** — semua tab loadable  
✅ Test tracking page: `http://localhost:3000/track/INV-20240517-001`

Bila semua OK, installation sukses.

## Troubleshooting

### Error: `TURSO_DATABASE_URL is not set`

`.env.local` tidak ter-load. Pastikan:
- File ada di `frontend/.env.local` (bukan root)
- Dev server di-restart setelah edit env (Ctrl+C, lalu `npm run dev` lagi)

### Error: `LIBSQL_FETCH_ERROR`

Database tidak reachable. Cek:
- Internet connection
- `TURSO_DATABASE_URL` correct
- `TURSO_AUTH_TOKEN` belum expired

Test connection:
```bash
turso db shell laundryhub-dev
# Should open SQL prompt
```

### Error: `db:push` gagal

```bash
# Try with force
npx drizzle-kit push --force

# Atau drop semua dan recreate
turso db destroy laundryhub-dev
turso db create laundryhub-dev
# Update env, then push lagi
```

### Error: `Module not found`

```bash
# Clear cache + reinstall
rm -rf node_modules .next package-lock.json
npm install
```

### Port 3000 sudah dipakai

```bash
# Run di port lain
npm run dev -- -p 3001
```

### Build error after install

```bash
# Clean build
rm -rf .next
npm run build
```

## IDE Setup

### VS Code

Recommended `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

Recommended extensions (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "yoavbls.pretty-ts-errors"
  ]
}
```

### Drizzle Studio (Database Browser)

```bash
npm run db:studio
```

Buka [https://local.drizzle.studio](https://local.drizzle.studio) — UI untuk browse &amp; edit data.

## Selanjutnya

- [Database Schema](./database-schema.md) — pahami data model
- [Frontend Guide](./frontend-guide.md) — Next.js patterns
- [Contributing](./contributing.md) — git workflow
