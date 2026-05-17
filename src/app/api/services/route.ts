import { NextResponse } from "next/server";
import { listServices } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await listServices();
    return NextResponse.json({ services });
  } catch (err) {
    console.error("Services API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
