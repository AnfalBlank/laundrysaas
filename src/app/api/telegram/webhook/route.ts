import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/**
 * Telegram Bot Webhook — receives incoming messages from Telegram.
 * Telegram sends POST requests here when users message the bot.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Extract message data from Telegram update
    const message = body.message || body.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || "Customer";

    // Get tenant's bot token
    const tenantId = getCurrentTenantId();
    const [tenant] = await db
      .select({
        telegramBotToken: tenants.telegramBotToken,
        name: tenants.name,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant?.telegramBotToken) {
      return NextResponse.json({ ok: true });
    }

    // Simple auto-reply logic
    const reply = generateReply(text, firstName, tenant.name || "LaundryHub");

    // Send reply via Telegram Bot API
    await fetch(
      `https://api.telegram.org/bot${tenant.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
          parse_mode: "HTML",
        }),
      }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

/**
 * GET — health check / webhook info
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    description: "Telegram Bot Webhook for LaundryHub",
  });
}

/**
 * Simple AI-like auto-reply based on keywords.
 */
function generateReply(text: string, name: string, businessName: string): string {
  const lower = text.toLowerCase();

  // /start command
  if (lower === "/start") {
    return (
      `Halo ${name}! 👋\n\n` +
      `Selamat datang di <b>${businessName}</b>.\n\n` +
      `Saya bot otomatis yang siap membantu:\n` +
      `• Cek harga layanan → ketik <b>harga</b>\n` +
      `• Cek status order → ketik <b>status [nomor invoice]</b>\n` +
      `• Mau pickup → ketik <b>pickup</b>\n` +
      `• Jam operasional → ketik <b>jam</b>\n` +
      `• Bicara dengan admin → ketik <b>admin</b>\n\n` +
      `Silakan ketik pesan Anda 😊`
    );
  }

  // Price inquiry
  if (lower.includes("harga") || lower.includes("price") || lower.includes("tarif")) {
    return (
      `💰 <b>Daftar Harga ${businessName}</b>\n\n` +
      `• Cuci Setrika — Rp 7.000/kg\n` +
      `• Cuci Kering — Rp 5.000/kg\n` +
      `• Setrika Saja — Rp 4.000/kg\n` +
      `• Express (1 hari) — Rp 12.000/kg\n` +
      `• Sepatu — Rp 35.000/pasang\n` +
      `• Karpet — Rp 25.000/m²\n` +
      `• Bed Cover — Rp 30.000/pcs\n\n` +
      `Mau order? Ketik <b>pickup</b> untuk dijemput 🛵`
    );
  }

  // Status check
  if (lower.includes("status") || lower.includes("cek") || lower.includes("inv-")) {
    return (
      `📋 Untuk cek status order, silakan kirim nomor invoice Anda.\n` +
      `Format: <b>INV-YYYYMMDD-XXX</b>\n\n` +
      `Atau buka link tracking:\nhttps://laundryhub.id/track/[invoice]`
    );
  }

  // Pickup request
  if (lower.includes("pickup") || lower.includes("jemput") || lower.includes("ambil")) {
    return (
      `🛵 <b>Request Pickup</b>\n\n` +
      `Untuk dijemput, mohon kirim info:\n` +
      `1. Alamat lengkap\n` +
      `2. Jam yang diinginkan\n` +
      `3. Estimasi berat (kg)\n\n` +
      `Contoh:\n` +
      `<i>Jl. Sudirman 12, jam 4 sore, sekitar 5 kg</i>\n\n` +
      `Admin kami akan konfirmasi dalam 5 menit.`
    );
  }

  // Operating hours
  if (lower.includes("jam") || lower.includes("buka") || lower.includes("tutup") || lower.includes("operasional")) {
    return (
      `🕐 <b>Jam Operasional ${businessName}</b>\n\n` +
      `Senin - Sabtu: 07:00 - 21:00\n` +
      `Minggu: 08:00 - 17:00\n\n` +
      `Pickup tersedia setiap hari 08:00 - 20:00 🛵`
    );
  }

  // Talk to admin
  if (lower.includes("admin") || lower.includes("manusia") || lower.includes("cs") || lower.includes("help")) {
    return (
      `👤 Baik, saya akan hubungkan Anda dengan admin.\n\n` +
      `Mohon tunggu sebentar, admin kami akan membalas dalam beberapa menit.\n\n` +
      `Atau hubungi langsung:\n📞 +62 812-1234-5678`
    );
  }

  // Thank you
  if (lower.includes("terima kasih") || lower.includes("thanks") || lower.includes("makasih")) {
    return `Sama-sama ${name}! 😊 Ada yang bisa dibantu lagi?`;
  }

  // Default response
  return (
    `Halo ${name}! Terima kasih sudah menghubungi <b>${businessName}</b>.\n\n` +
    `Saya belum mengerti pesan Anda. Coba ketik:\n` +
    `• <b>harga</b> — lihat daftar harga\n` +
    `• <b>pickup</b> — request jemput\n` +
    `• <b>status</b> — cek order\n` +
    `• <b>jam</b> — jam operasional\n` +
    `• <b>admin</b> — bicara dengan admin`
  );
}
