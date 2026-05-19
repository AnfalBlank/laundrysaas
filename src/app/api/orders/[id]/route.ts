import { NextResponse } from "next/server";
import { updateOrderStatus, cancelOrder } from "@/db/repositories";
import { requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Allow staff to update status (production board), admin/owner everything
  const guard = await requirePermission("orders:update_status");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (body.status) {
      await updateOrderStatus(params.id, body.status);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requirePermission("orders:delete");
  if (guard instanceof NextResponse) return guard;
  try {
    await cancelOrder(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
