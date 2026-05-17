# Testing Guide

Strategy testing untuk LaundryHub — unit, integration, dan end-to-end.

## Status

⚠️ **Testing belum di-setup**. Dokumen ini blueprint untuk implementasi.

## Testing Pyramid

```
         ┌─────────────┐
         │   E2E (5%)  │  Playwright — critical user flows
         ├─────────────┤
         │Integration  │  Vitest — API routes, repositories
         │   (25%)     │
         ├─────────────┤
         │  Unit (70%) │  Vitest — utils, helpers, pure functions
         └─────────────┘
```

## Setup

### Install

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
npm install -D playwright @playwright/test
```

### Vitest Config

`vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules", ".next", "src/__tests__"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Test Setup

`src/__tests__/setup.ts`:

```typescript
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock DB (use in-memory SQLite for tests)
vi.mock("@/db/client", () => ({
  db: createTestDb(),
}));
```

### Test Database

```typescript
// src/__tests__/test-db.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

export function createTestDb() {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });
  return db;
}

export async function setupTestDb(db: ReturnType<typeof createTestDb>) {
  // Push schema
  await db.run(sql`CREATE TABLE IF NOT EXISTS tenants (...)`);
  // ... all tables
}

export async function seedTestData(db, tenantId = "test_tenant") {
  await db.insert(schema.tenants).values({
    id: tenantId,
    name: "Test Laundry",
    subdomain: "test",
    plan: "pro",
  });
  // ... more seed data
}
```

## Unit Tests

### Utils

`src/__tests__/unit/utils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats IDR correctly", () => {
    expect(formatCurrency(36000)).toBe("Rp 36.000");
    expect(formatCurrency(1500000)).toBe("Rp 1.500.000");
    expect(formatCurrency(0)).toBe("Rp 0");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-5000)).toBe("-Rp 5.000");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b")).toBe("a");
    expect(cn("px-4", "px-2")).toBe("px-2"); // tailwind-merge
  });
});
```

### Repositories

`src/__tests__/unit/repositories.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, seedTestData } from "../test-db";
import { listOrders, getOrderStats } from "@/db/repositories";

const TENANT_A = "tenant_a";
const TENANT_B = "tenant_b";

describe("listOrders", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(async () => {
    db = createTestDb();
    await setupTestDb(db);
    await seedTestData(db, TENANT_A);
    await seedTestData(db, TENANT_B);
  });

  it("only returns orders for current tenant", async () => {
    mockTenant(TENANT_A);
    const orders = await listOrders();
    expect(orders.every((o) => o.tenantId === TENANT_A)).toBe(true);
  });

  it("filters by status", async () => {
    mockTenant(TENANT_A);
    const washing = await listOrders({ status: "WASHING" });
    expect(washing.every((o) => o.status === "WASHING")).toBe(true);
  });

  it("respects limit", async () => {
    mockTenant(TENANT_A);
    const limited = await listOrders({ limit: 2 });
    expect(limited.length).toBeLessThanOrEqual(2);
  });
});

describe("getOrderStats", () => {
  it("returns correct counts", async () => {
    mockTenant(TENANT_A);
    const stats = await getOrderStats();
    expect(stats).toMatchObject({
      ordersToday: expect.any(Number),
      revenueToday: expect.any(Number),
      activeOrders: expect.any(Number),
      pickupPending: expect.any(Number),
    });
  });
});
```

### Multi-Tenant Isolation Tests

`src/__tests__/unit/multi-tenant.test.ts`:

```typescript
describe("Multi-tenant isolation", () => {
  const tables = [
    { name: "orders", fn: listOrders },
    { name: "customers", fn: listCustomers },
    { name: "services", fn: listServices },
    { name: "inventory", fn: listInventory },
    { name: "pickups", fn: listPickups },
  ];

  tables.forEach(({ name, fn }) => {
    it(`${name}: only returns current tenant data`, async () => {
      // Create data for 2 tenants
      await createDataForTenant("tenant_a");
      await createDataForTenant("tenant_b");

      // Query as tenant_a
      mockTenant("tenant_a");
      const data = await fn();

      // All results should be tenant_a
      expect(data.every((d) => d.tenantId === "tenant_a")).toBe(true);
    });
  });
});
```

## Component Tests

### Button

`src/__tests__/components/button.test.tsx`:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disabled state", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant classes", () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    expect(container.firstChild).toHaveClass("from-red-500");
  });
});
```

### OrdersView

`src/__tests__/components/orders-view.test.tsx`:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { OrdersView } from "@/components/orders/orders-view";
import { mockOrders } from "../fixtures/orders";

describe("OrdersView", () => {
  it("renders order list", () => {
    render(<OrdersView initialOrders={mockOrders} />);
    expect(screen.getByText("INV-20240517-001")).toBeInTheDocument();
  });

  it("filters by status", () => {
    render(<OrdersView initialOrders={mockOrders} />);
    fireEvent.click(screen.getByText("Dicuci"));
    expect(screen.queryByText("INV-20240517-002")).not.toBeInTheDocument();
  });

  it("searches by customer name", () => {
    render(<OrdersView initialOrders={mockOrders} />);
    const search = screen.getByPlaceholderText("Cari nama, invoice...");
    fireEvent.change(search, { target: { value: "Andi" } });
    expect(screen.getByText("Andi Pratama")).toBeInTheDocument();
    expect(screen.queryByText("Siti Nurhaliza")).not.toBeInTheDocument();
  });

  it("shows empty state when no results", () => {
    render(<OrdersView initialOrders={mockOrders} />);
    const search = screen.getByPlaceholderText("Cari nama, invoice...");
    fireEvent.change(search, { target: { value: "ZZZZZ" } });
    expect(screen.getByText("Tidak ada order")).toBeInTheDocument();
  });
});
```

