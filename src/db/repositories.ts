import { db } from "./client";
import {
  orders,
  orderItems,
  customers,
  branches,
  services,
  payments,
  pickups,
  drivers,
  inventory,
  whatsappTemplates,
  users,
} from "./schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

// Generic id generator
export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

// ===== ORDERS =====
export async function listOrders(opts?: { status?: string; limit?: number }) {
  const tenantId = getCurrentTenantId();
  const conditions = [eq(orders.tenantId, tenantId)];
  if (opts?.status && opts.status !== "ALL") {
    conditions.push(eq(orders.status, opts.status as never));
  }

  const rows = await db
    .select({
      id: orders.id,
      invoice: orders.invoiceNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      pickupType: orders.pickupType,
      isExpress: orders.isExpress,
      weight: orders.weight,
      total: orders.total,
      createdAt: orders.createdAt,
      estimatedAt: orders.estimatedAt,
      customerId: customers.id,
      customerName: customers.name,
      customerPhone: customers.phone,
      branchName: branches.name,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(branches, eq(orders.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(opts?.limit ?? 100);

  const ids = rows.map((r) => r.id);
  const items = ids.length
    ? await db.select().from(orderItems).where(sql`${orderItems.orderId} in ${ids}`)
    : [];

  return rows.map((r) => ({
    ...r,
    service: items.find((i) => i.orderId === r.id)?.serviceName ?? "—",
  }));
}

export async function getOrderStats() {
  const tenantId = getCurrentTenantId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayStats] = await db
    .select({
      ordersToday: sql<number>`count(*)`,
      revenueToday: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        sql`${orders.createdAt} >= ${Math.floor(today.getTime() / 1000)}`
      )
    );

  const [activeStats] = await db
    .select({
      active: sql<number>`count(*)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        sql`${orders.status} not in ('COMPLETED', 'CANCELLED')`
      )
    );

  const [pickupPending] = await db
    .select({ pending: sql<number>`count(*)` })
    .from(orders)
    .where(
      and(eq(orders.tenantId, tenantId), eq(orders.status, "WAITING_PICKUP"))
    );

  return {
    ordersToday: Number(todayStats?.ordersToday ?? 0),
    revenueToday: Number(todayStats?.revenueToday ?? 0),
    activeOrders: Number(activeStats?.active ?? 0),
    pickupPending: Number(pickupPending?.pending ?? 0),
  };
}

export async function getRevenueChart(days = 7) {
  const tenantId = getCurrentTenantId();
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      day: sql<string>`strftime('%Y-%m-%d', ${orders.createdAt}, 'unixepoch')`,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        sql`${orders.createdAt} >= ${Math.floor(since.getTime() / 1000)}`
      )
    )
    .groupBy(sql`strftime('%Y-%m-%d', ${orders.createdAt}, 'unixepoch')`);

  const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const result: { day: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = rows.find((r) => r.day === key);
    result.push({
      day: dayLabels[d.getDay()],
      revenue: Number(found?.revenue ?? 0),
      orders: Number(found?.count ?? 0),
    });
  }
  return result;
}

export async function getServiceBreakdown() {
  const tenantId = getCurrentTenantId();
  const rows = await db
    .select({
      name: services.name,
      category: services.category,
      count: sql<number>`count(${orderItems.id})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(services, eq(orderItems.serviceId, services.id))
    .where(eq(orders.tenantId, tenantId))
    .groupBy(services.id);

  const total = rows.reduce((s, r) => s + Number(r.count), 0) || 1;
  const palette = ["#2563eb", "#06b6d4", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#94a3b8"];
  return rows
    .map((r, i) => ({
      name: r.name,
      value: Math.round((Number(r.count) / total) * 100),
      color: palette[i % palette.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getBranchPerformance() {
  const tenantId = getCurrentTenantId();
  const rows = await db
    .select({
      id: branches.id,
      name: branches.name,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      orders: sql<number>`count(${orders.id})`,
    })
    .from(branches)
    .leftJoin(orders, eq(branches.id, orders.branchId))
    .where(eq(branches.tenantId, tenantId))
    .groupBy(branches.id);

  return rows.map((r) => ({
    name: r.name,
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }));
}

// ===== CUSTOMERS =====
export async function listCustomers(opts?: { tier?: string; q?: string }) {
  const tenantId = getCurrentTenantId();
  const conditions = [eq(customers.tenantId, tenantId)];
  if (opts?.tier && opts.tier !== "ALL") {
    conditions.push(eq(customers.tier, opts.tier as never));
  }
  if (opts?.q) {
    conditions.push(
      sql`(${customers.name} like ${"%" + opts.q + "%"} or ${customers.phone} like ${
        "%" + opts.q + "%"
      })`
    );
  }
  return db
    .select()
    .from(customers)
    .where(and(...conditions))
    .orderBy(desc(customers.totalSpending));
}

export async function getCustomerStats() {
  const tenantId = getCurrentTenantId();
  const [total] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.tenantId, tenantId));

  const [vip] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(and(eq(customers.tenantId, tenantId), eq(customers.tier, "platinum")));

  // Repeat order rate: customers with totalOrders > 1 / total customers
  const [repeat] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(and(eq(customers.tenantId, tenantId), sql`${customers.totalOrders} > 1`));

  // Inactive 30 days: customers whose last order > 30 days ago
  const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const [inactiveRow] = await db
    .select({ count: sql<number>`count(distinct ${customers.id})` })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(
      and(
        eq(customers.tenantId, tenantId),
        sql`${customers.id} NOT IN (
          SELECT DISTINCT customer_id FROM orders
          WHERE tenant_id = ${tenantId} AND created_at >= ${thirtyDaysAgo}
        )`
      )
    );

  const totalCount = Number(total?.count ?? 0);
  const repeatCount = Number(repeat?.count ?? 0);
  const repeatRate = totalCount > 0 ? Math.round((repeatCount / totalCount) * 100) : 0;

  return {
    total: totalCount,
    vip: Number(vip?.count ?? 0),
    repeatRate,
    inactive30Days: Number(inactiveRow?.count ?? 0),
  };
}

// ===== SERVICES =====
export async function listServices() {
  const tenantId = getCurrentTenantId();
  return db
    .select()
    .from(services)
    .where(and(eq(services.tenantId, tenantId), eq(services.isActive, true)));
}

// ===== PAYMENTS =====
export async function listPayments(limit = 20) {
  const tenantId = getCurrentTenantId();
  return db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      amount: payments.amount,
      method: payments.method,
      paidAt: payments.paidAt,
      invoice: orders.invoiceNumber,
      customerName: customers.name,
      customerPhone: customers.phone,
      paymentStatus: orders.paymentStatus,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.tenantId, tenantId))
    .orderBy(desc(payments.paidAt))
    .limit(limit);
}

export async function getPaymentSummary() {
  const tenantId = getCurrentTenantId();
  const rows = await db
    .select({
      method: payments.method,
      total: sql<number>`coalesce(sum(${payments.amount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(eq(orders.tenantId, tenantId))
    .groupBy(payments.method);

  return rows.map((r) => ({
    method: r.method,
    total: Number(r.total),
    count: Number(r.count),
  }));
}

export async function getOutstandingPayments() {
  const tenantId = getCurrentTenantId();
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(
      and(eq(orders.tenantId, tenantId), eq(orders.paymentStatus, "unpaid"))
    );
  return { total: Number(row?.total ?? 0), count: Number(row?.count ?? 0) };
}

// ===== PICKUPS =====
export async function listPickups() {
  const tenantId = getCurrentTenantId();
  return db
    .select({
      id: pickups.id,
      type: pickups.type,
      status: pickups.status,
      address: pickups.address,
      scheduledAt: pickups.scheduledAt,
      completedAt: pickups.completedAt,
      orderId: pickups.orderId,
      invoice: orders.invoiceNumber,
      customerName: customers.name,
      driverName: drivers.name,
    })
    .from(pickups)
    .innerJoin(orders, eq(pickups.orderId, orders.id))
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(drivers, eq(pickups.driverId, drivers.id))
    .where(eq(pickups.tenantId, tenantId))
    .orderBy(desc(pickups.scheduledAt));
}

export async function listDrivers() {
  const tenantId = getCurrentTenantId();
  const rows = await db
    .select({
      id: drivers.id,
      name: drivers.name,
      phone: drivers.phone,
      isActive: drivers.isActive,
      taskCount: sql<number>`(
        select count(*) from ${pickups}
        where ${pickups.driverId} = ${drivers.id}
        and ${pickups.status} in ('scheduled', 'ongoing')
      )`,
      ongoingCount: sql<number>`(
        select count(*) from ${pickups}
        where ${pickups.driverId} = ${drivers.id}
        and ${pickups.status} = 'ongoing'
      )`,
    })
    .from(drivers)
    .where(eq(drivers.tenantId, tenantId));

  return rows.map((r) => ({
    ...r,
    taskCount: Number(r.taskCount),
    ongoingCount: Number(r.ongoingCount),
  }));
}

// ===== INVENTORY =====
export async function listInventory() {
  const tenantId = getCurrentTenantId();
  return db.select().from(inventory).where(eq(inventory.tenantId, tenantId));
}

// ===== WHATSAPP TEMPLATES =====
export async function listWhatsappTemplates() {
  const tenantId = getCurrentTenantId();
  return db
    .select()
    .from(whatsappTemplates)
    .where(eq(whatsappTemplates.tenantId, tenantId));
}

// ===== STAFF / BRANCHES =====
export async function listBranches() {
  const tenantId = getCurrentTenantId();
  return db.select().from(branches).where(eq(branches.tenantId, tenantId));
}

export async function listStaff() {
  const tenantId = getCurrentTenantId();
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      isActive: users.isActive,
      branchName: branches.name,
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .where(eq(users.tenantId, tenantId));
}


// ============ MUTATIONS ============

// Create new order
export async function createOrder(input: {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  branchId?: string;
  serviceId: string;
  qty: number;
  pickupType: "walk_in" | "pickup";
  pickupAddress?: string;
  isExpress?: boolean;
  notes?: string;
}) {
  const tenantId = getCurrentTenantId();

  // Find or create customer
  let customerId = input.customerId;
  if (!customerId && input.customerPhone) {
    const [existing] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.phone, input.customerPhone)))
      .limit(1);
    if (existing) {
      customerId = existing.id;
    } else if (input.customerName) {
      customerId = generateId("cst");
      await db.insert(customers).values({
        id: customerId,
        tenantId,
        name: input.customerName,
        phone: input.customerPhone,
        address: input.customerAddress,
      });
    }
  }
  if (!customerId) throw new Error("Customer required");

  // Get service for price
  const [svc] = await db
    .select()
    .from(services)
    .where(and(eq(services.tenantId, tenantId), eq(services.id, input.serviceId)))
    .limit(1);
  if (!svc) throw new Error("Service not found");

  const total = svc.price * input.qty;
  const orderId = generateId("ord");
  const itemId = generateId("itm");

  // Generate invoice number
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      sql`${orders.createdAt} >= ${Math.floor(new Date(today.toDateString()).getTime() / 1000)}`,
    ));
  const invoiceNumber = `INV-${datePart}-${String(Number(count) + 1).padStart(3, "0")}`;

  const estimatedAt = new Date();
  estimatedAt.setDate(estimatedAt.getDate() + (input.isExpress ? 1 : svc.durationDays));

  // Insert order
  await db.insert(orders).values({
    id: orderId,
    tenantId,
    branchId: input.branchId,
    customerId,
    invoiceNumber,
    status: input.pickupType === "pickup" ? "WAITING_PICKUP" : "RECEIVED",
    paymentStatus: "unpaid",
    pickupType: input.pickupType,
    pickupAddress: input.pickupAddress,
    isExpress: input.isExpress ?? false,
    notes: input.notes,
    weight: svc.pricingType === "per_kg" ? input.qty : null,
    subtotal: total,
    total,
    estimatedAt,
  });

  // Insert order item
  await db.insert(orderItems).values({
    id: itemId,
    orderId,
    serviceId: svc.id,
    serviceName: svc.name,
    qty: input.qty,
    pricePerUnit: svc.price,
    total,
  });

  // Send notification to customer (order received) — best-effort
  try {
    const { notifyCustomer } = await import("@/lib/notify");
    await notifyCustomer({
      tenantId,
      customerId,
      templateKey: "order_received",
      variables: {
        invoice: invoiceNumber,
        total: total.toLocaleString("id-ID"),
        estimated: estimatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "long" }),
      },
    });
  } catch (e) {
    console.error("Failed to send order_received notification:", e);
  }

  return { id: orderId, invoiceNumber, total };
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string) {
  const tenantId = getCurrentTenantId();
  await db
    .update(orders)
    .set({
      status: status as never,
      updatedAt: new Date(),
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
    })
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)));

  // Update customer loyalty when order completes
  if (status === "COMPLETED") {
    const [order] = await db
      .select({ customerId: orders.customerId, total: orders.total, paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (order && order.paymentStatus === "paid") {
      await updateCustomerLoyalty(order.customerId, order.total);
    }
  }

  // Send notification to customer (best-effort, don't fail order update if notif fails)
  try {
    const { notifyOrderStatusChange } = await import("@/lib/notify");
    await notifyOrderStatusChange(orderId, status);
  } catch (e) {
    console.error("Failed to send status notification:", e);
  }
}

/**
 * Update customer denormalized stats: totalOrders, totalSpending, points, tier.
 */
async function updateCustomerLoyalty(customerId: string, orderTotal: number) {
  const [c] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!c) return;

  const newTotalOrders = (c.totalOrders ?? 0) + 1;
  const newTotalSpending = (c.totalSpending ?? 0) + orderTotal;
  // 1 point per Rp 1.000
  const earnedPoints = Math.floor(orderTotal / 1000);
  const newPoints = (c.points ?? 0) + earnedPoints;

  // Auto-tier
  let newTier: "silver" | "gold" | "platinum" = c.tier as "silver" | "gold" | "platinum";
  if (newTotalSpending >= 2000000) newTier = "platinum";
  else if (newTotalSpending >= 500000) newTier = "gold";
  else newTier = "silver";

  await db
    .update(customers)
    .set({
      totalOrders: newTotalOrders,
      totalSpending: newTotalSpending,
      points: newPoints,
      tier: newTier,
    })
    .where(eq(customers.id, customerId));
}

// Cancel order
export async function cancelOrder(orderId: string) {
  await updateOrderStatus(orderId, "CANCELLED");
}

// Record payment
export async function recordPayment(input: {
  orderId: string;
  amount: number;
  method: "cash" | "transfer" | "qris" | "ewallet";
  reference?: string;
}) {
  const payId = generateId("pay");
  await db.insert(payments).values({
    id: payId,
    orderId: input.orderId,
    amount: input.amount,
    method: input.method,
    reference: input.reference,
  });

  // Update order payment status
  const [{ paid }] = await db
    .select({ paid: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.orderId, input.orderId));

  const [order] = await db
    .select({ total: orders.total, customerId: orders.customerId, invoiceNumber: orders.invoiceNumber, tenantId: orders.tenantId })
    .from(orders)
    .where(eq(orders.id, input.orderId));

  if (!order) throw new Error("Order not found");

  const status = Number(paid) >= order.total ? "paid" : "partial";
  await db
    .update(orders)
    .set({ paymentStatus: status, updatedAt: new Date() })
    .where(eq(orders.id, input.orderId));

  // Notify customer of payment received (best-effort)
  if (status === "paid") {
    try {
      const { notifyCustomer } = await import("@/lib/notify");
      await notifyCustomer({
        tenantId: order.tenantId,
        customerId: order.customerId,
        templateKey: "payment_received",
        variables: {
          invoice: order.invoiceNumber,
          amount: input.amount.toLocaleString("id-ID"),
        },
      });
    } catch (e) {
      console.error("Failed to send payment notification:", e);
    }
  }

  return { id: payId };
}

// Create customer
export async function createCustomer(input: {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("cst");
  await db.insert(customers).values({
    id,
    tenantId,
    name: input.name,
    phone: input.phone,
    address: input.address,
    notes: input.notes,
  });
  return { id };
}

// Create service
export async function createService(input: {
  name: string;
  category: "regular" | "express" | "special";
  pricingType: "per_kg" | "per_item" | "per_unit";
  price: number;
  durationDays: number;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("svc");
  await db.insert(services).values({
    id,
    tenantId,
    name: input.name,
    category: input.category,
    pricingType: input.pricingType,
    price: input.price,
    durationDays: input.durationDays,
  });
  return { id };
}

// Create pickup
export async function createPickup(input: {
  orderId: string;
  driverId?: string;
  type: "pickup" | "delivery";
  address?: string;
  scheduledAt: Date;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("pck");
  await db.insert(pickups).values({
    id,
    tenantId,
    orderId: input.orderId,
    driverId: input.driverId,
    type: input.type,
    status: "scheduled",
    address: input.address,
    scheduledAt: input.scheduledAt,
  });
  return { id };
}

// Update pickup status — also syncs corresponding order status
export async function updatePickupStatus(
  pickupId: string,
  status: "scheduled" | "ongoing" | "completed" | "cancelled"
) {
  // Get pickup info first
  const [pickup] = await db
    .select({ orderId: pickups.orderId, type: pickups.type })
    .from(pickups)
    .where(eq(pickups.id, pickupId))
    .limit(1);

  await db
    .update(pickups)
    .set({
      status,
      ...(status === "completed" ? { completedAt: new Date() } : {}),
    })
    .where(eq(pickups.id, pickupId));

  // Sync order status based on pickup type & status
  if (pickup) {
    let newOrderStatus: string | null = null;

    if (pickup.type === "pickup") {
      if (status === "ongoing") newOrderStatus = "PICKUP_PROCESS";
      else if (status === "completed") newOrderStatus = "RECEIVED";
    } else if (pickup.type === "delivery") {
      if (status === "ongoing") newOrderStatus = "DELIVERING";
      else if (status === "completed") newOrderStatus = "COMPLETED";
    }

    if (newOrderStatus) {
      await updateOrderStatus(pickup.orderId, newOrderStatus);
    }
  }
}

// Adjust inventory stock
export async function adjustInventoryStock(input: {
  inventoryId: string;
  delta: number;
  reason: string;
}) {
  const tenantId = getCurrentTenantId();
  const [item] = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.id, input.inventoryId), eq(inventory.tenantId, tenantId)));
  if (!item) throw new Error("Item not found");

  const newStock = Math.max(0, item.stock + input.delta);
  await db
    .update(inventory)
    .set({ stock: newStock })
    .where(eq(inventory.id, input.inventoryId));

  return { stock: newStock };
}

// Create inventory item
export async function createInventoryItem(input: {
  name: string;
  category: string;
  unit: string;
  stock: number;
  minimumStock: number;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("inv");
  await db.insert(inventory).values({
    id,
    tenantId,
    name: input.name,
    category: input.category,
    unit: input.unit,
    stock: input.stock,
    minimumStock: input.minimumStock,
  });
  return { id };
}


// ============ BRANCHES CRUD ============
export async function createBranch(input: {
  name: string;
  address?: string;
  phone?: string;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("branch");
  await db.insert(branches).values({
    id,
    tenantId,
    name: input.name,
    address: input.address,
    phone: input.phone,
  });
  return { id };
}

export async function updateBranch(
  id: string,
  input: { name?: string; address?: string; phone?: string; isActive?: boolean }
) {
  const tenantId = getCurrentTenantId();
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.address !== undefined) updates.address = input.address;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.isActive !== undefined) updates.isActive = input.isActive;

  await db
    .update(branches)
    .set(updates as never)
    .where(and(eq(branches.id, id), eq(branches.tenantId, tenantId)));
}

export async function deleteBranch(id: string) {
  const tenantId = getCurrentTenantId();
  // Check if branch has orders
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(eq(orders.branchId, id), eq(orders.tenantId, tenantId)));
  if (Number(count) > 0) {
    throw new Error(`Cabang masih memiliki ${count} order. Hapus order dulu.`);
  }
  await db
    .delete(branches)
    .where(and(eq(branches.id, id), eq(branches.tenantId, tenantId)));
}

// ============ SERVICES UPDATE/DELETE ============
export async function updateService(
  id: string,
  input: {
    name?: string;
    category?: "regular" | "express" | "special";
    pricingType?: "per_kg" | "per_item" | "per_unit";
    price?: number;
    durationDays?: number;
    isActive?: boolean;
  }
) {
  const tenantId = getCurrentTenantId();
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.category !== undefined) updates.category = input.category;
  if (input.pricingType !== undefined) updates.pricingType = input.pricingType;
  if (input.price !== undefined) updates.price = input.price;
  if (input.durationDays !== undefined) updates.durationDays = input.durationDays;
  if (input.isActive !== undefined) updates.isActive = input.isActive;

  await db
    .update(services)
    .set(updates as never)
    .where(and(eq(services.id, id), eq(services.tenantId, tenantId)));
}

export async function deleteService(id: string) {
  const tenantId = getCurrentTenantId();
  // Soft delete
  await db
    .update(services)
    .set({ isActive: false })
    .where(and(eq(services.id, id), eq(services.tenantId, tenantId)));
}

// ============ CUSTOMERS UPDATE/DELETE ============
export async function getCustomerById(id: string) {
  const tenantId = getCurrentTenantId();
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
    .limit(1);
  if (!customer) return null;

  // Get orders history
  const customerOrders = await db
    .select({
      id: orders.id,
      invoice: orders.invoiceNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.customerId, id), eq(orders.tenantId, tenantId)))
    .orderBy(desc(orders.createdAt))
    .limit(20);

  return { ...customer, orders: customerOrders };
}

export async function updateCustomer(
  id: string,
  input: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
    tier?: "silver" | "gold" | "platinum";
    isBlacklisted?: boolean;
  }
) {
  const tenantId = getCurrentTenantId();
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.address !== undefined) updates.address = input.address;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.tier !== undefined) updates.tier = input.tier;
  if (input.isBlacklisted !== undefined) updates.isBlacklisted = input.isBlacklisted;

  await db
    .update(customers)
    .set(updates as never)
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));
}

export async function deleteCustomer(id: string) {
  const tenantId = getCurrentTenantId();
  // Check if customer has orders
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(eq(orders.customerId, id), eq(orders.tenantId, tenantId)));
  if (Number(count) > 0) {
    throw new Error(
      `Customer masih memiliki ${count} order. Gunakan blacklist daripada hapus.`
    );
  }
  await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));
}


// ============ INVENTORY UPDATE/DELETE ============
export async function updateInventoryItem(
  id: string,
  input: {
    name?: string;
    category?: string;
    unit?: string;
    minimumStock?: number;
  }
) {
  const tenantId = getCurrentTenantId();
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.category !== undefined) updates.category = input.category;
  if (input.unit !== undefined) updates.unit = input.unit;
  if (input.minimumStock !== undefined) updates.minimumStock = input.minimumStock;

  await db
    .update(inventory)
    .set(updates as never)
    .where(and(eq(inventory.id, id), eq(inventory.tenantId, tenantId)));
}

export async function deleteInventoryItem(id: string) {
  const tenantId = getCurrentTenantId();
  await db
    .delete(inventory)
    .where(and(eq(inventory.id, id), eq(inventory.tenantId, tenantId)));
}


// ============ STAFF / USERS CRUD ============
export async function createStaff(input: {
  name: string;
  email: string;
  phone?: string;
  role: "owner" | "admin" | "staff" | "driver";
  branchId?: string;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("usr");
  await db.insert(users).values({
    id,
    tenantId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: input.role,
    branchId: input.branchId,
    passwordHash: "$2b$10$default", // TODO: real password hashing
  });

  // If role is driver, also create driver entry
  if (input.role === "driver") {
    await db.insert(drivers).values({
      id: generateId("drv"),
      tenantId,
      userId: id,
      name: input.name,
      phone: input.phone,
    });
  }

  return { id };
}

export async function updateStaff(
  id: string,
  input: {
    name?: string;
    email?: string;
    phone?: string;
    role?: "owner" | "admin" | "staff" | "driver";
    branchId?: string;
    isActive?: boolean;
  }
) {
  const tenantId = getCurrentTenantId();
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.email !== undefined) updates.email = input.email;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.role !== undefined) updates.role = input.role;
  if (input.branchId !== undefined) updates.branchId = input.branchId;
  if (input.isActive !== undefined) updates.isActive = input.isActive;

  await db
    .update(users)
    .set(updates as never)
    .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));
}

export async function deleteStaff(id: string) {
  const tenantId = getCurrentTenantId();
  // Soft delete via deactivate
  await db
    .update(users)
    .set({ isActive: false })
    .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));
}


// ============ INVENTORY MOVEMENTS ============
import {
  inventoryMovements,
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
  expenses,
  expenseCategories,
} from "./schema";

export async function listInventoryMovements(opts?: {
  inventoryId?: string;
  limit?: number;
  type?: "in" | "out" | "adjustment";
}) {
  const tenantId = getCurrentTenantId();
  const conditions = [eq(inventoryMovements.tenantId, tenantId)];
  if (opts?.inventoryId) {
    conditions.push(eq(inventoryMovements.inventoryId, opts.inventoryId));
  }
  if (opts?.type) {
    conditions.push(eq(inventoryMovements.type, opts.type));
  }

  return db
    .select({
      id: inventoryMovements.id,
      inventoryId: inventoryMovements.inventoryId,
      type: inventoryMovements.type,
      quantity: inventoryMovements.quantity,
      unitCost: inventoryMovements.unitCost,
      totalCost: inventoryMovements.totalCost,
      reason: inventoryMovements.reason,
      reference: inventoryMovements.reference,
      notes: inventoryMovements.notes,
      createdAt: inventoryMovements.createdAt,
      inventoryName: inventory.name,
      inventoryUnit: inventory.unit,
    })
    .from(inventoryMovements)
    .leftJoin(inventory, eq(inventoryMovements.inventoryId, inventory.id))
    .where(and(...conditions))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(opts?.limit ?? 50);
}

// Override adjustInventoryStock to also create movement record
export async function adjustInventoryStockWithMovement(input: {
  inventoryId: string;
  delta: number;
  reason: string;
  unitCost?: number;
  reference?: string;
  notes?: string;
}) {
  const tenantId = getCurrentTenantId();
  const [item] = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.id, input.inventoryId), eq(inventory.tenantId, tenantId)));
  if (!item) throw new Error("Item not found");

  const newStock = Math.max(0, item.stock + input.delta);

  // Update stock
  await db
    .update(inventory)
    .set({ stock: newStock })
    .where(eq(inventory.id, input.inventoryId));

  // Record movement
  const movementId = generateId("mov");
  const quantity = Math.abs(input.delta);
  const unitCost = input.unitCost ?? 0;
  await db.insert(inventoryMovements).values({
    id: movementId,
    tenantId,
    inventoryId: input.inventoryId,
    type: input.delta > 0 ? "in" : "out",
    quantity,
    unitCost,
    totalCost: unitCost * quantity,
    reason: input.reason,
    reference: input.reference,
    notes: input.notes,
  });

  return { stock: newStock, movementId };
}

// ============ SUPPLIERS ============
export async function listSuppliers() {
  const tenantId = getCurrentTenantId();
  return db
    .select()
    .from(suppliers)
    .where(eq(suppliers.tenantId, tenantId))
    .orderBy(suppliers.name);
}

export async function createSupplier(input: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("sup");
  await db.insert(suppliers).values({
    id,
    tenantId,
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    contactPerson: input.contactPerson,
    notes: input.notes,
  });
  return { id };
}

export async function updateSupplier(
  id: string,
  input: Partial<{ name: string; phone: string; email: string; address: string; isActive: boolean }>
) {
  const tenantId = getCurrentTenantId();
  await db
    .update(suppliers)
    .set(input as never)
    .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)));
}

export async function deleteSupplier(id: string) {
  const tenantId = getCurrentTenantId();
  await db
    .delete(suppliers)
    .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)));
}

// ============ PURCHASE ORDERS ============
export async function listPurchaseOrders(opts?: { status?: string; limit?: number }) {
  const tenantId = getCurrentTenantId();
  const conditions = [eq(purchaseOrders.tenantId, tenantId)];
  if (opts?.status) {
    conditions.push(eq(purchaseOrders.status, opts.status as never));
  }

  return db
    .select({
      id: purchaseOrders.id,
      poNumber: purchaseOrders.poNumber,
      status: purchaseOrders.status,
      subtotal: purchaseOrders.subtotal,
      total: purchaseOrders.total,
      orderedAt: purchaseOrders.orderedAt,
      receivedAt: purchaseOrders.receivedAt,
      createdAt: purchaseOrders.createdAt,
      notes: purchaseOrders.notes,
      supplierId: purchaseOrders.supplierId,
      supplierName: suppliers.name,
      supplierPhone: suppliers.phone,
    })
    .from(purchaseOrders)
    .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
    .where(and(...conditions))
    .orderBy(desc(purchaseOrders.createdAt))
    .limit(opts?.limit ?? 50);
}

export async function getPurchaseOrderDetail(id: string) {
  const tenantId = getCurrentTenantId();
  const [po] = await db
    .select({
      id: purchaseOrders.id,
      poNumber: purchaseOrders.poNumber,
      status: purchaseOrders.status,
      subtotal: purchaseOrders.subtotal,
      discount: purchaseOrders.discount,
      tax: purchaseOrders.tax,
      total: purchaseOrders.total,
      notes: purchaseOrders.notes,
      orderedAt: purchaseOrders.orderedAt,
      receivedAt: purchaseOrders.receivedAt,
      createdAt: purchaseOrders.createdAt,
      supplierId: purchaseOrders.supplierId,
      supplierName: suppliers.name,
    })
    .from(purchaseOrders)
    .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
    .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenantId)));

  if (!po) return null;

  const items = await db
    .select()
    .from(purchaseOrderItems)
    .where(eq(purchaseOrderItems.purchaseOrderId, id));

  return { ...po, items };
}

export async function createPurchaseOrder(input: {
  supplierId?: string;
  items: { inventoryId: string; quantity: number; unitPrice: number }[];
  discount?: number;
  tax?: number;
  notes?: string;
}) {
  const tenantId = getCurrentTenantId();
  if (!input.items || input.items.length === 0) {
    throw new Error("Items required");
  }

  // Generate PO number
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.tenantId, tenantId));
  const poNumber = `PO-${datePart}-${String(Number(count) + 1).padStart(3, "0")}`;

  const poId = generateId("po");

  // Get inventory items
  const inventoryIds = input.items.map((i) => i.inventoryId);
  const items = await db
    .select()
    .from(inventory)
    .where(sql`${inventory.id} in ${inventoryIds}`);
  const itemMap = new Map(items.map((i) => [i.id, i]));

  // Calculate totals
  const subtotal = input.items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0
  );
  const discount = input.discount ?? 0;
  const tax = input.tax ?? 0;
  const total = subtotal - discount + tax;

  // Insert PO
  await db.insert(purchaseOrders).values({
    id: poId,
    tenantId,
    poNumber,
    supplierId: input.supplierId,
    status: "ordered",
    subtotal,
    discount,
    tax,
    total,
    notes: input.notes,
    orderedAt: new Date(),
  });

  // Insert items
  await db.insert(purchaseOrderItems).values(
    input.items.map((i) => {
      const inv = itemMap.get(i.inventoryId);
      return {
        id: generateId("poi"),
        purchaseOrderId: poId,
        inventoryId: i.inventoryId,
        itemName: inv?.name ?? "Unknown",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.quantity * i.unitPrice,
      };
    })
  );

  return { id: poId, poNumber, total };
}

export async function receivePurchaseOrder(id: string) {
  const tenantId = getCurrentTenantId();
  const [po] = await db
    .select()
    .from(purchaseOrders)
    .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenantId)));
  if (!po) throw new Error("PO not found");
  if (po.status === "received") throw new Error("PO already received");

  const items = await db
    .select()
    .from(purchaseOrderItems)
    .where(eq(purchaseOrderItems.purchaseOrderId, id));

  // For each item: add to stock + create movement
  for (const item of items) {
    const [inv] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, item.inventoryId));
    if (!inv) continue;

    await db
      .update(inventory)
      .set({ stock: inv.stock + item.quantity })
      .where(eq(inventory.id, item.inventoryId));

    await db.insert(inventoryMovements).values({
      id: generateId("mov"),
      tenantId,
      inventoryId: item.inventoryId,
      type: "in",
      quantity: item.quantity,
      unitCost: item.unitPrice,
      totalCost: item.total,
      reason: "purchase",
      reference: po.poNumber,
      purchaseOrderId: id,
    });

    await db
      .update(purchaseOrderItems)
      .set({ receivedQuantity: item.quantity })
      .where(eq(purchaseOrderItems.id, item.id));
  }

  await db
    .update(purchaseOrders)
    .set({ status: "received", receivedAt: new Date() })
    .where(eq(purchaseOrders.id, id));

  return { ok: true };
}

export async function cancelPurchaseOrder(id: string) {
  const tenantId = getCurrentTenantId();
  await db
    .update(purchaseOrders)
    .set({ status: "cancelled" })
    .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.tenantId, tenantId)));
}

// ============ EXPENSES ============
export async function listExpenseCategories() {
  const tenantId = getCurrentTenantId();
  return db
    .select()
    .from(expenseCategories)
    .where(
      and(eq(expenseCategories.tenantId, tenantId), eq(expenseCategories.isActive, true))
    )
    .orderBy(expenseCategories.name);
}

export async function listExpenses(opts?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  limit?: number;
}) {
  const tenantId = getCurrentTenantId();
  const conditions = [eq(expenses.tenantId, tenantId)];

  if (opts?.startDate) {
    conditions.push(
      sql`${expenses.expenseDate} >= ${Math.floor(opts.startDate.getTime() / 1000)}`
    );
  }
  if (opts?.endDate) {
    conditions.push(
      sql`${expenses.expenseDate} <= ${Math.floor(opts.endDate.getTime() / 1000)}`
    );
  }
  if (opts?.categoryId) {
    conditions.push(eq(expenses.categoryId, opts.categoryId));
  }

  return db
    .select({
      id: expenses.id,
      title: expenses.title,
      amount: expenses.amount,
      paymentMethod: expenses.paymentMethod,
      vendor: expenses.vendor,
      notes: expenses.notes,
      expenseDate: expenses.expenseDate,
      createdAt: expenses.createdAt,
      branchId: expenses.branchId,
      branchName: branches.name,
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.name,
      categoryColor: expenseCategories.color,
      categoryIcon: expenseCategories.icon,
    })
    .from(expenses)
    .leftJoin(branches, eq(expenses.branchId, branches.id))
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(and(...conditions))
    .orderBy(desc(expenses.expenseDate))
    .limit(opts?.limit ?? 100);
}

export async function createExpense(input: {
  title: string;
  amount: number;
  categoryId?: string;
  branchId?: string;
  paymentMethod?: "cash" | "transfer" | "qris" | "ewallet" | "other";
  vendor?: string;
  notes?: string;
  expenseDate: Date;
}) {
  const tenantId = getCurrentTenantId();
  const id = generateId("exp");
  await db.insert(expenses).values({
    id,
    tenantId,
    title: input.title,
    amount: input.amount,
    categoryId: input.categoryId,
    branchId: input.branchId,
    paymentMethod: input.paymentMethod ?? "cash",
    vendor: input.vendor,
    notes: input.notes,
    expenseDate: input.expenseDate,
  });
  return { id };
}

export async function updateExpense(
  id: string,
  input: Partial<{
    title: string;
    amount: number;
    categoryId: string;
    branchId: string;
    paymentMethod: "cash" | "transfer" | "qris" | "ewallet" | "other";
    vendor: string;
    notes: string;
    expenseDate: Date;
  }>
) {
  const tenantId = getCurrentTenantId();
  await db
    .update(expenses)
    .set(input as never)
    .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));
}

export async function deleteExpense(id: string) {
  const tenantId = getCurrentTenantId();
  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));
}

export async function getExpenseSummary(opts?: { startDate?: Date; endDate?: Date }) {
  const tenantId = getCurrentTenantId();
  const conditions = [eq(expenses.tenantId, tenantId)];
  if (opts?.startDate) {
    conditions.push(
      sql`${expenses.expenseDate} >= ${Math.floor(opts.startDate.getTime() / 1000)}`
    );
  }
  if (opts?.endDate) {
    conditions.push(
      sql`${expenses.expenseDate} <= ${Math.floor(opts.endDate.getTime() / 1000)}`
    );
  }

  const [totals] = await db
    .select({
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(expenses)
    .where(and(...conditions));

  const byCategory = await db
    .select({
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.name,
      categoryColor: expenseCategories.color,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(and(...conditions))
    .groupBy(expenses.categoryId);

  return {
    total: Number(totals?.total ?? 0),
    count: Number(totals?.count ?? 0),
    byCategory: byCategory.map((c) => ({
      categoryId: c.categoryId,
      name: c.categoryName ?? "Uncategorized",
      color: c.categoryColor ?? "#94a3b8",
      total: Number(c.total),
      count: Number(c.count),
    })),
  };
}

// ============ COMPREHENSIVE P&L REPORT ============
export async function getProfitAndLoss(opts: { startDate: Date; endDate: Date }) {
  const tenantId = getCurrentTenantId();
  const start = Math.floor(opts.startDate.getTime() / 1000);
  const end = Math.floor(opts.endDate.getTime() / 1000);

  // Revenue from paid orders
  const [revenue] = await db
    .select({
      total: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.paymentStatus, "paid"),
        sql`${orders.createdAt} between ${start} and ${end}`
      )
    );

  // COGS - inventory used (out movements with cost)
  const [cogs] = await db
    .select({
      total: sql<number>`coalesce(sum(${inventoryMovements.totalCost}), 0)`,
    })
    .from(inventoryMovements)
    .where(
      and(
        eq(inventoryMovements.tenantId, tenantId),
        eq(inventoryMovements.type, "out"),
        sql`${inventoryMovements.createdAt} between ${start} and ${end}`
      )
    );

  // Operating expenses
  const [opex] = await db
    .select({
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        sql`${expenses.expenseDate} between ${start} and ${end}`
      )
    );

  // Expenses by category
  const expensesByCategory = await db
    .select({
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.name,
      categoryColor: expenseCategories.color,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        sql`${expenses.expenseDate} between ${start} and ${end}`
      )
    )
    .groupBy(expenses.categoryId);

  // Revenue by service
  const revenueByService = await db
    .select({
      serviceName: orderItems.serviceName,
      total: sql<number>`coalesce(sum(${orderItems.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.paymentStatus, "paid"),
        sql`${orders.createdAt} between ${start} and ${end}`
      )
    )
    .groupBy(orderItems.serviceName);

  const totalRevenue = Number(revenue?.total ?? 0);
  const totalCOGS = Number(cogs?.total ?? 0);
  const totalOPEX = Number(opex?.total ?? 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalOPEX;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    revenue: totalRevenue,
    revenueCount: Number(revenue?.count ?? 0),
    cogs: totalCOGS,
    grossProfit,
    grossMargin,
    opex: totalOPEX,
    netProfit,
    netMargin,
    expensesByCategory: expensesByCategory.map((c) => ({
      name: c.categoryName ?? "Lain-lain",
      color: c.categoryColor ?? "#94a3b8",
      total: Number(c.total),
    })),
    revenueByService: revenueByService.map((s) => ({
      name: s.serviceName,
      total: Number(s.total),
      count: Number(s.count),
    })),
  };
}
