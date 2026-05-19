import "server-only";
import { db } from "@/db/client";
import { tenants, customers, orders, whatsappTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendMessage } from "./messaging";

/**
 * Render a template body with variable substitution.
 * Variables: {customer}, {invoice}, {total}, {status}, {driver}, {estimated}
 */
function renderTemplate(body: string, vars: Record<string, string | number | undefined>): string {
  let out = body;
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined && value !== null) {
      out = out.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
  }
  return out;
}

/**
 * Get tenant messaging config.
 */
async function getTenantConfig(tenantId: string) {
  const [tenant] = await db
    .select({
      messagingChannel: tenants.messagingChannel,
      whatsappToken: tenants.whatsappToken,
      telegramBotToken: tenants.telegramBotToken,
      name: tenants.name,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  return tenant ?? null;
}

/**
 * Get customer messaging target (telegramChatId for telegram, phone for whatsapp).
 */
async function getCustomerTarget(customerId: string, channel: "whatsapp" | "telegram") {
  const [c] = await db
    .select({
      name: customers.name,
      phone: customers.phone,
      telegramChatId: customers.telegramChatId,
    })
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!c) return null;

  if (channel === "telegram") {
    if (!c.telegramChatId) return null;
    return { name: c.name, target: c.telegramChatId };
  }

  // WhatsApp: skip if phone is Telegram placeholder
  if (c.phone.startsWith("tg:")) return null;
  return { name: c.name, target: c.phone };
}

/**
 * Get template body by key.
 */
async function getTemplate(tenantId: string, key: string): Promise<string | null> {
  const [tpl] = await db
    .select({ body: whatsappTemplates.body, isActive: whatsappTemplates.isActive })
    .from(whatsappTemplates)
    .where(and(eq(whatsappTemplates.tenantId, tenantId), eq(whatsappTemplates.key, key)))
    .limit(1);
  if (!tpl || !tpl.isActive) return null;
  return tpl.body;
}

/**
 * Send notification to customer using configured channel.
 * Falls back gracefully if channel/customer not configured.
 */
export async function notifyCustomer(params: {
  tenantId: string;
  customerId: string;
  templateKey: string;
  variables: Record<string, string | number | undefined>;
}): Promise<{ success: boolean; reason?: string }> {
  try {
    const tenant = await getTenantConfig(params.tenantId);
    if (!tenant) return { success: false, reason: "tenant not found" };

    const channel = tenant.messagingChannel as "whatsapp" | "telegram";
    const target = await getCustomerTarget(params.customerId, channel);
    if (!target) return { success: false, reason: "customer not reachable on this channel" };

    let body = await getTemplate(params.tenantId, params.templateKey);
    if (!body) {
      // Use fallback default messages
      body = getDefaultMessage(params.templateKey);
    }

    const vars = {
      customer: target.name,
      ...params.variables,
    };
    const text = renderTemplate(body, vars);

    const result = await sendMessage({
      to: target.target,
      text,
      channel,
      whatsappToken: tenant.whatsappToken ?? undefined,
      telegramBotToken: tenant.telegramBotToken ?? undefined,
    });

    return { success: result.success, reason: result.error };
  } catch (e) {
    console.error("notifyCustomer error:", e);
    return { success: false, reason: String(e) };
  }
}

/**
 * Default fallback messages if template not found in DB.
 */
function getDefaultMessage(key: string): string {
  const defaults: Record<string, string> = {
    order_received:
      "Halo {customer}! Order Anda dengan invoice {invoice} sudah kami terima. Total: Rp {total}. Estimasi selesai: {estimated}. Terima kasih!",
    pickup_driver:
      "Halo {customer}! Driver {driver} sedang dalam perjalanan untuk pickup order {invoice}. Mohon dipersiapkan ya 🛵",
    order_received_at_outlet:
      "Halo {customer}! Laundry Anda (invoice {invoice}) sudah kami terima di outlet dan akan segera diproses.",
    laundry_done:
      "Halo {customer}! Laundry Anda (invoice {invoice}) sudah selesai dan siap diantar/diambil. Terima kasih sudah menggunakan layanan kami! ✨",
    delivering:
      "Halo {customer}! Driver {driver} sedang dalam perjalanan mengantar laundry Anda (invoice {invoice}). Mohon ditunggu ya 🛵",
    order_completed:
      "Halo {customer}! Order {invoice} telah selesai. Total: Rp {total} ({status}). Terima kasih sudah mempercayakan laundry Anda kepada kami! 🙏",
    payment_received:
      "Halo {customer}! Pembayaran sebesar Rp {amount} untuk invoice {invoice} sudah kami terima. Terima kasih! 💚",
    reminder_unclaimed:
      "Halo {customer}! Laundry Anda (invoice {invoice}) sudah siap diambil sejak {ready_date}. Mohon segera diambil ya 🙏",
  };
  return defaults[key] || "Halo {customer}! Update order {invoice}: {status}";
}

/**
 * Helper: notify on order status change.
 */
export async function notifyOrderStatusChange(orderId: string, newStatus: string) {
  const [order] = await db
    .select({
      tenantId: orders.tenantId,
      customerId: orders.customerId,
      invoiceNumber: orders.invoiceNumber,
      total: orders.total,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return;

  const statusToTemplate: Record<string, string> = {
    WAITING_PICKUP: "order_received",
    PICKUP_PROCESS: "pickup_driver",
    RECEIVED: "order_received_at_outlet",
    READY_DELIVERY: "laundry_done",
    DELIVERING: "delivering",
    COMPLETED: "order_completed",
  };

  const templateKey = statusToTemplate[newStatus];
  if (!templateKey) return; // No notification for intermediate statuses

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

  await notifyCustomer({
    tenantId: order.tenantId,
    customerId: order.customerId,
    templateKey,
    variables: {
      invoice: order.invoiceNumber,
      total: order.total.toLocaleString("id-ID"),
      status: statusLabel[newStatus] || newStatus,
    },
  });
}
