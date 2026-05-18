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
 * Smart auto-reply based on intent detection.
 */
function generateReply(text: string, name: string, businessName: string): string {
  const lower = text.toLowerCase().trim();

  // /start command
  if (lower === "/start") {
    return (
      `Halo ${name}! 👋\n\n` +
      `Selamat datang di <b>${businessName}</b>.\n\n` +
      `Saya bot otomatis yang siap membantu:\n` +
      `• Cek harga layanan → ketik <b>harga</b>\n` +
      `• Cek status order → ketik <b>cek status</b>\n` +
      `• Mau pickup → ketik <b>pickup</b>\n` +
      `• Jam operasional → ketik <b>jam buka</b>\n` +
      `• Bicara dengan admin → ketik <b>admin</b>\n\n` +
      `Atau langsung ceritakan kebutuhan Anda 😊`
    );
  }

  // /help command
  if (lower === "/help" || lower === "help" || lower === "menu") {
    return (
      `📋 <b>Menu Bantuan</b>\n\n` +
      `• <b>harga</b> — daftar harga layanan\n` +
      `• <b>pickup</b> atau <b>jemput</b> — request pickup\n` +
      `• <b>cek status</b> — cek status order\n` +
      `• <b>jam buka</b> — jam operasional\n` +
      `• <b>admin</b> — bicara dengan admin\n\n` +
      `Atau ketik pesan bebas, saya coba bantu 😊`
    );
  }

  // Price inquiry
  if (lower.includes("harga") || lower.includes("price") || lower.includes("tarif") || lower.includes("berapa")) {
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
  if (lower.includes("status") || lower.includes("cek order") || lower.includes("inv-") || lower.includes("invoice")) {
    return (
      `📋 Untuk cek status order, silakan kirim nomor invoice Anda.\n` +
      `Format: <b>INV-YYYYMMDD-XXX</b>\n\n` +
      `Atau buka link tracking:\nhttps://laundryhub.id/track/[invoice]`
    );
  }

  // Pickup request — detect intent to schedule pickup
  if (lower.includes("pickup") || lower.includes("jemput") || lower.includes("ambil laundry") ||
      lower.includes("mau cuci") || lower.includes("mau laundry")) {
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

  // Operating hours — only trigger on explicit "jam buka/tutup/operasional" NOT just "jam"
  if (lower.includes("jam buka") || lower.includes("jam tutup") || lower.includes("jam operasional") ||
      lower.includes("buka jam") || lower.includes("kapan buka") || lower.includes("kapan tutup") ||
      (lower.includes("jam") && lower.includes("operasional"))) {
    return (
      `🕐 <b>Jam Operasional ${businessName}</b>\n\n` +
      `Senin - Sabtu: 07:00 - 21:00\n` +
      `Minggu: 08:00 - 17:00\n\n` +
      `Pickup tersedia setiap hari 08:00 - 20:00 🛵`
    );
  }

  // Talk to admin
  if (lower.includes("admin") || lower.includes("manusia") || lower.includes("cs") ||
      lower === "help" || lower.includes("komplain") || lower.includes("masalah")) {
    return (
      `👤 Baik, saya akan hubungkan Anda dengan admin.\n\n` +
      `Mohon tunggu sebentar, admin kami akan membalas dalam beberapa menit.\n\n` +
      `Atau hubungi langsung:\n📞 +62 812-1234-5678`
    );
  }

  // Thank you
  if (lower.includes("terima kasih") || lower.includes("thanks") || lower.includes("makasih") || lower.includes("thx")) {
    return `Sama-sama ${name}! 😊 Ada yang bisa dibantu lagi?`;
  }

  // Greeting
  if (lower === "hi" || lower === "halo" || lower === "hai" || lower === "hello" || lower === "hey") {
    return (
      `Halo ${name}! 😊 Ada yang bisa saya bantu?\n\n` +
      `Ketik <b>menu</b> untuk lihat daftar perintah.`
    );
  }

  // Looks like an address/pickup detail (contains street indicators + time)
  if ((lower.includes("jl") || lower.includes("jalan") || lower.includes("blok") || lower.includes("rt")) &&
      (lower.includes("jam") || lower.includes("pagi") || lower.includes("sore") || lower.includes("siang"))) {
    return (
      `✅ <b>Pickup Request Diterima!</b>\n\n` +
      `Detail:\n${text}\n\n` +
      `Admin kami akan konfirmasi dan assign driver dalam 5-10 menit.\n` +
      `Anda akan mendapat notifikasi saat driver berangkat. 🛵\n\n` +
      `Terima kasih sudah menggunakan ${businessName}!`
    );
  }

  // Contains time reference (likely a pickup schedule)
  if ((lower.includes("jam") || lower.includes("pagi") || lower.includes("sore") || lower.includes("siang") || lower.includes("malam")) &&
      (lower.includes("kg") || lower.includes("kilo") || lower.includes("baju") || lower.includes("celana"))) {
    return (
      `✅ Noted! Saya catat request Anda:\n<i>${text}</i>\n\n` +
      `Untuk proses pickup, mohon lengkapi dengan <b>alamat</b> Anda.\n` +
      `Contoh: Jl. Sudirman 12, Blok A`
    );
  }

  // Default — friendly fallback
  return (
    `Halo ${name}! Terima kasih sudah menghubungi <b>${businessName}</b>.\n\n` +
    `Saya belum yakin maksud pesan Anda. Coba ketik salah satu:\n` +
    `• <b>harga</b> — lihat daftar harga\n` +
    `• <b>pickup</b> — request jemput\n` +
    `• <b>cek status</b> — cek order\n` +
    `• <b>jam buka</b> — jam operasional\n` +
    `• <b>admin</b> — bicara dengan admin\n\n` +
    `Atau ceritakan kebutuhan Anda secara lengkap (alamat, jam, berat) dan saya akan bantu proses 😊`
  );
}
