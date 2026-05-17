# Contributing Guide

Panduan untuk kontributor — git workflow, code style, dan PR process.

## Getting Started

1. Fork repo (bila external contributor) atau clone (internal)
2. Follow [Installation Guide](./installation.md)
3. Create branch dari `main`
4. Make changes
5. Push &amp; create PR

## Branch Naming

```
[type]/[description]

Types:
- feature/    : new feature
- fix/        : bug fix
- refactor/   : code improvement, no behavior change
- docs/       : documentation only
- chore/      : tooling, deps, config
```

Examples:
- `feature/order-bulk-print`
- `fix/sidebar-scroll-issue`
- `refactor/orders-repository`
- `docs/api-reference-update`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

### Examples

```
feat(orders): add bulk export to Excel
fix(sidebar): scroll position lost on navigation
refactor(repositories): extract common tenant filter
docs(api): document POST /api/orders endpoint
chore(deps): bump next to 14.2.6
```

### Types

| Type      | When to use                                       |
| --------- | ------------------------------------------------- |
| `feat`    | New feature                                       |
| `fix`     | Bug fix                                           |
| `docs`    | Documentation only                                |
| `style`   | Formatting, no code change                        |
| `refactor`| Code restructure, no behavior change              |
| `perf`    | Performance improvement                           |
| `test`    | Adding/updating tests                             |
| `chore`   | Build, deps, tooling                              |
| `revert`  | Revert previous commit                            |

### Breaking Change

Add `!` after type, atau footer `BREAKING CHANGE:`:

```
feat(api)!: change orders endpoint response shape

BREAKING CHANGE: orders endpoint now returns { data, meta }
instead of plain array.
```

## Code Style

### TypeScript

```typescript
// ✅ Use const for non-reassigned vars
const orders = await listOrders();

// ✅ Explicit types for function signatures
export function calculateTotal(items: OrderItem[]): number { ... }

// ✅ Type imports
import type { Order } from "@/db/schema";

// ❌ Avoid `any`
function process(data: any) { ... }  // Bad
function process(data: unknown) { ... }  // Better

// ✅ Discriminated unions over enums
type Status = "scheduled" | "ongoing" | "completed";

// ❌ Avoid magic strings
if (status === "WASHING") ...  // Use const or enum
```

### React

```tsx
// ✅ Function components
export function OrderCard({ order }: { order: Order }) { ... }

// ❌ Class components (don't use unless absolutely needed)

// ✅ Default to server components
// Add "use client" only when needed

// ✅ Inline destructuring
function Component({ order: { id, total } }) { ... }

// ✅ Stable callbacks with useCallback (heavy lists)
const handleClick = useCallback(() => { ... }, [deps]);
```

### File Conventions

- Components: PascalCase exports, kebab-case files
  - `orders-view.tsx` exports `OrdersView`
- Utilities: camelCase
  - `formatCurrency.ts` exports `formatCurrency`
- Types: PascalCase
  - `interface OrderItem`, `type Status`

### Imports Order

```typescript
// 1. External libs
import { useState } from "react";
import { z } from "zod";

// 2. Internal absolute
import { db } from "@/db/client";
import { Button } from "@/components/ui/button";

// 3. Internal relative
import { OrderForm } from "./order-form";

// 4. Types (separated bila banyak)
import type { Order } from "@/db/schema";

// 5. Styles
import "./styles.css";
```

### Tailwind Classes

Use `cn()` for conditional:

```tsx
import { cn } from "@/lib/utils";

className={cn(
  "rounded-2xl bg-white p-5",
  isActive && "ring-2 ring-primary-500",
  variant === "danger" && "border-red-300",
  className
)}
```

Order classes (recommended):
1. Layout (display, position, top/right/etc)
2. Box (margin, padding, width, height)
3. Typography
4. Visual (background, border, shadow)
5. Interactive (hover, focus)
6. Responsive (sm:, md:, lg:)

## Testing (Coming Soon)

Currently no test framework setup. Planned:

- Unit: Vitest
- Component: React Testing Library
- E2E: Playwright

Once setup, every PR should include relevant tests.

## Pull Request

### Before Opening PR

- [ ] Build passes locally: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No lint errors: `npm run lint`
- [ ] Self-review your diff
- [ ] Update docs if API changed

### PR Title

Same format as commit message:
```
feat(orders): add bulk export to Excel
```

### PR Description

Use template:

