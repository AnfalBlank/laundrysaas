import { NextResponse } from "next/server";
import { listChatConversations } from "@/db/repositories";
import { requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("whatsapp:read");
  if (guard instanceof NextResponse) return guard;
  try {
    const conversations = await listChatConversations();
    return NextResponse.json({ conversations });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
