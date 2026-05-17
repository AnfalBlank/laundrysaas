# Deployment Guide

Panduan deploy LaundryHub ke production.

## Hosting Options

### Option 1: Vercel (Easiest)

✅ Zero-config Next.js  
✅ Free tier generous  
✅ Auto SSL, CDN, preview deploys  
✅ Edge runtime support  
❌ Vendor lock-in (function timeout, pricing scaling)  

### Option 2: Coolify / Dokploy (Self-hosted)

✅ Full control, cheap (VPS)  
✅ Docker-based  
✅ Built-in DB &amp; storage  
❌ Need to manage server  

### Option 3: Direct VPS (Manual Docker)

✅ Maximum control  
❌ Most setup work  

Pilih sesuai team capability dan scale.

## Pre-deployment Checklist

- [ ] Production Turso database created
- [ ] All env variables ready (TURSO_*, JWT_SECRET, payment keys)
- [ ] Domain ready (DNS managed)
- [ ] SSL strategy decided
- [ ] Backup strategy defined
- [ ] Monitoring setup planned

## Option 1: Vercel Deploy

### Step 1: Push code ke GitHub

```bash
cd LaundrySaas
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:your-org/laundryhub.git
git push -u origin main
```

### Step 2: Connect Vercel

1. Login [vercel.com](https://vercel.com)
2. **Import Project** → pilih repo
3. **Root directory**: `frontend`
4. Build command: `npm run build` (default)
5. Install command: `npm install` (default)

### Step 3: Environment Variables

Di Vercel Dashboard → Settings → Environment Variables:

| Variable                 | Value                                        |
| ------------------------ | -------------------------------------------- |
| `TURSO_DATABASE_URL`     | `libsql://prod.turso.io`                     |
| `TURSO_AUTH_TOKEN`       | (production token)                           |
| `JWT_SECRET`             | (random string min 32 chars)                 |
| `OPENAI_API_KEY`         | sk-...                                       |
| `FONNTE_API_KEY`         | (Fonnte token)                               |
| `MIDTRANS_SERVER_KEY`    | Mid-server-...                               |

### Step 4: Custom Domain

Vercel → Settings → Domains:
- Add `laundryhub.id` (apex)
- Add `*.laundryhub.id` (wildcard)
- Vercel auto-issue SSL

DNS records di registrar:

```
A     @           76.76.21.21
A     *           76.76.21.21
CNAME www         cname.vercel-dns.com
```

### Step 5: Deploy

Push ke main → auto-deploy. Preview URL untuk PR.

### Step 6: Push Schema &amp; Seed

Once deployed:

```bash
# Local terminal, dengan .env.local pointing ke production DB
npm run db:push
# Be careful with seed in production!
```

⚠️ **Penting**: Jangan run `db:seed` di production unless first-time setup. Akan delete semua data!

## Option 2: Coolify (Self-hosted)

### Step 1: Provision Server

Recommended specs:
- 4 vCPU
- 8 GB RAM
- 80 GB SSD
- Ubuntu 24.04 LTS

Provider: DigitalOcean, Hetzner, Vultr, Contabo (cheap).

### Step 2: Install Coolify

```bash
ssh root@your-server-ip
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Wait ~5 menit. Akses: `https://your-server-ip:8000`. Setup admin account.

### Step 3: Add Project

1. **+ New Resource → Application**
2. **Source**: GitHub (connect via OAuth)
3. **Repository**: your-org/laundryhub
4. **Build Pack**: Docker (auto-detected)
5. **Build path**: `/frontend`

### Step 4: Dockerfile

Buat `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

Update `next.config.mjs`:

```js
const nextConfig = {
  output: "standalone",  // ← add this
  // ... rest
};
```

### Step 5: Environment Variables

Coolify → Application → Environment:

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
NODE_ENV=production
```

### Step 6: Deploy

Klik **Deploy**. Coolify build &amp; deploy.

### Step 7: Domain &amp; SSL

Coolify → Application → Domain:
- Add `laundryhub.id`
- Toggle **Automatic SSL** (Let's Encrypt)

DNS:
```
A     @         your-server-ip
A     *         your-server-ip
```

## Option 3: Manual Docker

```bash
# Build
docker build -t laundryhub:latest -f frontend/Dockerfile frontend/

# Run
docker run -d \
  --name laundryhub \
  -p 3000:3000 \
  -e TURSO_DATABASE_URL=libsql://... \
  -e TURSO_AUTH_TOKEN=... \
  --restart unless-stopped \
  laundryhub:latest
```

### Reverse Proxy with Nginx

```nginx
# /etc/nginx/sites-available/laundryhub
server {
    listen 80;
    server_name *.laundryhub.id laundryhub.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name *.laundryhub.id laundryhub.id;

    ssl_certificate /etc/letsencrypt/live/laundryhub.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/laundryhub.id/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activate:
```bash
sudo ln -s /etc/nginx/sites-available/laundryhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Wildcard

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d "*.laundryhub.id" -d "laundryhub.id" \
  --agree-tos --email admin@laundryhub.id
```

Follow DNS challenge instructions.

## Production Database Setup

### 1. Create Turso Database

```bash
turso db create laundryhub-prod --location sin  # Singapore for SE Asia
turso db show laundryhub-prod --url
turso db tokens create laundryhub-prod
```

### 2. Replicate to Multiple Regions

```bash
turso db replicate laundryhub-prod --location sjc  # San Jose
turso db replicate laundryhub-prod --location fra  # Frankfurt
```

Reads otomatis serve dari nearest region.

### 3. Push Schema

```bash
# Set env to production
export TURSO_DATABASE_URL=libsql://prod...
export TURSO_AUTH_TOKEN=prod-token

cd frontend
npx drizzle-kit push
```

### 4. Initial Tenant

Don't run `db:seed` (akan hapus data). Buat tenant manual:

```bash
turso db shell laundryhub-prod
```

```sql
INSERT INTO tenants (id, name, subdomain, plan, created_at)
VALUES ('tenant_first', 'First Customer', 'firstcust', 'pro', unixepoch());
```

Atau via UI signup flow setelah deploy.

## Monitoring

### Vercel built-in

- Analytics tab — page views, top pages
- Logs tab — runtime errors
- Speed Insights — Core Web Vitals

### Coolify built-in

- Logs streaming
- Resource graphs (CPU, RAM, network)
- Health checks

### Third-party (Recommended)

| Tool             | Purpose                          | Free tier?      |
| ---------------- | -------------------------------- | --------------- |
| Sentry           | Error tracking                   | Yes, 5K events  |
| BetterStack      | Uptime monitoring + log mgmt     | Yes             |
| Plausible        | Privacy-friendly analytics       | $9/month        |
| Posthog          | Product analytics                | Yes, 1M events  |

### Health Endpoint

Add `/api/health`:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.run(sql`select 1`);
    return NextResponse.json({ status: "ok", timestamp: new Date() });
  } catch (err) {
    return NextResponse.json({ status: "error", err: String(err) }, { status: 503 });
  }
}
```

Configure uptime monitor: ping `/api/health` every minute.

## Backup

### Turso Auto-Backup

Built-in point-in-time recovery untuk Pro plan Turso. Up to 30 days history.

```bash
turso db backups list laundryhub-prod
turso db restore laundryhub-prod --from-timestamp 2026-05-17T10:00:00
```

### Manual Backup

```bash
# Dump to SQLite file
turso db dump laundryhub-prod > backup-$(date +%Y%m%d).db
```

Schedule daily via cron:

```bash
# crontab -e
0 2 * * * cd /backups && turso db dump laundryhub-prod > backup-$(date +\%Y\%m\%d).db
```

Upload ke S3/R2 untuk redundancy.

## Scaling

### Horizontal Scale (Multiple Instances)

Vercel: auto-scaling.  
Coolify/Docker: configure replicas + load balancer.

```bash
docker-compose up -d --scale app=3
```

### Database Scale

Turso replicas automatic. Reads scale linearly.

For writes, single primary region (Turso eventual consistency).

### Caching Layer

Add Redis:

```bash
# Coolify → Add Resource → Redis
# Or self-hosted via docker-compose
```

In code:

```typescript
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

// Cache hot data
const cached = await redis.get(`services:${tenantId}`);
if (cached) return JSON.parse(cached);
```

## Rollback Strategy

### Vercel

Promote previous deployment:
1. Deployments tab
2. Pilih previous deploy
3. **Promote to Production**

Instant rollback (zero downtime).

### Coolify

```bash
# Coolify auto-keep last 3 deployments
# Click "Rollback to previous"
```

### Database Rollback

⚠️ **Penting**: Schema migrations harus reversible. Jika tidak:
- Backup pre-migration
- Restore manual via `turso db restore`

## Disaster Recovery Plan

### Scenario: Database lost

1. Restore from Turso backup
2. Or restore from S3 dump
3. Update env DATABASE_URL bila pindah instance
4. Test critical paths
5. Notify customers

### Scenario: Server down

1. Failover to backup region
2. Update DNS (low TTL recommended: 60s)
3. Wait propagation
4. Investigate primary issue

### Scenario: Domain hijacked

1. Contact registrar immediately
2. Lock domain transfer
3. Restore DNS
4. Notify customers via WhatsApp/email backup channel

## Performance Tuning

### Next.js

```js
// next.config.mjs
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};
```

### Database

- Use indexes (already done)
- Avoid `SELECT *`, specify columns
- Batch operations
- Use transactions for multi-step writes

### CDN

Vercel: built-in.  
Self-hosted: add Cloudflare in front:

```
Internet → Cloudflare → Your Server
```

Setup di Cloudflare: orange cloud icon = proxied through Cloudflare CDN.

## Security Production

- [ ] Enable 2FA for all admin accounts
- [ ] Rotate API keys quarterly
- [ ] Enable rate limiting (planned)
- [ ] Setup CORS properly
- [ ] Use HTTPS only (HSTS header)
- [ ] Regular security audits
- [ ] Pen-test at least once before public launch

## Selanjutnya

- [Performance &amp; Caching](./performance.md)
- [Security](./security.md)
