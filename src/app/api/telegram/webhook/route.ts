import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import {
  tenants,
  customers,
  services,
  orders,
  orderItems,
  pickups,
  branches,
  drivers,
  messages,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";
import { generateId } from "@/db/repositories";

export const dynamic = "force-dynamic";

/**
 * Telegram Bot Webhook — receives incoming messages from Telegram.
 * Auto-creates orders + pickup tasks when customer sends pickup details.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || body.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const firstName = message.from?.first_name || "Customer";
    const username = message.from?.username || null;

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

    // Find or create customer by Telegram chatId
    const customer = await findOrCreateCustomer(tenantId, chatId, firstName, username);

    // Save incoming message
    await db.insert(messages).values({
      id: generateId("msg"),
      tenantId,
      customerId: customer.id,
      direction: "incoming",
      channel: "telegram",
      body: text,
      isBot: false,
    });

    // Detect intent and reply (may also create order)
    const reply = await handleMessage({
      text,
      tenantId,
      customer,
      businessName: tenant.name || "LaundryHub",
      botToken: tenant.telegramBotToken,
    });

    // Save outgoing reply
    await db.insert(messages).values({
      id: generateId("msg"),
      tenantId,
      customerId: customer.id,
      direction: "outgoing",
      channel: "telegram",
      body: reply,
      isBot: true,
    });

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
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    description: "Telegram Bot Webhook for LaundryHub",
  });
}

/**
 * Find existing customer by telegramChatId, or create a new one.
 */
async function findOrCreateCustomer(
  tenantId: string,
  chatId: string,
  firstName: string,
  username: string | null
) {
  // Try find by telegramChatId
  const [existing] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.tenantId, tenantId), eq(customers.telegramChatId, chatId)))
    .limit(1);

  if (existing) return existing;

  // Create new customer
  const id = generateId("cst");
  const phone = `tg:${chatId}`; // placeholder until customer provides real phone
  await db.insert(customers).values({
    id,
    tenantId,
    name: firstName,
    phone,
    telegramChatId: chatId,
    telegramUsername: username,
  });

  const [created] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return created;
}

/**
 * Parse weight from text. Returns null if not found.
 */
function extractWeight(text: string): number | null {
  // Match patterns like "5kg", "5 kg", "5 kilo", "sekitar 3kg"
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilo)/i);
  if (match) return parseFloat(match[1].replace(",", "."));
  return null;
}

/**
 * Parse address from text. Returns the line/segment containing street markers.
 */
function extractAddress(text: string): string | null {
  // Look for sentences with street markers
  const lines = text.split(/[,;\n]/).map((s) => s.trim());
  for (const line of lines) {
    if (/\b(jl\.?|jalan|blok|no\.?|rt|rw|gang|gg)\b/i.test(line)) {
      return line;
    }
  }
  return null;
}

/**
 * Parse time from text (e.g. "jam 4", "jam 16:00", "sore", "pagi").
 */
function extractTime(text: string): string | null {
  const lower = text.toLowerCase();
  const hourMatch = lower.match(/jam\s*(\d{1,2})(?:[:.](\d{2}))?/);
  if (hourMatch) {
    const h = parseInt(hourMatch[1]);
    const m = hourMatch[2] ? parseInt(hourMatch[2]) : 0;
    let hour = h;
    // Adjust based on AM/PM context
    if (lower.includes("sore") && hour < 12) hour += 12;
    else if (lower.includes("malam") && hour < 12) hour += 12;
    else if (lower.includes("siang") && hour < 12 && hour < 7) hour += 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  if (lower.includes("pagi")) return "08:00";
  if (lower.includes("siang")) return "13:00";
  if (lower.includes("sore")) return "16:00";
  if (lower.includes("malam")) return "19:00";
  return null;
}

/**
 * Find the driver with the least scheduled tasks (load balancing).
 */
async function findAvailableDriver(tenantId: string) {
  const drvs = await db
    .select({
      id: drivers.id,
      name: drivers.name,
      phone: drivers.phone,
    })
    .from(drivers)
    .where(and(eq(drivers.tenantId, tenantId), eq(drivers.isActive, true)));

  if (drvs.length === 0) return null;

  // Count active tasks per driver
  const driversWithLoad = await Promise.all(
    drvs.map(async (drv) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pickups)
        .where(
          and(
            eq(pickups.driverId, drv.id),
            sql`${pickups.status} in ('scheduled', 'ongoing')`
          )
        );
      return { ...drv, load: Number(count) };
    })
  );

  // Pick driver with least load
  driversWithLoad.sort((a, b) => a.load - b.load);
  return driversWithLoad[0];
}

