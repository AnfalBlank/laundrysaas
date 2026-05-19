import { NextResponse } from "next/server";
import { markNotificationRead } from "@/db/repositories";
import { requireAuth } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  try {
    await markNotificationRead(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
