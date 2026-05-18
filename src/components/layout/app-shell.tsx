import { ReactNode } from "react";
import { db } from "@/db/client";
import { tenants, branches } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";
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
    };
  } catch {
    return {
      name: "LaundryHub",
      branchCount: 0,
      primaryColor: "#2563eb",
      logoUrl: null,
    };
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
  const tenantInfo = await getTenantInfo();
  return (
    <AppShellClient title={title} subtitle={subtitle} tenant={tenantInfo}>
      {children}
    </AppShellClient>
  );
}