/**
 * Notify all Telegram-linked admin/owner users about a new order.
 */
async function notifyAdmins(
  tenantId: string,
  botToken: string,
  orderInfo: {
    invoiceNumber: string;
    customerName: string;
    address: string;
    time: string;
    weight: number;
    total: number;
    driverName?: string;
  }
) {
  // Find all admin/owner users with telegramChatId via their customer record
  // For now, we'll just log. In production, link users to Telegram via separate field.
  const text =
    `🔔 <b>Order Baru via Telegram!</b>\n\n` +
    `Invoice: <b>${orderInfo.invoiceNumber}</b>\n` +
    `Customer: ${orderInfo.customerName}\n` +
    `Alamat: ${orderInfo.address}\n` +
    `Jam pickup: ${orderInfo.time}\n` +
    `Berat: ${orderInfo.weight} kg\n` +
    `Total: Rp ${orderInfo.total.toLocaleString("id-ID")}\n` +
    (orderInfo.driverName ? `Driver: ${orderInfo.driverName}\n` : "") +
    `\nBuka dashboard untuk detail.`;

  // Find admin chat IDs from a separate config (could be customer record or future field)
  // For now, we send to admins who are also in customers table with telegramChatId
  // (future improvement: dedicated admin_telegram_id field on users table)
  const adminChats = await db
    .select({
      chatId: customers.telegramChatId,
    })
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        sql`${customers.telegramChatId} IS NOT NULL`,
        sql`${customers.notes} LIKE '%admin%'`
      )
    );

  for (const a of adminChats) {
    if (!a.chatId) continue;
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: a.chatId,
          text,
          parse_mode: "HTML",
        }),
      });
    } catch (e) {
      console.error("Failed notify admin:", e);
    }
  }
}

/**
 * Create a pickup order in the database.
 */
async function createPickupOrder(params: {
  tenantId: string;
  customerId: string;
  customerName: string;
  address: string;
  scheduledTime: string; // HH:MM
  weight: number;
  notes?: string;
  botToken: string;
}): Promise<{
  orderId: string;
  invoiceNumber: string;
  total: number;
  serviceName: string;
  driverName: string | null;
} | null> {
  const { tenantId, customerId, customerName, address, scheduledTime, weight, notes, botToken } =
    params;

  // Get default service (first active "regular" service or any)
  const [svc] = await db
    .select()
    .from(services)
    .where(and(eq(services.tenantId, tenantId), eq(services.isActive, true)))
    .limit(1);

  if (!svc) return null;

  // Get default branch
  const [branch] = await db
    .select()
    .from(branches)
    .where(and(eq(branches.tenantId, tenantId), eq(branches.isActive, true)))
    .limit(1);

  // Find available driver
  const assignedDriver = await findAvailableDriver(tenantId);

  const total = svc.price * weight;
  const orderId = generateId("ord");
  const itemId = generateId("itm");

  // Generate invoice number
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.tenantId, tenantId));
  const invoiceNumber = `INV-${datePart}-${String(Number(count) + 1).padStart(3, "0")}`;

  // Compute scheduled timestamp (today at the given time)
  const [hour, minute] = scheduledTime.split(":").map(Number);
  const scheduledDate = new Date();
  scheduledDate.setHours(hour, minute, 0, 0);
  // If time has already passed today, schedule for tomorrow
  if (scheduledDate.getTime() < Date.now()) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  // Estimated completion: scheduledDate + durationDays
  const estimatedAt = new Date(scheduledDate);
  estimatedAt.setDate(estimatedAt.getDate() + (svc.durationDays || 2));

  // Create order with WAITING_PICKUP status
  await db.insert(orders).values({
    id: orderId,
    tenantId,
    branchId: branch?.id,
    customerId,
    invoiceNumber,
    status: "WAITING_PICKUP",
    paymentStatus: "unpaid",
    pickupType: "pickup",
    pickupAddress: address,
    weight,
    subtotal: total,
    discount: 0,
    total,
    notes: notes || `Order via Telegram bot`,
    estimatedAt,
  });

  // Create order_items entry so the service shows up in lists
  await db.insert(orderItems).values({
    id: itemId,
    orderId,
    serviceId: svc.id,
    serviceName: svc.name,
    qty: weight,
    pricePerUnit: svc.price,
    total,
  });

  // Create pickup task with driver auto-assigned
  const pickupId = generateId("pck");
  await db.insert(pickups).values({
    id: pickupId,
    tenantId,
    orderId,
    driverId: assignedDriver?.id,
    type: "pickup",
    status: "scheduled",
    address,
    scheduledAt: scheduledDate,
  });

  // Notify admins
  await notifyAdmins(tenantId, botToken, {
    invoiceNumber,
    customerName,
    address,
    time: scheduledTime,
    weight,
    total,
    driverName: assignedDriver?.name,
  });

  // Revalidate cached pages so dashboard/orders/pickup show new data immediately
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/pickup");
  revalidatePath("/customers");

  return {
    orderId,
    invoiceNumber,
    total,
    serviceName: svc.name,
    driverName: assignedDriver?.name ?? null,
  };
}

