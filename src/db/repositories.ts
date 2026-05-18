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
    .select({ total: orders.total })
    .from(orders)
    .where(eq(orders.id, input.orderId));

  if (!order) throw new Error("Order not found");

  const status = Number(paid) >= order.total ? "paid" : "partial";
  await db
    .update(orders)
    .set({ paymentStatus: status, updatedAt: new Date() })
    .where(eq(orders.id, input.orderId));

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

// Update pickup status
export async function updatePickupStatus(
  pickupId: string,
  status: "scheduled" | "ongoing" | "completed" | "cancelled"
) {
  await db
    .update(pickups)
    .set({
      status,
      ...(status === "completed" ? { completedAt: new Date() } : {}),
    })
    .where(eq(pickups.id, pickupId));
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
