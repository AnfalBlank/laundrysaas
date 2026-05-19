import { NextResponse } from "next/server";
import { updateStaff, deleteStaff } from "@/db/repositories";
import { requireRole } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    await updateStaff(params.id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    await deleteStaff(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
