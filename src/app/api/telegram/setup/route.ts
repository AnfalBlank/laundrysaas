import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/setup
 * Registers the webhook URL with Telegram Bot API.
 * Must be called after deploying to a public HTTPS URL.
 */
export async function POST(req: Request) {
  try {
    const tenantId = getCurrentTenantId();
    const [tenant] = await db
      .select({ telegramBotToken: tenants.telegramBotToken })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant?.telegramBotToken) {
      return NextResponse.json(
        { error: "Telegram bot token belum dikonfigurasi. Atur di Settings → Messaging." },
        { status: 400 }
      );
    }

    // Determine webhook URL from request origin or body
    const body = await req.json().catch(() => ({}));
    let webhookUrl = body.webhookUrl;

    if (!webhookUrl) {
      // Auto-detect from request headers
      const host = req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      if (host) {
        webhookUrl = `${proto}://${host}/api/telegram/webhook`;
      }
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Tidak bisa menentukan webhook URL. Kirim { webhookUrl: 'https://...' } di body." },
        { status: 400 }
      );
    }

    // Register webhook with Telegram
    const res = await fetch(
      `https://api.telegram.org/bot${tenant.telegramBotToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "edited_message"],
        }),
      }
    );

    const data = await res.json();

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook berhasil di-register!",
        webhookUrl,
        telegramResponse: data,
      });
    }

    return NextResponse.json(
      {
        error: "Gagal register webhook ke Telegram",
        telegramResponse: data,
      },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * GET /api/telegram/setup
 * Check current webhook status.
 */
export async function GET() {
  try {
    const tenantId = getCurrentTenantId();
    const [tenant] = await db
      .select({ telegramBotToken: tenants.telegramBotToken })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant?.telegramBotToken) {
      return NextResponse.json({ configured: false, error: "Bot token not set" });
    }

    const res = await fetch(
      `https://api.telegram.org/bot${tenant.telegramBotToken}/getWebhookInfo`
    );
    const data = await res.json();

    return NextResponse.json({
      configured: true,
      webhookInfo: data.result,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
