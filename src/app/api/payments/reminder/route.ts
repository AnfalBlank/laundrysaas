import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders, customers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";
import { requirePermission } from "@/lib/api-guard";
import { notifyCustomer } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/reminder
 * Send reminder to all customers with unpaid orders.
 */
export async function POST() {
  const guard = await requirePermission("payments:create");
  if (guard instanceof NextResponse) return guard;
  try {
    const tenantId = getCurrentTenantId();

    // Find unpaid orders
    const unpaidOrders = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        invoiceNumber: orders.invoiceNumber,
        total: orders.total,
      })
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.paymentStatus, "unpaid")
        )
      )
      .limit(50);

    let sentCount = 0;
    for (const order of unpaidOrders) {
      const result = await notifyCustomer({
        tenantId,
        customerId: order.customerId,
        templateKey: "reminder_unclaimed",
        variables: {
          invoice: order.invoiceNumber,
          total: order.total.toLocaleString("id-ID"),
          ready_date: "beberapa hari lalu",
        },
      });
      if (result.success) sentCount++;
    }

    return NextResponse.json({ ok: true, sentCount, total: unpaidOrders.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
