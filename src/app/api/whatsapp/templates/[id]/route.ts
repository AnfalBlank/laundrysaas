import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { whatsappTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = getCurrentTenantId();
    const body = await req.json();

    const allowed: Record<string, unknown> = {};
    if (body.isActive !== undefined) allowed.isActive = body.isActive;
    if (body.body !== undefined) allowed.body = body.body;
    if (body.name !== undefined) allowed.name = body.name;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await db
      .update(whatsappTemplates)
      .set(allowed as never)
      .where(
        and(
          eq(whatsappTemplates.id, params.id),
          eq(whatsappTemplates.tenantId, tenantId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
