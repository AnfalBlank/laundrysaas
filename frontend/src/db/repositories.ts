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

  return {
    total: Number(total?.count ?? 0),
    vip: Number(vip?.count ?? 0),
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
