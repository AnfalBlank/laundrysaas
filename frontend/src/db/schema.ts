import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * LaundryHub multi-tenant SaaS schema (Turso/libSQL).
 * All tenant-scoped tables include `tenantId` for isolation.
 */

// === TENANTS / SAAS LEVEL ===
export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  customDomain: text("custom_domain"),
  plan: text("plan", { enum: ["basic", "pro", "enterprise"] })
    .notNull()
    .default("basic"),
  planExpiresAt: integer("plan_expires_at", { mode: "timestamp" }),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// === BRANCHES ===
export const branches = sqliteTable(
  "branches",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address"),
    phone: text("phone"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("branches_tenant_idx").on(t.tenantId),
  })
);

// === USERS / STAFF ===
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    branchId: text("branch_id").references(() => branches.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", {
      enum: ["owner", "admin", "staff", "driver"],
    })
      .notNull()
      .default("staff"),
    phone: text("phone"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("users_tenant_idx").on(t.tenantId),
    emailIdx: index("users_email_idx").on(t.tenantId, t.email),
  })
);

// === CUSTOMERS ===
export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    address: text("address"),
    notes: text("notes"),
    tier: text("tier", { enum: ["silver", "gold", "platinum"] })
      .notNull()
      .default("silver"),
    points: integer("points").notNull().default(0),
    totalOrders: integer("total_orders").notNull().default(0),
    totalSpending: integer("total_spending").notNull().default(0),
    isBlacklisted: integer("is_blacklisted", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("customers_tenant_idx").on(t.tenantId),
    phoneIdx: index("customers_phone_idx").on(t.tenantId, t.phone),
  })
);

// === SERVICES (pricing) ===
export const services = sqliteTable(
  "services",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category", {
      enum: ["regular", "express", "special"],
    })
      .notNull()
      .default("regular"),
    pricingType: text("pricing_type", {
      enum: ["per_kg", "per_item", "per_unit"],
    })
      .notNull()
      .default("per_kg"),
    price: integer("price").notNull(),
    durationDays: integer("duration_days").notNull().default(2),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("services_tenant_idx").on(t.tenantId),
  })
);

// === ORDERS ===
export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    branchId: text("branch_id").references(() => branches.id),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    invoiceNumber: text("invoice_number").notNull(),
    status: text("status", {
      enum: [
        "WAITING_PICKUP",
        "PICKUP_PROCESS",
        "RECEIVED",
        "WASHING",
        "DRYING",
        "IRONING",
        "PACKING",
        "READY_DELIVERY",
        "DELIVERING",
        "COMPLETED",
        "CANCELLED",
      ],
    })
      .notNull()
      .default("RECEIVED"),
    paymentStatus: text("payment_status", {
      enum: ["unpaid", "partial", "paid"],
    })
      .notNull()
      .default("unpaid"),
    pickupType: text("pickup_type", { enum: ["walk_in", "pickup"] })
      .notNull()
      .default("walk_in"),
    pickupAddress: text("pickup_address"),
    deliveryAddress: text("delivery_address"),
    isExpress: integer("is_express", { mode: "boolean" })
      .notNull()
      .default(false),
    notes: text("notes"),
    weight: real("weight"),
    subtotal: integer("subtotal").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull().default(0),
    estimatedAt: integer("estimated_at", { mode: "timestamp" }),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("orders_tenant_idx").on(t.tenantId),
    statusIdx: index("orders_status_idx").on(t.tenantId, t.status),
    invoiceIdx: index("orders_invoice_idx").on(t.tenantId, t.invoiceNumber),
    customerIdx: index("orders_customer_idx").on(t.customerId),
  })
);

// === ORDER ITEMS ===
export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    serviceName: text("service_name").notNull(),
    qty: real("qty").notNull().default(1),
    pricePerUnit: integer("price_per_unit").notNull(),
    total: integer("total").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  })
);

// === PAYMENTS ===
export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    method: text("method", {
      enum: ["cash", "transfer", "qris", "ewallet", "other"],
    })
      .notNull()
      .default("cash"),
    reference: text("reference"),
    paidAt: integer("paid_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    orderIdx: index("payments_order_idx").on(t.orderId),
  })
);

// === DRIVERS ===
export const drivers = sqliteTable(
  "drivers",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id),
    name: text("name").notNull(),
    phone: text("phone"),
    vehicleType: text("vehicle_type"),
    vehiclePlate: text("vehicle_plate"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => ({
    tenantIdx: index("drivers_tenant_idx").on(t.tenantId),
  })
);

// === PICKUPS / DELIVERIES ===
export const pickups = sqliteTable(
  "pickups",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    driverId: text("driver_id").references(() => drivers.id),
    type: text("type", { enum: ["pickup", "delivery"] })
      .notNull()
      .default("pickup"),
    status: text("status", {
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
    })
      .notNull()
      .default("scheduled"),
    address: text("address"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    proofUrl: text("proof_url"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("pickups_tenant_idx").on(t.tenantId),
    statusIdx: index("pickups_status_idx").on(t.tenantId, t.status),
  })
);

// === INVENTORY ===
export const inventory = sqliteTable(
  "inventory",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    unit: text("unit").notNull(),
    stock: real("stock").notNull().default(0),
    minimumStock: real("minimum_stock").notNull().default(0),
  },
  (t) => ({
    tenantIdx: index("inventory_tenant_idx").on(t.tenantId),
  })
);

// === WHATSAPP / NOTIFICATIONS ===
export const whatsappTemplates = sqliteTable(
  "whatsapp_templates",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    body: text("body").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sentCount: integer("sent_count").notNull().default(0),
  },
  (t) => ({
    tenantIdx: index("wa_tpl_tenant_idx").on(t.tenantId),
  })
);

export type Tenant = typeof tenants.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Pickup = typeof pickups.$inferSelect;
export type InventoryItem = typeof inventory.$inferSelect;
export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;

export type NewOrder = typeof orders.$inferInsert;
export type NewCustomer = typeof customers.$inferInsert;
export type NewPickup = typeof pickups.$inferInsert;
