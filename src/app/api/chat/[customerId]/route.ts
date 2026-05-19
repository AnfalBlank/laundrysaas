import { NextResponse } from "next/server";
import {
  getChatThread,
  sendChatMessage,
  markCustomerMessagesRead,
} from "@/db/repositories";
import { requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { customerId: string } }
) {
  const guard = await requirePermission("whatsapp:read");
  if (guard instanceof NextResponse) return guard;
  try {
    const messages = await getChatThread(params.customerId);
    // Mark as read when viewed
    await markCustomerMessagesRead(params.customerId);
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { customerId: string } }
) {
  const guard = await requirePermission("whatsapp:create");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (!body.body) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }
    const result = await sendChatMessage({
      customerId: params.customerId,
      body: body.body,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
