import { NextResponse } from "next/server";
import { listPickups, listDrivers } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [pickups, drivers] = await Promise.all([listPickups(), listDrivers()]);
    return NextResponse.json({ pickups, drivers });
  } catch (err) {
    console.error("Pickups API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
