import { NextResponse } from "next/server";
import { listOrders, createOrder } from "@/db/repositories";
import { requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await requirePermission("orders:read");
  if (guard instanceof NextResponse) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const orders = await listOrders({ status, limit: 100 });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requirePermission("orders:create");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (!body.serviceId || !body.qty) {
      return NextResponse.json({ error: "serviceId and qty required" }, { status: 400 });
    }
    if (!body.customerId && !body.customerPhone) {
      return NextResponse.json({ error: "Customer info required" }, { status: 400 });
    }
    const result = await createOrder(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Orders POST error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
