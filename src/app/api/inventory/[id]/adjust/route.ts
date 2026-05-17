import { NextResponse } from "next/server";
import { adjustInventoryStock } from "@/db/repositories";

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
    const result = await adjustInventoryStock({
      inventoryId: params.id,
      delta: body.delta,
      reason: body.reason ?? "manual",
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