/**
 * Main message handler — detects intent and dispatches.
 */
async function handleMessage(params: {
  text: string;
  tenantId: string;
  customer: typeof customers.$inferSelect;
  businessName: string;
  botToken: string;
}): Promise<string> {
  const { text, tenantId, customer, businessName, botToken } = params;
  const lower = text.toLowerCase().trim();
  const name = customer.name;

  // /start command
  if (lower === "/start") {
    return (
      `Halo ${name}! 👋\n\n` +
      `Selamat datang di <b>${businessName}</b>.\n\n` +
      `Saya bot otomatis yang siap membantu:\n` +
      `• Cek harga → ketik <b>harga</b>\n` +
      `• Order pickup → ketik <b>pickup</b>\n` +
      `• Cek status → kirim nomor invoice\n` +
      `• Bicara admin → ketik <b>admin</b>\n\n` +
      `Atau langsung kirim info pickup: <i>alamat, jam, berat (kg)</i>`
    );
  }

  // /help / menu
  if (lower === "/help" || lower === "help" || lower === "menu") {
    return (
      `📋 <b>Menu Bantuan</b>\n\n` +
      `• <b>harga</b> — daftar harga\n` +
      `• <b>pickup</b> — request jemput\n` +
      `• <b>cek status</b> — cek order\n` +
      `• <b>jam buka</b> — jam operasional\n` +
      `• <b>admin</b> — bicara admin\n\n` +
      `Format pickup cepat:\n<i>Jl. Sudirman 12, jam 4 sore, 5 kg</i>`
    );
  }

  // Greeting
  if (lower === "hi" || lower === "halo" || lower === "hai" || lower === "hello") {
    return `Halo ${name}! 😊 Ada yang bisa dibantu? Ketik <b>menu</b> untuk lihat perintah.`;
  }

  // Price inquiry
  if (lower.includes("harga") || lower.includes("tarif") || lower.includes("berapa")) {
    return (
      `💰 <b>Daftar Harga ${businessName}</b>\n\n` +
      `• Cuci Setrika — Rp 7.000/kg\n` +
      `• Cuci Kering — Rp 5.000/kg\n` +
      `• Setrika Saja — Rp 4.000/kg\n` +
      `• Express — Rp 12.000/kg\n` +
      `• Sepatu — Rp 35.000/pasang\n` +
      `• Karpet — Rp 25.000/m²\n\n` +
      `Mau order? Kirim: <i>alamat, jam, berat</i>`
    );
  }

  // Status check by invoice number
  const invMatch = text.match(/INV-\d{8}-\d+/i);
  if (invMatch) {
    const invoice = invMatch[0].toUpperCase();
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), eq(orders.invoiceNumber, invoice)))
      .limit(1);

    if (!order) {
      return `❌ Invoice <b>${invoice}</b> tidak ditemukan. Pastikan format dan nomor benar.`;
    }

    const statusLabel: Record<string, string> = {
      WAITING_PICKUP: "Menunggu pickup",
      PICKUP_PROCESS: "Driver dalam perjalanan",
      RECEIVED: "Diterima di outlet",
      WASHING: "Sedang dicuci",
      DRYING: "Sedang dikeringkan",
      IRONING: "Sedang disetrika",
      PACKING: "Sedang dikemas",
      READY_DELIVERY: "Siap diantar",
      DELIVERING: "Driver mengantar",
      COMPLETED: "Selesai",
      CANCELLED: "Dibatalkan",
    };

    return (
      `📦 <b>Status Order</b>\n\n` +
      `Invoice: <b>${order.invoiceNumber}</b>\n` +
      `Status: <b>${statusLabel[order.status] || order.status}</b>\n` +
      `Total: Rp ${order.total.toLocaleString("id-ID")}\n` +
      `Pembayaran: ${order.paymentStatus === "paid" ? "✅ Lunas" : "⏳ Belum bayar"}`
    );
  }

  // Operating hours
  if (
    lower.includes("jam buka") ||
    lower.includes("jam tutup") ||
    lower.includes("jam operasional") ||
    lower.includes("kapan buka") ||
    lower.includes("kapan tutup")
  ) {
    return (
      `🕐 <b>Jam Operasional ${businessName}</b>\n\n` +
      `Senin - Sabtu: 07:00 - 21:00\n` +
      `Minggu: 08:00 - 17:00\n\n` +
      `Pickup: 08:00 - 20:00 setiap hari 🛵`
    );
  }

  // Admin handoff
  if (lower.includes("admin") || lower.includes("manusia") || lower.includes("cs") || lower.includes("komplain")) {
    return (
      `👤 Saya hubungkan ke admin.\n\n` +
      `Mohon tunggu, admin akan membalas dalam beberapa menit.\n\n` +
      `Hotline: 📞 +62 812-1234-5678`
    );
  }

  // Thank you
  if (lower.includes("terima kasih") || lower.includes("thanks") || lower.includes("makasih")) {
    return `Sama-sama ${name}! 😊 Ada yang bisa dibantu lagi?`;
  }

  // === PICKUP ORDER DETECTION ===
  // Try to extract address, time, and weight from message
  const address = extractAddress(text);
  const time = extractTime(text);
  const weight = extractWeight(text);

  // Full pickup info — create order!
  if (address && time && weight) {
    const result = await createPickupOrder({
      tenantId,
      customerId: customer.id,
      customerName: name,
      address,
      scheduledTime: time,
      weight,
      notes: `Order via Telegram. Customer: ${name}`,
      botToken,
    });

    if (!result) {
      return `❌ Maaf, sistem belum siap. Mohon hubungi admin untuk konfirmasi order.`;
    }

    return (
      `✅ <b>Order Berhasil Dibuat!</b>\n\n` +
      `📋 Invoice: <b>${result.invoiceNumber}</b>\n` +
      `🛵 Pickup: ${address}\n` +
      `⏰ Jam: ${time}\n` +
      `⚖️ Berat estimasi: ${weight} kg\n` +
      `💰 Total: Rp ${result.total.toLocaleString("id-ID")}\n` +
      `📦 Layanan: ${result.serviceName}\n` +
      (result.driverName ? `👤 Driver: <b>${result.driverName}</b>\n` : "") +
      `\nDriver akan datang sesuai jadwal. Anda akan dapat notifikasi saat driver berangkat.\n\n` +
      `Cek status kapan saja dengan kirim nomor invoice di atas. 😊`
    );
  }

  // Partial info — guide user to complete
  if (lower.includes("pickup") || lower.includes("jemput") || lower.includes("mau cuci") || lower.includes("mau laundry")) {
    return (
      `🛵 <b>Request Pickup</b>\n\n` +
      `Untuk order pickup, kirim 3 info dalam 1 pesan:\n` +
      `1. <b>Alamat</b> lengkap\n` +
      `2. <b>Jam</b> pickup\n` +
      `3. <b>Berat</b> estimasi (kg)\n\n` +
      `Contoh:\n<i>Jl. Sudirman 12, jam 4 sore, 5 kg</i>`
    );
  }

  // Has time + weight but missing address
  if (time && weight && !address) {
    return (
      `📝 Saya catat: jam ${time}, ${weight} kg.\n\n` +
      `Mohon kirim juga <b>alamat lengkap</b> untuk pickup.\nContoh: <i>Jl. Sudirman 12, Blok A</i>`
    );
  }

  // Has address + time but missing weight
  if (address && time && !weight) {
    return (
      `📝 Alamat: ${address}, jam ${time}.\n\n` +
      `Estimasi <b>berat</b>nya berapa kg? Contoh: <i>5 kg</i>`
    );
  }

  // Has address but missing time + weight
  if (address && !time && !weight) {
    return (
      `📝 Alamat: ${address}.\n\n` +
      `Mohon lengkapi:\n• <b>Jam</b> pickup (e.g. jam 4 sore)\n• <b>Berat</b> estimasi (e.g. 5 kg)`
    );
  }

  // Default fallback
  return (
    `Halo ${name}! Terima kasih sudah menghubungi <b>${businessName}</b>.\n\n` +
    `Saya belum yakin maksud pesan Anda. Coba:\n` +
    `• <b>harga</b> — lihat harga\n` +
    `• <b>pickup</b> — order jemput\n` +
    `• <b>menu</b> — lihat semua perintah\n\n` +
    `Atau kirim langsung: <i>alamat, jam, berat kg</i>`
  );
}
