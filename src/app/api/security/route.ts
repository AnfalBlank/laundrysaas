import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tenantSecuritySettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";
import { requireRole } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    const tenantId = getCurrentTenantId();
    const [settings] = await db
      .select()
      .from(tenantSecuritySettings)
      .where(eq(tenantSecuritySettings.tenantId, tenantId))
      .limit(1);

    if (!settings) {
      // Initialize with defaults
      await db.insert(tenantSecuritySettings).values({ tenantId });
      const [created] = await db
        .select()
        .from(tenantSecuritySettings)
        .where(eq(tenantSecuritySettings.tenantId, tenantId))
        .limit(1);
      return NextResponse.json({ settings: created });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    const tenantId = getCurrentTenantId();
    const body = await req.json();

    const allowed: Record<string, unknown> = { updatedAt: new Date() };
    if (body.twoFactorEnabled !== undefined) allowed.twoFactorEnabled = body.twoFactorEnabled;
    if (body.auditLogEnabled !== undefined) allowed.auditLogEnabled = body.auditLogEnabled;
    if (body.ipWhitelistEnabled !== undefined)
      allowed.ipWhitelistEnabled = body.ipWhitelistEnabled;
    if (body.sessionTimeoutEnabled !== undefined)
      allowed.sessionTimeoutEnabled = body.sessionTimeoutEnabled;
    if (body.sessionTimeoutMinutes !== undefined)
      allowed.sessionTimeoutMinutes = body.sessionTimeoutMinutes;
    if (body.ipWhitelist !== undefined) allowed.ipWhitelist = body.ipWhitelist;

    // Try update first; if not exist, insert
    const result = await db
      .update(tenantSecuritySettings)
      .set(allowed as never)
      .where(eq(tenantSecuritySettings.tenantId, tenantId));

    // Drizzle returns rowsAffected — if 0, insert instead
    // Simpler: just upsert manually
    const [existing] = await db
      .select({ tenantId: tenantSecuritySettings.tenantId })
      .from(tenantSecuritySettings)
      .where(eq(tenantSecuritySettings.tenantId, tenantId))
      .limit(1);

    if (!existing) {
      await db.insert(tenantSecuritySettings).values({ tenantId, ...allowed } as never);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
