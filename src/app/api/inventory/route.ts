import { NextResponse } from "next/server";
import { listInventory } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const inventory = await listInventory();
    return NextResponse.json({ inventory });
  } catch (err) {
    console.error("Inventory API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
