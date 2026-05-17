import { NextResponse } from "next/server";
import { listWhatsappTemplates } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const templates = await listWhatsappTemplates();
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("WhatsApp API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
