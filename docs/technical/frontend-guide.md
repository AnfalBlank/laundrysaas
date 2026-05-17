# Frontend Guide

Next.js 14 patterns dan komponen UI yang digunakan di LaundryHub.

## Component Categories

### Layout components (`src/components/layout/`)

- **`AppShell`** — wrapper untuk authenticated pages, includes sidebar + topbar
- **`Sidebar`** — fixed nav drawer (mobile slide-in, desktop sticky)
- **`Topbar`** — header dengan title, search, notifications, profile

### UI primitives (`src/components/ui/`)

Reusable building blocks:

- **`Button`** — 5 variants (primary, secondary, ghost, outline, danger), 4 sizes
- **`Card`** — container dengan `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
- **`Input`** — text input dengan focus ring
- **`Badge`** — 7 color variants
- **`Icon3D`** — 3D glassmorphism container untuk icons
- **`laundry-icons.tsx`** — 30+ custom 3D SVG illustrations

### Feature components

- **`dashboard/*`** — widgets: StatCard, RevenueChartCard, ServicePieCard, RecentOrdersCard, dll
- **`orders/orders-view.tsx`** — interactive order list dengan filter
- **`customers/customers-view.tsx`** — customer grid dengan tier filter
- **`whatsapp/whatsapp-view.tsx`** — chat preview + AI suggestions
- **`reports/reports-charts.tsx`** — analytics charts

## Server vs Client Components

### Default: Server Component

Pages default-nya server component. Bisa langsung `await` query:

```tsx
// app/orders/page.tsx (Server Component)
import { listOrders } from "@/db/repositories";

export default async function OrdersPage() {
  const orders = await listOrders();
  return <OrdersView initialOrders={orders} />;
}
```

✅ Pros: less JS to client, faster TTFB, better SEO  
✅ Direct DB access, no API call needed  
❌ No useState, useEffect, event handlers  

### When to use "use client"

Only when needed:
- `useState` / `useReducer`
- `useEffect`
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, etc)
- Custom hooks dengan state

```tsx
// components/orders/orders-view.tsx
"use client";

import { useState } from "react";

export function OrdersView({ initialOrders }) {
  const [filter, setFilter] = useState("ALL");
  return ...
}
```

### Hybrid Pattern

Server fetch → Client interactivity:

```tsx
// page.tsx (Server)
export default async function Page() {
  const data = await fetchData();
  return <ClientView data={data} />;  // pass via props
}

// client-view.tsx (Client)
"use client";
export function ClientView({ data }) {
  const [filter, setFilter] = useState("ALL");
  // ... interactive UI
}
```

## File Naming

| Type             | Convention            | Example                         |
| ---------------- | --------------------- | ------------------------------- |
| Pages            | `page.tsx`            | `app/orders/page.tsx`           |
| Layouts          | `layout.tsx`          | `app/layout.tsx`                |
| Components       | `kebab-case.tsx`      | `customers-view.tsx`            |
| API routes       | `route.ts`            | `app/api/orders/route.ts`       |
| Utility funcs    | `kebab-case.ts`       | `tenant.ts`, `utils.ts`         |
| Types            | inline atau `types.ts`| —                               |

## Styling

### Tailwind utilities

```tsx
<div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition">
```

### Class composition with `cn()`

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-2xl p-5",
  isActive && "ring-2 ring-primary-500",
  className
)} />
```

### Variants with `cva`

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white",
        secondary: "bg-white border",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface Props extends VariantProps<typeof buttonVariants> {}
```

## Forms

Currently menggunakan native React forms. Pattern:

```tsx
"use client";

import { useState } from "react";

export function OrderForm() {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      // success
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Button type="submit" disabled={submitting}>
        Submit
      </Button>
    </form>
  );
}
```

🔜 Future: react-hook-form + zod validation untuk forms kompleks.

## Data Fetching

### Server Component (preferred)

```tsx
// Inside async server component
const data = await listOrders();
```

### Client Component dengan fetch

```tsx
"use client";

import { useEffect, useState } from "react";

export function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <Skeleton />;
  return <div>{...}</div>;
}
```

🔜 Future: SWR atau TanStack Query untuk caching, revalidation, optimistic updates.

## Routing

### File-based routing

```
app/
├── page.tsx                  → /
├── orders/
│   ├── page.tsx              → /orders
│   └── [id]/
│       └── page.tsx          → /orders/:id
└── track/
    └── [invoice]/
        └── page.tsx          → /track/:invoice
```

### Navigation

```tsx
import Link from "next/link";
import { useRouter } from "next/navigation";

// Server-rendered link (preferred)
<Link href="/orders">Orders</Link>

// Programmatic
const router = useRouter();
router.push("/orders");
```

### Dynamic Params

```tsx
// app/track/[invoice]/page.tsx
export default function Page({ params }: { params: { invoice: string } }) {
  const inv = decodeURIComponent(params.invoice);
  return ...
}
```

## Loading States

### `loading.tsx`

Otomatis ditampilkan saat sibling page loading:

```tsx
// app/orders/loading.tsx
export default function Loading() {
  return <div className="p-8 animate-pulse">Loading orders...</div>;
}
```

### `<Suspense>` boundary

Untuk granular loading:

```tsx
import { Suspense } from "react";

<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

## Error Handling

### `error.tsx`

```tsx
// app/orders/error.tsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### `not-found.tsx`

```tsx
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return <Link href="/">Back to home</Link>;
}
```

## Responsive Design

### Mobile-first breakpoints

```
Default: 0px+
sm:      640px+
md:      768px+
lg:      1024px+    ← sidebar shows
xl:      1280px+
2xl:     1536px+
```

### Common pattern

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* 2 cols on mobile, 4 on desktop */}
</div>

