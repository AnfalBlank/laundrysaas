import { NextResponse } from "next/server";
import { listInventoryMovements } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inventoryId = searchParams.get("inventoryId") ?? undefined;
    const type = searchParams.get("type") as "in" | "out" | "adjustment" | null;
    const movements = await listInventoryMovements({
      inventoryId,
      type: type ?? undefined,
      limit: 100,
    });
    return NextResponse.json({ movements });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
