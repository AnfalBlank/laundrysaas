import { NextResponse } from "next/server";
import { listOrders } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const orders = await listOrders({ status, limit: 100 });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders API error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
