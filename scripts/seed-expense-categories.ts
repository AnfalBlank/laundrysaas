import { db } from "../src/db/client";
import { expenseCategories } from "../src/db/schema";
import { eq } from "drizzle-orm";

const TENANT_ID = "tenant_laundrysukses";

const categories = [
  { id: "exp_cat_gaji", name: "Gaji & Tunjangan", icon: "users", color: "#3b82f6" },
  { id: "exp_cat_sewa", name: "Sewa Tempat", icon: "home", color: "#8b5cf6" },
  { id: "exp_cat_listrik", name: "Listrik & Air", icon: "zap", color: "#f59e0b" },
  { id: "exp_cat_internet", name: "Internet & Telepon", icon: "wifi", color: "#06b6d4" },
  { id: "exp_cat_bahan", name: "Bahan Operasional", icon: "package", color: "#10b981" },
  { id: "exp_cat_transport", name: "Transport & BBM", icon: "truck", color: "#ef4444" },
  { id: "exp_cat_marketing", name: "Marketing & Iklan", icon: "megaphone", color: "#ec4899" },
  { id: "exp_cat_maintenance", name: "Maintenance Mesin", icon: "wrench", color: "#64748b" },
  { id: "exp_cat_pajak", name: "Pajak & Retribusi", icon: "receipt", color: "#dc2626" },
  { id: "exp_cat_lain", name: "Lain-lain", icon: "more-horizontal", color: "#94a3b8" },
];

async function main() {
  console.log("🌱 Seeding expense categories...");

  // Clear existing for this tenant
  await db.delete(expenseCategories).where(eq(expenseCategories.tenantId, TENANT_ID));

  await db.insert(expenseCategories).values(
    categories.map((c) => ({ ...c, tenantId: TENANT_ID }))
  );

  console.log(`✅ ${categories.length} categories seeded`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