```markdown
## What
Brief description of change.

## Why
Context, problem being solved.

## How
Approach summary, key decisions.

## Screenshots (UI changes)

[before] | [after]

## Testing
- [ ] Tested locally
- [ ] Added tests
- [ ] Verified responsive design (mobile/tablet/desktop)

## Breaking Changes
None / List them

## Checklist
- [ ] Self-reviewed
- [ ] Updated docs
- [ ] No console.log left
```

### Code Review

#### Reviewer responsibility

- Check logic correctness
- Verify multi-tenant safety (`tenantId` filter)
- Check accessibility
- Verify responsive design
- Suggest improvements

#### Author responsibility

- Respond to all comments
- Don't take feedback personally
- Update PR with changes
- Re-request review when ready

### Merging

1. Get at least 1 approval
2. All CI checks pass
3. Squash &amp; merge (preferred for clean history)
4. Delete branch after merge

## Release Process

### Versioning

Follow [SemVer](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Update di `package.json`

### Release Steps

```bash
# 1. Update version
npm version minor  # or major / patch

# 2. Update CHANGELOG.md
# Document what changed (use conventional commits as basis)

# 3. Push tag
git push --follow-tags

# 4. Deploy (auto via Vercel) or trigger manual

# 5. Create GitHub Release with changelog
```

### Hotfix

For production bug:
```
fix/hotfix-XXXX
```

Cherry-pick to release branch, deploy ASAP.

## Dependency Updates

### Check outdated

```bash
npm outdated
```

### Update minor / patch

```bash
npm update
```

### Update major (careful)

```bash
npm install package@latest
```

Run full test suite before commit.

### Security audit

```bash
npm audit
npm audit fix  # auto-fix non-breaking
```

## Documentation

When changing code, update:

- [ ] Inline comments untuk non-obvious logic
- [ ] JSDoc untuk exported functions
- [ ] Relevant `docs/technical/*.md` 
- [ ] README features list
- [ ] CHANGELOG.md

JSDoc example:

```typescript
/**
 * List orders for current tenant.
 *
 * @param opts.status - Filter by status, or "ALL" for all statuses
 * @param opts.limit - Max items to return (default 100)
 * @returns Orders with customer and branch info joined
 */
export async function listOrders(opts?: { status?: string; limit?: number }) {
  ...
}
```

## Adding New Page

1. Create file `src/app/[route]/page.tsx`
2. Add link to sidebar `components/layout/sidebar.tsx`
3. Add route to manual `docs/manual/[route].md`
4. Update `docs/technical/api-reference.md` bila ada API baru
5. Test responsive (mobile/tablet/desktop)
6. PR

## Adding New Database Table

1. Add to `src/db/schema.ts`
2. Add type exports (`Tenant = typeof tenants.$inferSelect`)
3. Run `npm run db:push` (dev) or `npm run db:generate` (prod migration)
4. Add seed data to `seed.ts` if needed
5. Add repository functions
6. Add API route if needed
7. Update `docs/technical/database-schema.md`

## Adding New 3D Icon

1. Open `src/components/ui/laundry-icons.tsx`
2. Append new component (lihat [Icon System](./icon-system.md))
3. Use in pages
4. Update icon list di `docs/technical/icon-system.md`

## Code Review Anti-patterns

❌ **Forget tenantId filter**
```typescript
// BAD - leaks data across tenants!
db.select().from(orders).where(eq(orders.status, "WASHING"));

// GOOD
db.select().from(orders).where(and(
  eq(orders.tenantId, getCurrentTenantId()),
  eq(orders.status, "WASHING"),
));
```

❌ **Hardcoded values**
```typescript
// BAD
if (status === "WASHING") ...
const limit = 100;

// GOOD
import { OrderStatus } from "@/lib/dummy-data";
if (status === OrderStatus.WASHING) ...
const DEFAULT_LIMIT = 100;
```

❌ **No loading state**
```tsx
// BAD - jarring UX
const data = await fetch(...);
return <div>{data.x}</div>;

// GOOD
{loading ? <Skeleton /> : <div>{data.x}</div>}
```

❌ **Inline complex logic in JSX**
```tsx
// BAD
{orders.filter(o => o.status === "X" && o.total > 1000).map(...)}

// GOOD
const filtered = useMemo(() => 
  orders.filter(o => o.status === "X" && o.total > 1000),
  [orders]
);
{filtered.map(...)}
```

❌ **Pass tenantId from client**
```typescript
// BAD - security risk
const { tenantId } = await req.json();

// GOOD - server-side resolution
const tenantId = getCurrentTenantId();
```

## Questions?

- Internal team: Slack channel `#laundryhub-dev`
- External: GitHub Discussions / Issues

## Selanjutnya

- [Architecture](./architecture.md)
- [Testing](./testing.md)
