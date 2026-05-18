import { NextResponse } from "next/server";
import { adjustInventoryStockWithMovement } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    if (typeof body.delta !== "number") {
      return NextResponse.json({ error: "delta required" }, { status: 400 });
    }
    const result = await adjustInventoryStockWithMovement({
      inventoryId: params.id,
      delta: body.delta,
      reason: body.reason ?? "manual",
      unitCost: body.unitCost,
      reference: body.reference,
      notes: body.notes,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