<div className="flex flex-col sm:flex-row gap-3">
  {/* stack on mobile, row on desktop */}
</div>

<button className="hidden lg:inline-flex">
  {/* hidden on mobile */}
</button>
```

### Mobile sidebar

Sidebar menggunakan transform:
```tsx
className={cn(
  "fixed top-0 left-0 z-50 w-[280px] lg:w-64 h-screen",
  "transition-transform duration-300",
  open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
)}
```

Mobile: drawer slide-in. Desktop: always visible (still `fixed`).

Main content offset: `<main className="lg:pl-64">`.

## Animations

### CSS keyframes (di `tailwind.config.ts`)

```ts
animation: {
  float: "float 4s ease-in-out infinite",
  wiggle: "wiggle 2s ease-in-out infinite",
}
```

Usage:
```tsx
<div className="animate-float">...</div>
```

### Transition

```tsx
<div className="transition-all duration-300 hover:scale-105">
```

### Tilt 3D effect

Custom CSS di `globals.css`:

```css
.tilt-card {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
}
.tilt-card:hover {
  transform: perspective(1000px) rotateX(4deg) rotateY(-4deg) translateY(-4px);
}
```

## Performance

### Code splitting

Otomatis per route. Untuk component besar:

```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./Chart"), {
  loading: () => <Skeleton />,
  ssr: false,  // chart libraries kadang butuh client-only
});
```

### Image optimization

```tsx
import Image from "next/image";

<Image src="/logo.png" alt="Logo" width={100} height={40} />
```

### Font optimization

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

<html className={inter.variable}>
```

## Accessibility

✅ Semua interactive elements punya `aria-label` bila tidak ada visible text  
✅ Modal/dropdown trap focus  
✅ Keyboard navigation works  
✅ Color contrast WCAG AA (test di Lighthouse)  
✅ Form fields dengan `<label>`  

🔜 TODO: Full accessibility audit (axe-core, manual testing dengan screen reader).

## SEO

```tsx
// app/layout.tsx atau app/page.tsx
export const metadata = {
  title: "LaundryHub — Modern Laundry ERP",
  description: "Platform ERP Laundry...",
  openGraph: { ... },
};
```

## Selanjutnya

- [Icon System](./icon-system.md)
- [Backend Guide](./backend-guide.md)
