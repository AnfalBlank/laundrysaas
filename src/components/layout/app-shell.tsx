import { ReactNode } from "react";
import { db } from "@/db/client";
import { tenants, branches, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth";
import { AppShellClient } from "./app-shell-client";

async function getTenantInfo() {
  try {
    const tenantId = getCurrentTenantId();
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(branches)
      .where(and(eq(branches.tenantId, tenantId), eq(branches.isActive, true)));

    return {
      name: tenant?.name ?? "LaundryHub",
      branchCount: Number(count ?? 0),
      primaryColor: tenant?.primaryColor ?? "#2563eb",
      logoUrl: tenant?.logoUrl ?? null,
      messagingChannel: (tenant?.messagingChannel ?? "whatsapp") as "whatsapp" | "telegram",
    };
  } catch {
    return {
      name: "LaundryHub",
      branchCount: 0,
      primaryColor: "#2563eb",
      logoUrl: null,
      messagingChannel: "whatsapp" as const,
    };
  }
}

async function listAllUsers() {
  try {
    const tenantId = getCurrentTenantId();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branchName: branches.name,
      })
      .from(users)
      .leftJoin(branches, eq(users.branchId, branches.id))
      .where(and(eq(users.tenantId, tenantId), eq(users.isActive, true)));
  } catch {
    return [];
  }
}

export async function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [tenantInfo, currentUser, allUsers] = await Promise.all([
    getTenantInfo(),
    getCurrentUser(),
    listAllUsers(),
  ]);

  return (
    <AppShellClient
      title={title}
      subtitle={subtitle}
      tenant={tenantInfo}
      currentUser={currentUser}
      allUsers={allUsers}
    >
      {children}
    </AppShellClient>
  );
}
