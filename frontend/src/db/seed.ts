import { db } from "./client";
import {
  tenants,
  branches,
  users,
  customers,
  services,
  orders,
  orderItems,
  payments,
  drivers,
  pickups,
  inventory,
  whatsappTemplates,
} from "./schema";

const tenantId = "tenant_laundrysukses";
const branchPusatId = "branch_pusat";
const branchSelatanId = "branch_selatan";
const branchUtaraId = "branch_utara";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function daysAgo(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt;
}

function hoursFromNow(h: number) {
  const dt = new Date();
  dt.setHours(dt.getHours() + h);
  return dt;
}

async function main() {
  console.log("🧹 Clearing existing data...");
  // Order matters because of FK constraints
  await db.delete(payments);
  await db.delete(pickups);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(drivers);
  await db.delete(inventory);
  await db.delete(whatsappTemplates);
  await db.delete(services);
  await db.delete(customers);
  await db.delete(users);
  await db.delete(branches);
  await db.delete(tenants);

  console.log("🌱 Seeding tenants...");
  await db.insert(tenants).values({
    id: tenantId,
    name: "Laundry Sukses",
    subdomain: "laundrysukses",
    plan: "pro",
    planExpiresAt: new Date("2026-06-12"),
    primaryColor: "#2563eb",
  });

  console.log("🏠 Seeding branches...");
  await db.insert(branches).values([
    { id: branchPusatId, tenantId, name: "Cabang Pusat", address: "Jl. Sudirman No. 12, Jakarta", phone: "021-1111-2222" },
    { id: branchSelatanId, tenantId, name: "Cabang Selatan", address: "Jl. Kemang Raya 88, Jakarta", phone: "021-3333-4444" },
    { id: branchUtaraId, tenantId, name: "Cabang Utara", address: "Jl. Boulevard 21, Jakarta", phone: "021-5555-6666" },
  ]);

  console.log("👥 Seeding users...");
  await db.insert(users).values([
    { id: uid("usr"), tenantId, branchId: branchPusatId, name: "Pak Joko", email: "owner@laundrysukses.id", passwordHash: "$2b$10$dummy", role: "owner", phone: "0812-1111-2222" },
    { id: uid("usr"), tenantId, branchId: branchPusatId, name: "Mba Rina", email: "rina@laundrysukses.id", passwordHash: "$2b$10$dummy", role: "admin", phone: "0813-2222-3333" },
    { id: uid("usr"), tenantId, branchId: branchSelatanId, name: "Mba Sinta", email: "sinta@laundrysukses.id", passwordHash: "$2b$10$dummy", role: "admin", phone: "0857-3333-4444" },
    { id: uid("usr"), tenantId, branchId: branchPusatId, name: "Pak Budi", email: "budi@laundrysukses.id", passwordHash: "$2b$10$dummy", role: "staff", phone: "0852-4444-5555" },
    { id: uid("usr"), tenantId, branchId: branchPusatId, name: "Mba Lia", email: "lia@laundrysukses.id", passwordHash: "$2b$10$dummy", role: "staff", phone: "0838-5555-6666" },
  ]);

  console.log("🚚 Seeding drivers...");
  const drvAnto = uid("drv");
  const drvJoko = uid("drv");
  const drvRudi = uid("drv");
  const drvEdi = uid("drv");
  await db.insert(drivers).values([
    { id: drvAnto, tenantId, name: "Pak Anto", phone: "0812-1111-2222", vehicleType: "Motor", vehiclePlate: "B 1234 ABC" },
    { id: drvJoko, tenantId, name: "Pak Joko Driver", phone: "0813-3333-4444", vehicleType: "Motor", vehiclePlate: "B 5678 DEF" },
    { id: drvRudi, tenantId, name: "Pak Rudi", phone: "0852-5555-6666", vehicleType: "Motor", vehiclePlate: "B 9012 GHI" },
    { id: drvEdi, tenantId, name: "Pak Edi", phone: "0857-7777-8888", vehicleType: "Mobil", vehiclePlate: "B 3456 JKL", isActive: false },
  ]);

  console.log("👤 Seeding customers...");
  const custAndi = uid("cst");
  const custSiti = uid("cst");
  const custBudi = uid("cst");
  const custMaya = uid("cst");
  const custDimas = uid("cst");
  const custRina = uid("cst");
  const custHendra = uid("cst");
  const custLisa = uid("cst");
  await db.insert(customers).values([
    { id: custAndi, tenantId, name: "Andi Pratama", phone: "0812-3456-7890", address: "Jl. Sudirman No. 12, Jakarta", tier: "gold", points: 1620, totalOrders: 42, totalSpending: 1620000 },
    { id: custSiti, tenantId, name: "Siti Nurhaliza", phone: "0813-9876-5432", address: "Jl. Melati Blok A2, Bandung", tier: "platinum", points: 4280, totalOrders: 88, totalSpending: 4280000 },
    { id: custBudi, tenantId, name: "Budi Santoso", phone: "0857-1122-3344", address: "Jl. Kenanga No. 5, Bekasi", tier: "silver", points: 480, totalOrders: 12, totalSpending: 480000 },
    { id: custMaya, tenantId, name: "Maya Putri", phone: "0821-4455-6677", address: "Jl. Anggrek 17, Jakarta", tier: "gold", points: 980, totalOrders: 26, totalSpending: 980000 },
    { id: custDimas, tenantId, name: "Dimas Anggara", phone: "0838-7788-9900", address: "Jl. Mawar 22, Jakarta Utara", tier: "silver", points: 320, totalOrders: 9, totalSpending: 320000 },
    { id: custRina, tenantId, name: "Rina Marlina", phone: "0813-3344-5566", address: "Jl. Cendana 8, Jakarta", tier: "platinum", points: 6240, totalOrders: 102, totalSpending: 6240000 },
    { id: custHendra, tenantId, name: "Hendra Wijaya", phone: "0852-9988-7766", address: "Jl. Kenanga No. 5, Bekasi", tier: "silver", points: 240, totalOrders: 8, totalSpending: 240000 },
    { id: custLisa, tenantId, name: "Lisa Aminah", phone: "0878-1234-5678", address: "Jl. Tulip 11, Jakarta", tier: "gold", points: 1240, totalOrders: 32, totalSpending: 1240000 },
  ]);

  console.log("🧺 Seeding services...");
  const svcCS = uid("svc");
  const svcCK = uid("svc");
  const svcSS = uid("svc");
  const svcExpressCS = uid("svc");
  const svcSepatu = uid("svc");
  const svcSepatuPremium = uid("svc");
  const svcKarpet = uid("svc");
  const svcBedCover = uid("svc");
  const svcBoneka = uid("svc");
  await db.insert(services).values([
    { id: svcCS, tenantId, name: "Cuci Setrika", category: "regular", pricingType: "per_kg", price: 7000, durationDays: 2 },
    { id: svcCK, tenantId, name: "Cuci Kering", category: "regular", pricingType: "per_kg", price: 5000, durationDays: 2 },
    { id: svcSS, tenantId, name: "Setrika Saja", category: "regular", pricingType: "per_kg", price: 5000, durationDays: 1 },
    { id: svcExpressCS, tenantId, name: "Express Cuci Setrika", category: "express", pricingType: "per_kg", price: 12000, durationDays: 1 },
    { id: svcSepatu, tenantId, name: "Sepatu Reguler", category: "special", pricingType: "per_unit", price: 25000, durationDays: 3 },
    { id: svcSepatuPremium, tenantId, name: "Sepatu Premium", category: "special", pricingType: "per_unit", price: 45000, durationDays: 4 },
    { id: svcKarpet, tenantId, name: "Karpet", category: "special", pricingType: "per_unit", price: 15000, durationDays: 3 },
    { id: svcBedCover, tenantId, name: "Bed Cover", category: "special", pricingType: "per_item", price: 30000, durationDays: 2 },
    { id: svcBoneka, tenantId, name: "Boneka Besar", category: "special", pricingType: "per_item", price: 35000, durationDays: 3 },
  ]);

  console.log("📦 Seeding orders...");
  const ord1 = uid("ord");
  const ord2 = uid("ord");
  const ord3 = uid("ord");
  const ord4 = uid("ord");
  const ord5 = uid("ord");
  const ord6 = uid("ord");
  const ord7 = uid("ord");
  const ord8 = uid("ord");
  await db.insert(orders).values([
    { id: ord1, tenantId, branchId: branchPusatId, customerId: custAndi, invoiceNumber: "INV-20240517-001", status: "WASHING", paymentStatus: "paid", pickupType: "pickup", weight: 5.2, subtotal: 36000, total: 36000, estimatedAt: hoursFromNow(48) },
    { id: ord2, tenantId, branchId: branchPusatId, customerId: custSiti, invoiceNumber: "INV-20240517-002", status: "READY_DELIVERY", paymentStatus: "paid", pickupType: "pickup", isExpress: true, weight: 3.0, subtotal: 30000, total: 30000, estimatedAt: hoursFromNow(8) },
    { id: ord3, tenantId, branchId: branchSelatanId, customerId: custBudi, invoiceNumber: "INV-20240517-003", status: "DRYING", paymentStatus: "unpaid", pickupType: "walk_in", subtotal: 50000, total: 50000, estimatedAt: hoursFromNow(72) },
    { id: ord4, tenantId, branchId: branchPusatId, customerId: custMaya, invoiceNumber: "INV-20240517-004", status: "IRONING", paymentStatus: "paid", pickupType: "walk_in", weight: 4.5, subtotal: 60000, total: 60000, estimatedAt: hoursFromNow(36) },
    { id: ord5, tenantId, branchId: branchUtaraId, customerId: custDimas, invoiceNumber: "INV-20240517-005", status: "WAITING_PICKUP", paymentStatus: "unpaid", pickupType: "pickup", weight: 7.8, subtotal: 54000, total: 54000, estimatedAt: hoursFromNow(72) },
    { id: ord6, tenantId, branchId: branchPusatId, customerId: custRina, invoiceNumber: "INV-20240517-006", status: "COMPLETED", paymentStatus: "paid", pickupType: "pickup", weight: 12.0, subtotal: 180000, total: 180000, completedAt: daysAgo(0) },
    { id: ord7, tenantId, branchId: branchSelatanId, customerId: custHendra, invoiceNumber: "INV-20240517-007", status: "PICKUP_PROCESS", paymentStatus: "unpaid", pickupType: "pickup", weight: 6.0, subtotal: 36000, total: 36000, estimatedAt: hoursFromNow(72) },
    { id: ord8, tenantId, branchId: branchPusatId, customerId: custLisa, invoiceNumber: "INV-20240517-008", status: "PACKING", paymentStatus: "paid", pickupType: "walk_in", isExpress: true, weight: 2.5, subtotal: 25000, total: 25000, estimatedAt: hoursFromNow(10) },
  ]);

  console.log("📋 Seeding order items...");
  await db.insert(orderItems).values([
    { id: uid("itm"), orderId: ord1, serviceId: svcCS, serviceName: "Cuci Setrika", qty: 5.2, pricePerUnit: 7000, total: 36000 },
    { id: uid("itm"), orderId: ord2, serviceId: svcExpressCS, serviceName: "Express Cuci Kering", qty: 3.0, pricePerUnit: 10000, total: 30000 },
    { id: uid("itm"), orderId: ord3, serviceId: svcSepatu, serviceName: "Sepatu Reguler", qty: 2, pricePerUnit: 25000, total: 50000 },
    { id: uid("itm"), orderId: ord4, serviceId: svcBedCover, serviceName: "Bed Cover", qty: 2, pricePerUnit: 30000, total: 60000 },
    { id: uid("itm"), orderId: ord5, serviceId: svcCS, serviceName: "Cuci Setrika", qty: 7.8, pricePerUnit: 7000, total: 54000 },
    { id: uid("itm"), orderId: ord6, serviceId: svcKarpet, serviceName: "Karpet", qty: 12, pricePerUnit: 15000, total: 180000 },
    { id: uid("itm"), orderId: ord7, serviceId: svcCK, serviceName: "Cuci Kering", qty: 6.0, pricePerUnit: 6000, total: 36000 },
    { id: uid("itm"), orderId: ord8, serviceId: svcExpressCS, serviceName: "Express Setrika", qty: 2.5, pricePerUnit: 10000, total: 25000 },
  ]);

  console.log("💳 Seeding payments...");
  await db.insert(payments).values([
    { id: uid("pay"), orderId: ord1, amount: 36000, method: "qris" },
    { id: uid("pay"), orderId: ord2, amount: 30000, method: "qris" },
    { id: uid("pay"), orderId: ord4, amount: 60000, method: "transfer" },
    { id: uid("pay"), orderId: ord6, amount: 180000, method: "cash" },
    { id: uid("pay"), orderId: ord8, amount: 25000, method: "ewallet" },
  ]);

  console.log("🛵 Seeding pickups...");
  await db.insert(pickups).values([
    { id: uid("pck"), tenantId, orderId: ord5, driverId: drvAnto, type: "pickup", status: "scheduled", address: "Jl. Mawar 22, Jakarta Utara", scheduledAt: hoursFromNow(2) },
    { id: uid("pck"), tenantId, orderId: ord2, driverId: drvJoko, type: "delivery", status: "scheduled", address: "Jl. Melati Blok A2, Bandung", scheduledAt: hoursFromNow(7) },
    { id: uid("pck"), tenantId, orderId: ord7, driverId: drvRudi, type: "pickup", status: "ongoing", address: "Jl. Kenanga No. 5, Bekasi", scheduledAt: hoursFromNow(1) },
    { id: uid("pck"), tenantId, orderId: ord6, driverId: drvAnto, type: "delivery", status: "completed", address: "Jl. Cendana 8, Jakarta", scheduledAt: daysAgo(0), completedAt: daysAgo(0) },
  ]);

  console.log("📦 Seeding inventory...");
  await db.insert(inventory).values([
    { id: uid("inv"), tenantId, name: "Detergent Premium", category: "Sabun", stock: 28, minimumStock: 10, unit: "kg" },
    { id: uid("inv"), tenantId, name: "Pewangi Lavender", category: "Parfum", stock: 4, minimumStock: 5, unit: "L" },
    { id: uid("inv"), tenantId, name: "Pewangi Sakura", category: "Parfum", stock: 12, minimumStock: 5, unit: "L" },
    { id: uid("inv"), tenantId, name: "Plastik Packing 60x80", category: "Packaging", stock: 320, minimumStock: 100, unit: "pcs" },
    { id: uid("inv"), tenantId, name: "Hanger Plastik", category: "Packaging", stock: 86, minimumStock: 50, unit: "pcs" },
    { id: uid("inv"), tenantId, name: "Pemutih Pakaian", category: "Chemical", stock: 6, minimumStock: 8, unit: "L" },
  ]);

  console.log("💬 Seeding WhatsApp templates...");
  await db.insert(whatsappTemplates).values([
    { id: uid("tpl"), tenantId, key: "order_received", name: "Order Diterima", body: "Halo {customer}, order laundry Anda dengan invoice {invoice} telah kami terima. Estimasi selesai {estimated}.", sentCount: 1842 },
    { id: uid("tpl"), tenantId, key: "pickup_driver", name: "Pickup Driver", body: "Halo {customer}, driver {driver} sedang menuju lokasi pickup Anda.", sentCount: 824 },
    { id: uid("tpl"), tenantId, key: "laundry_done", name: "Laundry Selesai", body: "Halo {customer}, laundry Anda dengan invoice {invoice} sudah selesai.", sentCount: 1284 },
    { id: uid("tpl"), tenantId, key: "reminder_unclaimed", name: "Reminder Belum Diambil", body: "Halo {customer}, laundry Anda belum diambil selama 3 hari.", sentCount: 142 },
    { id: uid("tpl"), tenantId, key: "promo_broadcast", name: "Promo Broadcast", body: "Promo spesial untuk Anda!", sentCount: 4280 },
    { id: uid("tpl"), tenantId, key: "invoice_send", name: "Invoice Customer", body: "Berikut invoice Anda: {invoice}.", sentCount: 1842 },
  ]);

  console.log("✅ Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
