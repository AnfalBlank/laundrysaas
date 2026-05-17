# Troubleshooting

Solusi untuk masalah umum saat development dan production.

## Development Issues

### `TURSO_DATABASE_URL is not set`

**Cause**: `.env.local` tidak ter-load.

**Fix**:
```bash
# Pastikan file ada di lokasi yang benar
ls frontend/.env.local

# Restart dev server setelah edit env
Ctrl+C
npm run dev
```

### `LIBSQL_FETCH_ERROR` / Connection refused

**Cause**: Database tidak reachable.

**Fix**:
```bash
# Test connection
turso db shell laundryhub-dev

# Cek URL format (harus libsql://, bukan https://)
echo $TURSO_DATABASE_URL
# Should be: libsql://xxx.turso.io

# Cek token belum expired
turso db tokens list laundryhub-dev
```

### `db:push` fails

**Cause**: Schema conflict atau network issue.

**Fix**:
```bash
# Force push (destructive!)
npx drizzle-kit push --force

# Atau drop dan recreate (dev only)
turso db destroy laundryhub-dev
turso db create laundryhub-dev
npm run db:push
```

### `Module not found: @/...`

**Cause**: TypeScript path alias tidak ter-resolve.

**Fix**:
```bash
# Cek tsconfig.json
cat frontend/tsconfig.json | grep paths

# Should have:
# "paths": { "@/*": ["./src/*"] }

# Clear cache
rm -rf .next node_modules
npm install
```

### Port 3000 already in use

```bash
# Find process
lsof -i :3000

# Kill it
kill -9 [PID]

# Or use different port
npm run dev -- -p 3001
```

### Build fails: TypeScript errors

```bash
# Check errors
npx tsc --noEmit

# Common fixes:
# 1. Missing type imports
import type { Order } from "@/db/schema";

# 2. Async component not awaited
export default async function Page() {
  const data = await fetchData();  // ← must await
}

# 3. Server component using client hook
# Add "use client" at top of file
```

### Hydration mismatch

**Cause**: Server-rendered HTML doesn't match client.

**Common causes**:
- Date formatting (server timezone ≠ client)
- Random values
- Browser-only APIs in server component

**Fix**:
```tsx
// For dates: use consistent formatting
import { formatDate } from "@/lib/utils";  // uses Intl with fixed locale

// For browser-only: use useEffect
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### Sidebar not showing on desktop

**Cause**: `lg:translate-x-0` not applied.

**Check**:
```tsx
// sidebar.tsx should have:
className={cn(
  "fixed top-0 left-0 ...",
  open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
)}
```

**Also check**: main content has `lg:pl-64`:
```tsx
// app-shell.tsx
<main className="lg:pl-64 min-h-screen">
```

### Charts not rendering

**Cause**: Recharts needs browser environment.

**Fix**:
```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("./chart-component"),
  { ssr: false }
);
```

### `Invariant failed: Specifying a(n) yAxisId...`

**Cause**: `yAxisId` di `<Area>` tidak ada `<YAxis>` yang matching.

**Fix**: Remove `yAxisId` dari Area, atau tambahkan `<YAxis yAxisId="right" />`.

## Database Issues

### Seed fails: foreign key constraint

**Cause**: Insert order salah (child sebelum parent).

**Fix**: Pastikan urutan seed:
```
tenants → branches → users → customers → services → orders → order_items → payments
```

### Duplicate key error

**Cause**: Seed dijalankan 2x tanpa clear.

**Fix**: Seed sudah include clear di awal:
```typescript
await db.delete(payments);
await db.delete(pickups);
// ... in reverse dependency order
await db.delete(tenants);
```

### Query returns empty (data exists in DB)

**Cause**: `tenantId` filter tidak match.

**Debug**:
```typescript
// Temporarily log tenantId
console.log("Current tenant:", getCurrentTenantId());

// Check data in DB
const all = await db.select().from(orders);
console.log("All orders:", all.map(o => o.tenantId));
```

### Slow queries

**Debug**:
```typescript
const start = Date.now();
const result = await db.select()...;
console.log(`Query took ${Date.now() - start}ms`);
```

**Fix**:
- Add missing index
- Reduce columns selected
- Add limit
- Use parallel queries

### Schema drift (DB ≠ code)

**Cause**: Schema changed in code but not pushed.

**Fix**:
```bash
npm run db:push
```

**Check**:
```bash
npm run db:studio
# Browse tables to verify schema
```

## API Issues

### 500 Internal Server Error

**Debug**:
```bash
# Check server logs
npm run dev
# Look for error in terminal

# Or check Vercel logs in production
```

**Common causes**:
- Missing env variable
- DB connection failed
- Unhandled promise rejection

### 404 on API route

**Cause**: Route file not in correct location.

**Check**: File must be at `src/app/api/[route]/route.ts` with exported `GET`/`POST`/etc.

### CORS error

**Cause**: Cross-origin request blocked.

**Fix** (for external clients):
```typescript
// src/app/api/orders/route.ts
export async function GET(req: Request) {
  const res = NextResponse.json({ orders });
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}
```

Or via `next.config.mjs`:
```js
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE" },
      ],
    },
  ];
},
```

### API returns stale data

**Cause**: Next.js caching.

**Fix**:
```typescript
// Force fresh data
export const dynamic = "force-dynamic";
```

## UI Issues

### Tailwind classes not applying

**Cause**: Class not in content scan path, or purged.

**Fix**:
```js
// tailwind.config.ts
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
],
```

For dynamic classes:
```tsx
// ❌ Dynamic class (purged)
const color = "blue";
<div className={`bg-${color}-500`} />

