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
  // Messaging channel preference
  messagingChannel: text("messaging_channel", {
    enum: ["whatsapp", "telegram"],
  })
    .notNull()
    .default("whatsapp"),
  whatsappNumber: text("whatsapp_number"),
  whatsappToken: text("whatsapp_token"),
  telegramBotToken: text("telegram_bot_token"),
  telegramBotUsername: text("telegram_bot_username"),
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
    telegramChatId: text("telegram_chat_id"),
    telegramUsername: text("telegram_username"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("customers_tenant_idx").on(t.tenantId),
    phoneIdx: index("customers_phone_idx").on(t.tenantId, t.phone),
    telegramIdx: index("customers_telegram_idx").on(t.telegramChatId),
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


// === INVENTORY MOVEMENTS (track every stock change) ===
export const inventoryMovements = sqliteTable(
  "inventory_movements",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    inventoryId: text("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["in", "out", "adjustment"] }).notNull(),
    quantity: real("quantity").notNull(),
    unitCost: integer("unit_cost").default(0),
    totalCost: integer("total_cost").default(0),
    reason: text("reason"),
    reference: text("reference"),
    purchaseOrderId: text("purchase_order_id"),
    orderId: text("order_id"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("inv_mov_tenant_idx").on(t.tenantId),
    invIdx: index("inv_mov_inv_idx").on(t.inventoryId),
    typeIdx: index("inv_mov_type_idx").on(t.tenantId, t.type),
  })
);

// === SUPPLIERS ===
export const suppliers = sqliteTable(
  "suppliers",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    contactPerson: text("contact_person"),
    notes: text("notes"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("suppliers_tenant_idx").on(t.tenantId),
  })
);

// === PURCHASE ORDERS ===
export const purchaseOrders = sqliteTable(
  "purchase_orders",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id").references(() => suppliers.id),
    poNumber: text("po_number").notNull(),
    status: text("status", {
      enum: ["draft", "ordered", "partial", "received", "cancelled"],
    })
      .notNull()
      .default("draft"),
    subtotal: integer("subtotal").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    tax: integer("tax").notNull().default(0),
    total: integer("total").notNull().default(0),
    notes: text("notes"),
    orderedAt: integer("ordered_at", { mode: "timestamp" }),
    receivedAt: integer("received_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("po_tenant_idx").on(t.tenantId),
    statusIdx: index("po_status_idx").on(t.tenantId, t.status),
  })
);

export const purchaseOrderItems = sqliteTable(
  "purchase_order_items",
  {
    id: text("id").primaryKey(),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),
    inventoryId: text("inventory_id")
      .notNull()
      .references(() => inventory.id),
    itemName: text("item_name").notNull(),
    quantity: real("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    total: integer("total").notNull(),
    receivedQuantity: real("received_quantity").default(0),
  },
  (t) => ({
    poIdx: index("po_items_po_idx").on(t.purchaseOrderId),
  })
);

// === EXPENSES ===
export const expenseCategories = sqliteTable(
  "expense_categories",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon"),
    color: text("color").default("#64748b"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => ({
    tenantIdx: index("exp_cat_tenant_idx").on(t.tenantId),
  })
);

export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    branchId: text("branch_id").references(() => branches.id),
    categoryId: text("category_id").references(() => expenseCategories.id),
    title: text("title").notNull(),
    amount: integer("amount").notNull(),
    paymentMethod: text("payment_method", {
      enum: ["cash", "transfer", "qris", "ewallet", "other"],
    })
      .notNull()
      .default("cash"),
    vendor: text("vendor"),
    receiptUrl: text("receipt_url"),
    notes: text("notes"),
    expenseDate: integer("expense_date", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("expenses_tenant_idx").on(t.tenantId),
    dateIdx: index("expenses_date_idx").on(t.tenantId, t.expenseDate),
    categoryIdx: index("expenses_cat_idx").on(t.categoryId),
  })
);

// Type exports
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;


// === NOTIFICATIONS (persistent in-app notifications) ===
export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["order", "payment", "stock", "pickup", "system", "marketing"],
    })
      .notNull()
      .default("system"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("notif_tenant_idx").on(t.tenantId),
    userIdx: index("notif_user_idx").on(t.userId, t.isRead),
  })
);

// === MARKETING CAMPAIGNS ===
export const campaigns = sqliteTable(
  "campaigns",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    segment: text("segment"),
    channel: text("channel", { enum: ["whatsapp", "telegram", "email", "sms"] })
      .notNull()
      .default("whatsapp"),
    body: text("body").notNull(),
    status: text("status", {
      enum: ["draft", "scheduled", "sending", "sent", "cancelled"],
    })
      .notNull()
      .default("draft"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
    sentAt: integer("sent_at", { mode: "timestamp" }),
    recipientCount: integer("recipient_count").notNull().default(0),
    deliveredCount: integer("delivered_count").notNull().default(0),
    readCount: integer("read_count").notNull().default(0),
    conversionCount: integer("conversion_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("campaigns_tenant_idx").on(t.tenantId),
    statusIdx: index("campaigns_status_idx").on(t.tenantId, t.status),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;


// === TENANT SECURITY SETTINGS ===
export const tenantSecuritySettings = sqliteTable("tenant_security_settings", {
  tenantId: text("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" }).notNull().default(true),
  auditLogEnabled: integer("audit_log_enabled", { mode: "boolean" }).notNull().default(true),
  ipWhitelistEnabled: integer("ip_whitelist_enabled", { mode: "boolean" }).notNull().default(false),
  sessionTimeoutEnabled: integer("session_timeout_enabled", { mode: "boolean" }).notNull().default(true),
  sessionTimeoutMinutes: integer("session_timeout_minutes").notNull().default(60),
  ipWhitelist: text("ip_whitelist"), // JSON array
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type TenantSecuritySettings = typeof tenantSecuritySettings.$inferSelect;


// === MESSAGES (chat history per customer) ===
export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "cascade" }),
    direction: text("direction", { enum: ["incoming", "outgoing"] }).notNull(),
    channel: text("channel", { enum: ["whatsapp", "telegram"] }).notNull().default("telegram"),
    body: text("body").notNull(),
    isBot: integer("is_bot", { mode: "boolean" }).notNull().default(false),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tenantIdx: index("messages_tenant_idx").on(t.tenantId),
    customerIdx: index("messages_customer_idx").on(t.customerId, t.createdAt),
  })
);

export type Message = typeof messages.$inferSelect;