## API Route Tests

`src/__tests__/api/orders.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "@/app/api/orders/route";

describe("GET /api/orders", () => {
  it("returns orders list", async () => {
    const req = new Request("http://localhost/api/orders");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("orders");
    expect(Array.isArray(data.orders)).toBe(true);
  });

  it("filters by status", async () => {
    const req = new Request("http://localhost/api/orders?status=WASHING");
    const res = await GET(req);
    const data = await res.json();

    expect(data.orders.every((o: any) => o.status === "WASHING")).toBe(true);
  });

  it("returns 500 on DB error", async () => {
    vi.mocked(listOrders).mockRejectedValueOnce(new Error("DB error"));
    const req = new Request("http://localhost/api/orders");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
```

## Integration Tests

`src/__tests__/integration/order-flow.test.ts`:

```typescript
describe("Order creation flow", () => {
  it("creates order and updates customer stats", async () => {
    const customer = await createTestCustomer();
    const service = await createTestService();

    const order = await createOrder({
      customerId: customer.id,
      items: [{ serviceId: service.id, qty: 5 }],
    });

    expect(order.status).toBe("RECEIVED");
    expect(order.total).toBe(service.price * 5);

    // Customer stats updated
    const updated = await getCustomer(customer.id);
    expect(updated.totalOrders).toBe(1);
    expect(updated.totalSpending).toBe(order.total);
  });

  it("payment marks order as paid", async () => {
    const order = await createTestOrder({ paymentStatus: "unpaid" });

    await recordPayment({
      orderId: order.id,
      amount: order.total,
      method: "cash",
    });

    const updated = await getOrder(order.id);
    expect(updated.paymentStatus).toBe("paid");
  });
});
```

## E2E Tests (Playwright)

`playwright.config.ts`:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical User Flows

`e2e/order-flow.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Order Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[type="email"]', "owner@laundrysukses.id");
    await page.fill('[type="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
  });

  test("dashboard loads with stats", async ({ page }) => {
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Omzet Hari Ini")).toBeVisible();
    await expect(page.getByText("Order Hari Ini")).toBeVisible();
  });

  test("orders page shows list", async ({ page }) => {
    await page.click("text=Orders");
    await expect(page.getByText("INV-20240517-001")).toBeVisible();
  });

  test("filter orders by status", async ({ page }) => {
    await page.goto("/orders");
    await page.click("text=Dicuci");
    const rows = page.locator("tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("customer tracking page", async ({ page }) => {
    await page.goto("/track/INV-20240517-001");
    await expect(page.getByText("LaundryHub")).toBeVisible();
    await expect(page.getByText("INV-20240517-001")).toBeVisible();
  });
});
```

`e2e/customer-portal.spec.ts`:

```typescript
test("public tracking page accessible without login", async ({ page }) => {
  // No login
  await page.goto("/track/INV-20240517-001");
  await expect(page.getByText("LaundryHub")).toBeVisible();
  await expect(page.getByText("Timeline Proses")).toBeVisible();
});

test("invalid invoice shows 404", async ({ page }) => {
  await page.goto("/track/INVALID-INVOICE");
  await expect(page.getByText("404")).toBeVisible();
});
```

## Test Fixtures

`src/__tests__/fixtures/orders.ts`:

```typescript
import type { Order } from "@/db/schema";

export const mockOrders: Order[] = [
  {
    id: "ord_test1",
    tenantId: "tenant_test",
    branchId: "branch_test",
    customerId: "cst_test1",
    invoiceNumber: "INV-20240517-001",
    status: "WASHING",
    paymentStatus: "paid",
    pickupType: "pickup",
    isExpress: false,
    weight: 5.2,
    subtotal: 36000,
    discount: 0,
    total: 36000,
    createdAt: new Date("2026-05-17T08:30:00"),
    updatedAt: new Date("2026-05-17T08:30:00"),
    estimatedAt: new Date("2026-05-19T16:00:00"),
    completedAt: null,
    notes: null,
    pickupAddress: null,
    deliveryAddress: null,
  },
  // ... more
];
```

## Running Tests

```bash
# Unit + integration
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## CI/CD Integration

`.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install
        run: npm ci
        working-directory: frontend

      - name: Type check
        run: npx tsc --noEmit
        working-directory: frontend

      - name: Lint
        run: npm run lint
        working-directory: frontend

      - name: Unit tests
        run: npm run test
        working-directory: frontend
        env:
          TURSO_DATABASE_URL: ":memory:"

      - name: Build
        run: npm run build
        working-directory: frontend
        env:
          TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: frontend
      - run: npx playwright install --with-deps
        working-directory: frontend
      - run: npm run test:e2e
        working-directory: frontend
        env:
          TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL_STAGING }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN_STAGING }}
```

## Coverage Goals

| Layer          | Target Coverage |
| -------------- | --------------- |
| Utils          | 95%+            |
| Repositories   | 80%+            |
| API Routes     | 70%+            |
| Components     | 60%+            |
| E2E Flows      | Critical paths  |

## Selanjutnya

- [Contributing](./contributing.md)
- [Deployment](./deployment.md)