// ✅ Full class name (not purged)
const colorClass = "bg-blue-500";
<div className={colorClass} />
```

### 3D icon not showing

**Cause**: SVG gradient ID conflict (multiple icons with same ID).

**Fix**: Each icon uses unique gradient ID prefix:
```tsx
// WashingMachine uses "wm-body"
// Detergent uses "dt-body"
// etc.
```

If still conflicting, add instance ID:
```tsx
const id = useId();
<linearGradient id={`wm-body-${id}`}>
```

### Sidebar scroll not working

**Cause**: `overflow-y-auto` not on nav element, or parent has `overflow: hidden`.

**Check**:
```tsx
// sidebar.tsx nav element should have:
<nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain ...">
```

**Also check**: Parent `<aside>` has `h-screen` and `flex flex-col`.

### Mobile layout broken

**Debug**:
1. Open Chrome DevTools → Toggle device toolbar
2. Test at 375px (iPhone SE), 768px (iPad), 1280px (desktop)
3. Check for overflow: `overflow-x: hidden` on body

**Common fixes**:
- Add `min-w-0` to flex children that truncate
- Use `truncate` class for long text
- Use `overflow-x-auto` for tables

### Animation not working

**Cause**: Animation class not in Tailwind config.

**Check** `tailwind.config.ts`:
```ts
animation: {
  float: "float 4s ease-in-out infinite",
  wiggle: "wiggle 2s ease-in-out infinite",
},
keyframes: {
  float: {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-8px)" },
  },
},
```

## Production Issues

### Deployment fails

**Check**:
```bash
# Build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint
```

### Environment variables not loaded in production

**Vercel**: Set in Dashboard → Settings → Environment Variables.

**Coolify**: Set in Application → Environment.

**Check**: Variable names must match exactly (case-sensitive).

### Database connection fails in production

**Check**:
- `TURSO_DATABASE_URL` points to production DB (not dev)
- `TURSO_AUTH_TOKEN` is production token
- Token not expired

```bash
# Test from local with production env
TURSO_DATABASE_URL=libsql://prod... TURSO_AUTH_TOKEN=... npm run db:studio
```

### Slow page loads in production

**Debug**:
1. Check Vercel Analytics → Slowest pages
2. Check DB query time via logs
3. Check Turso dashboard for slow queries

**Common fixes**:
- Add `export const revalidate = 60` for semi-static pages
- Add Redis cache for hot data
- Enable Turso edge replication

### Memory leak / high CPU

**Symptoms**: Server slows down over time, needs restart.

**Debug**:
```bash
# Check memory usage
docker stats laundryhub

# Check for unclosed connections
# Turso client should be singleton (already is in client.ts)
```

**Fix**: Ensure DB client is singleton:
```typescript
// src/db/client.ts
// ✅ Module-level singleton (already correct)
const client = createClient({ ... });
export const db = drizzle(client, { schema });
```

### WhatsApp messages not sending

**Check**:
1. Fonnte dashboard → Device status (must be Connected)
2. API key correct
3. Phone number format (628... not 08...)
4. Fonnte balance sufficient

**Test**:
```bash
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_TOKEN" \
  -F "target=628xxx" \
  -F "message=Test"
```

### Payment webhook not received

**Check**:
1. Webhook URL accessible from internet (not localhost)
2. HTTPS (Midtrans requires HTTPS)
3. Signature verification not failing
4. Check Midtrans dashboard → Notification logs

**Test locally**:
```bash
# Use ngrok
ngrok http 3000
# Set webhook URL to https://xxx.ngrok.io/api/payments/webhook
```

## Debugging Tools

### Drizzle Studio

```bash
npm run db:studio
# Opens https://local.drizzle.studio
# Browse tables, run queries
```

### Next.js Debug Mode

```bash
NODE_OPTIONS='--inspect' npm run dev
# Open chrome://inspect in Chrome
```

### Network Tab

Browser DevTools → Network:
- Filter by XHR/Fetch
- Check API response times
- Inspect request/response bodies

### React DevTools

Install browser extension:
- Check component tree
- Profile renders
- Inspect props/state

### Turso CLI

```bash
# Interactive SQL shell
turso db shell laundryhub-dev

# Run query
turso db shell laundryhub-dev "SELECT count(*) FROM orders"

# Export data
turso db dump laundryhub-dev > backup.db
```

## Getting Help

1. **Check this doc** first
2. **Check GitHub Issues** for known bugs
3. **Search error message** in Google / Stack Overflow
4. **Ask in Slack** `#laundryhub-dev`
5. **Create GitHub Issue** with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node version, browser)

## Selanjutnya

- [Contributing](./contributing.md)
- [Architecture](./architecture.md)
