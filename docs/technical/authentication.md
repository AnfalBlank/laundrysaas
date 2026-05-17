# Authentication

⚠️ **Status**: Authentication belum di-implement. Dokumen ini blueprint untuk implementasi production.

## Current State

Tenant hardcoded di `src/lib/tenant.ts`:

```typescript
export const DEFAULT_TENANT_ID = "tenant_laundrysukses";
```

Production butuh real auth dengan multi-user, multi-role, dan multi-tenant.

## Recommended Approach

**NextAuth.js (Auth.js) v5** dengan custom credentials provider.

### Why NextAuth?

✅ Battle-tested untuk Next.js  
✅ Built-in session management  
✅ Multiple providers (credentials, OAuth, magic link)  
✅ Middleware support  
✅ Active maintenance  

## Architecture

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │  POST /api/auth/login
       ▼
┌──────────────┐
│  NextAuth    │  → Validate credentials vs DB
│  /api/auth/* │  → Issue JWT + session cookie
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Middleware  │  → Check session di every request
│              │  → Inject user/tenant context
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Pages/APIs  │  → useSession() hook (client)
│              │  → auth() function (server)
└──────────────┘
```

## Setup (Production Roadmap)

### Step 1: Install

```bash
npm install next-auth@beta @auth/drizzle-adapter
npm install bcrypt
npm install -D @types/bcrypt
```

### Step 2: Auth Config

`src/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const { email, password } = creds as Record&lt;string, string&gt;;
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
          branchId: user.branchId,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.branchId = user.branchId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.tenantId = token.tenantId as string;
      session.user.role = token.role as string;
      session.user.branchId = token.branchId as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

### Step 3: API Route Handler

`src/app/api/auth/[...nextauth]/route.ts`:

```typescript
export { GET, POST } from "@/auth";
```

### Step 4: Update Tenant Resolver

```typescript
// src/lib/tenant.ts
import { auth } from "@/auth";

export async function getCurrentTenantId(): Promise&lt;string&gt; {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("Unauthenticated");
  }
  return session.user.tenantId;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}
```

⚠️ Note: This becomes `async`. Refactor repositories accordingly:

```typescript
export async function listOrders() {
  const tenantId = await getCurrentTenantId();
  return db.select().from(orders).where(eq(orders.tenantId, tenantId));
}
```

### Step 5: Middleware

`src/middleware.ts`:

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/track"];
  const isPublic = publicRoutes.some((p) => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  // API routes (return 401)
  if (pathname.startsWith("/api")) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protected pages (redirect to login)
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Step 6: Login Page Form

`src/app/login/page.tsx`:

```typescript
"use client";

import { signIn } from "next-auth/react";

async function handleLogin(formData: FormData) {
  const res = await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirect: false,
  });

  if (res?.error) {
    setError("Invalid credentials");
    return;
  }

  router.push("/");
}
```

### Step 7: Logout

```tsx
import { signOut } from "next-auth/react";

<button onClick={() => signOut({ callbackUrl: "/login" })}>
  Logout
</button>
```

## Role-Based Access Control (RBAC)

### Define Permissions

```typescript
// src/lib/permissions.ts
export type Role = "owner" | "admin" | "staff" | "driver";
export type Permission = 
  | "orders:read" | "orders:create" | "orders:update" | "orders:delete"
  | "customers:read" | "customers:create"
  | "settings:read" | "settings:update"
  | "reports:read"
  | "users:manage";

const rolePermissions: Record&lt;Role, Permission[]&gt; = {
  owner: ["*"], // All permissions
  admin: [
    "orders:read", "orders:create", "orders:update",
    "customers:read", "customers:create",
    "reports:read",
  ],
  staff: ["orders:read", "orders:update"],
  driver: ["orders:read"], // Pickup-related
};

export function hasPermission(role: Role, perm: Permission): boolean {
  const perms = rolePermissions[role];
  return perms.includes("*" as Permission) || perms.includes(perm);
}
```

### Server-side Check

```typescript
// API route
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user.role, "orders:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // ... handle
}
```

### Client-side Check

```tsx
import { useSession } from "next-auth/react";

const { data: session } = useSession();

{session?.user?.role === "owner" && (
  <Button>Delete</Button>
)}
```

### Higher-Order Component

```tsx
// src/components/auth/require-role.tsx
"use client";
import { useSession } from "next-auth/react";

export function RequireRole({ 
  role, 
  children, 
  fallback 
}: {
  role: Role | Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  
  const allowed = Array.isArray(role) 
    ? role.includes(userRole as Role)
    : userRole === role;

  if (!allowed) return fallback ?? null;
  return &lt;&gt;{children}&lt;/&gt;;
}

// Usage
<RequireRole role={["owner", "admin"]}>
  <SettingsLink />
</RequireRole>
```

## Password Security

### Hashing

```typescript
import bcrypt from "bcrypt";

const hash = await bcrypt.hash(plainPassword, 12);  // 12 rounds
const valid = await bcrypt.compare(plainPassword, hash);
```

### Policy

- Min 8 characters
- Mix of upper/lower/number/symbol
- Validate via Zod:

```typescript
const passwordSchema = z.string()
  .min(8)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain symbol");
```

### Force Change

```typescript
// Add column to users table
mustChangePassword: integer({ mode: "boolean" }).default(false),
passwordChangedAt: integer({ mode: "timestamp" }),
```

Force change setiap 90 hari:

```typescript
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
if (user.passwordChangedAt < ninetyDaysAgo) {
  // Redirect to force-change page
}
```

## 2FA (Two-Factor Authentication)

### TOTP (Authenticator App)

```bash
npm install speakeasy qrcode
```

```typescript
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// Generate secret untuk user
const secret = speakeasy.generateSecret({
  name: `LaundryHub (${user.email})`,
});

// Save secret.base32 to user.totpSecret
// Show QR to user
const qrCode = await QRCode.toDataURL(secret.otpauth_url);

// Verify token
const valid = speakeasy.totp.verify({
  secret: user.totpSecret,
  encoding: "base32",
  token: userInputToken,
  window: 2,
});
```

### Email/SMS OTP

Send 6-digit code via email atau SMS, expire setelah 5 menit.

```typescript
// Generate
const otp = Math.floor(100000 + Math.random() * 900000).toString();
await db.insert(otps).values({
  userId,
  code: otp,
  expiresAt: new Date(Date.now() + 5 * 60 * 1000),
});

// Send via Fonnte for SMS, Resend for email
await sendSMS(user.phone, `Your OTP: ${otp}`);

// Verify
const [match] = await db
  .select()
  .from(otps)
  .where(and(
    eq(otps.userId, userId),
    eq(otps.code, userInput),
    sql`expires_at > unixepoch()`
  ));
```

## Session Management

### View Active Sessions

```typescript
// In settings page
const sessions = await db
  .select()
  .from(sessions)
  .where(eq(sessions.userId, user.id));
```

### Revoke Session

```typescript
await db.delete(sessions).where(eq(sessions.id, sessionId));
```

### Force Logout All Devices

```typescript
await db.delete(sessions).where(eq(sessions.userId, user.id));
```

## Audit Log

Log every auth event:

```typescript
// Schema
export const authLogs = sqliteTable("auth_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action"), // "login", "logout", "password_change", "2fa_enable"
  ip: text("ip"),
  userAgent: text("user_agent"),
  success: integer({ mode: "boolean" }),
  timestamp: integer({ mode: "timestamp" }).default(sql`unixepoch()`),
});

// Log on every login attempt
await db.insert(authLogs).values({
  id: generateId("log"),
  userId: user?.id ?? null,
  action: "login",
  ip: req.headers.get("x-forwarded-for") ?? "",
  userAgent: req.headers.get("user-agent") ?? "",
  success: !!user,
});
```

## Forgot Password Flow

```
1. POST /api/auth/forgot-password { email }
2. Generate reset token (random + DB-stored, expire 1 hour)
3. Send email with link: /reset-password?token=xxx
4. User clicks link → form for new password
5. POST /api/auth/reset-password { token, password }
6. Validate token, update password, invalidate token
7. Auto-login or redirect to /login
```

## Security Checklist

- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] HTTPS enforced (HSTS header)
- [ ] CSRF protection (NextAuth handles)
- [ ] Rate limiting on login (max 5 attempts / 15 min)
- [ ] Account lockout after N failed attempts
- [ ] Email verification untuk new accounts
- [ ] Strong password policy enforced
- [ ] 2FA option available
- [ ] Session timeout (60 min idle)
- [ ] Secure session cookies (httpOnly, sameSite, secure)
- [ ] Audit log untuk sensitive actions
- [ ] Logout invalidates session server-side
- [ ] No sensitive data in localStorage / sessionStorage

## Selanjutnya

- [Multi-Tenant](./multi-tenant.md)
- [Security](./security.md)
