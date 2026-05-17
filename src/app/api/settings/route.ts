import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tenantId = getCurrentTenantId();
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }
    return NextResponse.json({ tenant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const tenantId = getCurrentTenantId();
    const body = await req.json();

    // Only allow updating specific fields
    const allowed: Record<string, unknown> = {};
    if (body.name !== undefined) allowed.name = body.name;
    if (body.subdomain !== undefined) allowed.subdomain = body.subdomain;
    if (body.customDomain !== undefined) allowed.customDomain = body.customDomain;
    if (body.logoUrl !== undefined) allowed.logoUrl = body.logoUrl;
    if (body.primaryColor !== undefined) allowed.primaryColor = body.primaryColor;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await db
      .update(tenants)
      .set(allowed as never)
      .where(eq(tenants.id, tenantId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
