import { NextResponse } from "next/server";
import {
  getPurchaseOrderDetail,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} from "@/db/repositories";
import { requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requirePermission("purchase_orders:read");
  if (guard instanceof NextResponse) return guard;
  try {
    const po = await getPurchaseOrderDetail(params.id);
    if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ po });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requirePermission("purchase_orders:update");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (body.action === "receive") {
      await receivePurchaseOrder(params.id);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "cancel") {
      await cancelPurchaseOrder(params.id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
