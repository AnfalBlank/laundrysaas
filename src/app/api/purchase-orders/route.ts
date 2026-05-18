import { NextResponse } from "next/server";
import { listPurchaseOrders, createPurchaseOrder } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const purchaseOrders = await listPurchaseOrders({ status, limit: 100 });
    return NextResponse.json({ purchaseOrders });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Items required (array)" },
        { status: 400 }
      );
    }
    const result = await createPurchaseOrder(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
