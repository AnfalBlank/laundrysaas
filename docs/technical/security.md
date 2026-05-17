# Security

Best practices dan threat model untuk LaundryHub.

## Threat Model

### Assets to Protect

1. **Tenant data** — orders, customers, payments per tenant
2. **Customer PII** — nama, phone, address
3. **Payment data** — amounts, payment methods (no CC data stored)
4. **Authentication credentials** — passwords, API keys
5. **Business data** — pricing, revenue, analytics

### Threat Vectors

| Threat                             | Severity | Mitigation                              |
| ---------------------------------- | -------- | --------------------------------------- |
| Cross-tenant data leak             | Critical | `tenantId` filter, code review          |
| SQL injection                      | Critical | Drizzle parameterized queries           |
| XSS                                | High     | React auto-escape, CSP headers          |
| CSRF                               | Medium   | SameSite cookies, NextAuth CSRF token   |
| Session hijacking                  | High     | HTTPS, httpOnly cookies, short TTL      |
| Brute force login                  | Medium   | Rate limiting, account lockout          |
| Privilege escalation               | High     | Server-side permission check            |
| Data theft via API enumeration     | Medium   | Rate limiting, auth required            |
| Webhook replay attacks             | Medium   | Signature verification, idempotency     |
| Dependency vulnerabilities         | Medium   | `npm audit`, Dependabot                 |
| Compromised admin account          | Critical | 2FA mandatory for owner/admin           |

## Multi-Tenant Isolation

⚠️ **Critical**: Setiap query harus filter `tenantId`.

### Code Pattern

```typescript
// ✅ Always
const orders = await db
  .select()
  .from(orders)
  .where(and(
    eq(orders.tenantId, getCurrentTenantId()),  // ← REQUIRED
    eq(orders.status, "WASHING"),
  ));

// ❌ Never
const orders = await db.select().from(orders);  // Returns ALL tenants!
```

### Code Review Checklist

Setiap PR yang touch repository:

- [ ] Semua query include `eq(table.tenantId, getCurrentTenantId())`
- [ ] Untuk JOIN tables, filter di main table
- [ ] No hardcoded `tenantId` (use `getCurrentTenantId()`)
- [ ] No `tenantId` from client request body

### Test Coverage

```typescript
test("listOrders only returns current tenant data", async () => {
  // Setup 2 tenants
  await createTestTenant("tenant_a");
  await createTestTenant("tenant_b");
  await createOrderForTenant("tenant_a");
  await createOrderForTenant("tenant_b");

  // Mock tenant a
  mockTenant("tenant_a");
  
  const orders = await listOrders();
  expect(orders.every(o => o.tenantId === "tenant_a")).toBe(true);
});
```

## Authentication Security

### Password Hashing

```typescript
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(password, 12);
```

⚠️ Never store plaintext passwords.

### Password Policy

- Min 8 characters
- Mix upper / lower / number / symbol
- Validate via Zod
- Force change every 90 days
- Cannot reuse last 5 passwords

### Login Rate Limiting

```typescript
// Allow max 5 failed attempts per 15 min per IP
const attempts = await redis.incr(`login:${ip}`);
if (attempts === 1) await redis.expire(`login:${ip}`, 900);
if (attempts > 5) {
  return { error: "Too many attempts. Try again in 15 minutes." };
}
```

### Account Lockout

After 5 failed attempts: lock account 30 min.

```typescript
if (attempts >= 5) {
  await db.update(users).set({ lockedUntil: new Date(Date.now() + 30 * 60_000) });
}
```

### 2FA

