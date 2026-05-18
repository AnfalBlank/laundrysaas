import "server-only";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { users, branches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "./tenant";
import type { AuthUser, Role } from "./auth-types";

export type { AuthUser, Role } from "./auth-types";
export { ROLE_LABELS } from "./auth-types";

const DEMO_USER_COOKIE = "lh_user";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const tenantId = getCurrentTenantId();
    const userId = cookies().get(DEMO_USER_COOKIE)?.value;

    let user;
    if (userId) {
      [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          branchId: users.branchId,
          branchName: branches.name,
          tenantId: users.tenantId,
        })
        .from(users)
        .leftJoin(branches, eq(users.branchId, branches.id))
        .where(eq(users.id, userId))
        .limit(1);
    }

    if (!user) {
      [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          branchId: users.branchId,
          branchName: branches.name,
          tenantId: users.tenantId,
        })
        .from(users)
        .leftJoin(branches, eq(users.branchId, branches.id))
        .where(eq(users.tenantId, tenantId))
        .limit(1);
    }

    if (!user) return null;
    return user as AuthUser;
  } catch {
    return null;
  }
}

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  owner: ["*"],
  admin: [
    "orders:*",
    "customers:*",
    "payments:*",
    "pickups:*",
    "services:read",
    "inventory:read",
    "inventory:adjust",
    "reports:read",
    "whatsapp:*",
    "marketing:read",
    "expenses:read",
    "expenses:create",
  ],
  staff: ["orders:read", "orders:update_status", "inventory:read", "inventory:adjust"],
  driver: ["pickups:read", "pickups:update_status", "orders:read"],
};

export function hasPermission(role: Role, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms.includes("*")) return true;
  if (perms.includes(permission)) return true;
  const [resource] = permission.split(":");
  if (perms.includes(`${resource}:*`)) return true;
  return false;
}

export function canAccessPage(role: Role, path: string): boolean {
  const ROLE_PAGES: Record<Role, string[]> = {
    owner: ["*"],
    admin: [
      "/",
      "/orders",
      "/pickup",
      "/customers",
      "/services",
      "/payments",
      "/inventory",
      "/whatsapp",
      "/marketing",
      "/notifications",
      "/track",
      "/purchase-orders",
    ],
    staff: ["/", "/orders", "/inventory", "/notifications"],
    driver: ["/", "/pickup", "/orders", "/notifications"],
  };

  const allowed = ROLE_PAGES[role];
  if (allowed.includes("*")) return true;
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}
