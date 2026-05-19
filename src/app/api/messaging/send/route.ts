import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";
import { sendMessage } from "@/lib/messaging";

export const dynamic = "force-dynamic";

/**
 * Generic send endpoint for testing or manual broadcast.
 * POST { to: string, text: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.to || !body.text) {
      return NextResponse.json({ error: "to and text required" }, { status: 400 });
    }

    const tenantId = getCurrentTenantId();
    const [tenant] = await db
      .select({
        messagingChannel: tenants.messagingChannel,
        whatsappToken: tenants.whatsappToken,
        telegramBotToken: tenants.telegramBotToken,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const channel = tenant.messagingChannel as "whatsapp" | "telegram";
    const result = await sendMessage({
      to: body.to,
      text: body.text,
      channel,
      whatsappToken: tenant.whatsappToken ?? undefined,
      telegramBotToken: tenant.telegramBotToken ?? undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