Mandatory untuk role `owner` dan `admin` di production. Lihat [Authentication](./authentication.md#2fa).

### Session Management

- httpOnly cookies (no JS access)
- secure flag (HTTPS only)
- sameSite: "lax" or "strict"
- Short TTL (4 jam, refresh on activity)
- Idle timeout (60 min)

## Authorization

### RBAC

```typescript
const rolePermissions: Record&lt;Role, Permission[]&gt; = {
  owner: ["*"],
  admin: ["orders:*", "customers:*", "reports:read"],
  staff: ["orders:read", "orders:update"],
  driver: ["pickups:read", "pickups:update"],
};
```

### Server-side Enforcement

```typescript
// API route
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user.role, "orders:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // ...
}
```

⚠️ Never rely solely on client-side hide/show. Always check server-side.

## Input Validation

### Zod Validation

```typescript
import { z } from "zod";

const CreateOrderSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(
    z.object({
      serviceId: z.string(),
      qty: z.number().positive().max(1000),
    })
  ).min(1).max(20),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ 
      error: "Invalid input", 
      issues: parsed.error.issues 
    }, { status: 400 });
  }
  // parsed.data is fully typed
}
```

### Sanitization

For free-form text yang akan di-render sebagai HTML (rare):

```bash
npm install dompurify
```

```typescript
import DOMPurify from "isomorphic-dompurify";
const clean = DOMPurify.sanitize(userInput);
```

React auto-escapes by default — only worry bila pakai `dangerouslySetInnerHTML`.

## SQL Injection

### Drizzle = Safe

Drizzle pakai parameterized queries:

```typescript
// ✅ Safe (parameterized)
db.select().from(orders).where(eq(orders.invoice, userInput));
// → SQL: WHERE invoice = ?

// ⚠️ Risky (raw SQL)
db.run(sql`SELECT * FROM orders WHERE invoice = '${userInput}'`);
// → SQL injection!
```

For raw SQL, use `sql` template tag with proper interpolation:

```typescript
// ✅ Safe
db.run(sql`SELECT * FROM orders WHERE invoice = ${userInput}`);
// Drizzle handles parameterization
```

## XSS Protection

### Default

React escapes all values dalam JSX:

```tsx
<div>{userInput}</div>  // ✅ Safe, escaped
```

### Risk: dangerouslySetInnerHTML

```tsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ⚠️ Risky
```

Only use for trusted content (markdown rendering, etc) and sanitize first.

### Content Security Policy

`next.config.mjs`:

```js
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.midtrans.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' data: https:;
      font-src 'self' fonts.gstatic.com;
      connect-src 'self' https://api.fonnte.com https://api.midtrans.com;
    `.replace(/\s{2,}/g, " ").trim(),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
```

## CSRF Protection

NextAuth handles CSRF token automatically. Untuk custom forms:

```typescript
import { headers } from "next/headers";

export async function POST(req: Request) {
  const origin = headers().get("origin");
  const allowedOrigins = ["https://laundryhub.id", "https://app.laundrysukses.com"];
  
  if (!origin || !allowedOrigins.some(a => origin.startsWith(a))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // ...
}
```

## HTTPS

### Force HTTPS

Vercel: built-in.  
Self-hosted: Nginx redirect HTTP to HTTPS:

```nginx
server {
    listen 80;
    server_name laundryhub.id;
    return 301 https://$host$request_uri;
}
```

### HSTS Header

```js
{
  key: "Strict-Transport-Security",
  value: "max-age=63072000; includeSubDomains; preload",
}
```

Submit ke [hstspreload.org](https://hstspreload.org) untuk browser preload list.

## Secrets Management

### Never Commit Secrets

`.env.local`, `.env*` di-gitignore:

```gitignore
.env*
!.env.example
```

### Rotation

Quarterly rotation untuk:
- Database tokens
- API keys (Fonnte, Midtrans, OpenAI)
- JWT secret

Process:
1. Generate new secret
2. Add to env (both `.env.local` and production)
3. Deploy
4. Remove old secret from provider dashboard
5. Document rotation di security log

### Storage

Production:
- Vercel: Environment Variables (encrypted)
- Self-hosted: Use secret manager (Doppler, Infisical, Vault)
- ❌ Don't store di plain text on server

## Webhook Security

### Verify Signature

```typescript
// Midtrans webhook
const signature = crypto
  .createHash("sha512")
  .update(body.order_id + body.status_code + body.gross_amount + serverKey)
  .digest("hex");

if (signature !== body.signature_key) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
}
```

### Idempotency

```typescript
const exists = await db
  .select()
  .from(webhookEvents)
  .where(eq(webhookEvents.id, body.transaction_id));

if (exists.length > 0) {
  return NextResponse.json({ ok: true, duplicate: true });
}

// Process &amp; save event
```

## Rate Limiting

### Implementation (Upstash)

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),  // 60 req/min
});

// Apply in middleware
const ip = req.headers.get("x-forwarded-for") ?? "anon";
const { success, limit, remaining } = await ratelimit.limit(ip);

if (!success) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "X-RateLimit-Limit": String(limit) } }
  );
}
```

### Per-User Limits

```typescript
const userId = (await getCurrentUser())?.id ?? "anon";
await ratelimit.limit(`user:${userId}`);
```

## Logging &amp; Monitoring

### What to Log

✅ Authentication events (login, logout, password change)  
✅ Authorization failures  
✅ Sensitive actions (delete order, refund, change pricing)  
✅ API errors  
✅ Database errors  
✅ Webhook events  

❌ Don't log:
- Passwords
- Full credit card numbers
- API keys
- PII unless required

### Audit Log Table

```typescript
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id"),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  metadata: text("metadata"),  // JSON
  timestamp: integer({ mode: "timestamp" }).default(sql`unixepoch()`),
});
```

### Log Sensitive Actions

```typescript
async function deleteOrder(orderId: string) {
  await db.delete(orders).where(eq(orders.id, orderId));
  
  // Audit log
  await db.insert(auditLogs).values({
    id: generateId("log"),
    tenantId,
    userId: currentUser.id,
    action: "delete",
    resource: "order",
    resourceId: orderId,
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
  });
}
```

## Dependency Security

### Audit

```bash
npm audit
npm audit fix
```

Critical/High severity → fix immediately.

### Auto-update

Setup Dependabot (GitHub):

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### Snyk / Socket

For deeper analysis:
- [Snyk](https://snyk.io)
- [Socket.dev](https://socket.dev)

Free tiers cover most projects.

## Data Privacy

### PII Handling

- Don't log full PII (mask/redact)
- Don't store in client (localStorage)
- Encrypt at rest (Turso encrypted by default)
- Encrypt in transit (HTTPS)

### GDPR / UU PDP Compliance

Customer rights:
- **Access**: Export own data
- **Rectification**: Update own data
- **Erasure**: Delete account
- **Portability**: Export in standard format

Implement endpoints:

```
GET  /api/customers/me/export       → Download all data
DELETE /api/customers/me            → Delete account (anonymize)
```

### Data Retention

Set retention policy:
- Active orders: indefinite
- Cancelled orders: 7 years (tax compliance)
- Customer data: until customer deletes
- Logs: 90 days
- Backups: 30 days

## Incident Response

### Detect

- Monitoring alerts (Sentry, BetterStack)
- Audit log anomalies
- Customer reports

### Contain

1. Identify scope (which tenants/users affected?)
2. Isolate (disable affected accounts/features)
3. Preserve evidence (snapshot logs, DB)

### Eradicate

1. Patch vulnerability
2. Reset compromised credentials
3. Force logout affected users

### Recover

1. Restore from backup if needed
2. Verify integrity
3. Communicate with customers

### Lessons Learned

1. Postmortem
2. Update runbook
3. Add automated test untuk prevent recurrence

## Security Checklist (Pre-Launch)

### Application

- [ ] All secrets in env vars (not code)
- [ ] HTTPS enforced
- [ ] HSTS enabled
- [ ] CSP configured
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input validation (Zod)
- [ ] Authentication implemented
- [ ] Authorization checks server-side
- [ ] Audit logging
- [ ] Error messages don't leak info

### Database

- [ ] All queries filter tenantId
- [ ] Indexes on tenantId + commonly filtered columns
- [ ] Backup strategy
- [ ] Restore tested
- [ ] No public access (auth token required)

### Infrastructure

- [ ] DDoS protection (Cloudflare)
- [ ] WAF rules
- [ ] SSH keys only (no password auth)
- [ ] Firewall configured
- [ ] Auto-update OS security patches
- [ ] Monitoring configured
- [ ] Alerting set up

### Operational

- [ ] Incident response plan documented
- [ ] On-call rotation
- [ ] Runbook for common issues
- [ ] Pen-test scheduled (annually minimum)
- [ ] Security training for team

## Selanjutnya

- [Authentication](./authentication.md)
- [Multi-Tenant](./multi-tenant.md)
