import { AppShell } from "@/components/layout/app-shell";
import { InventoryView } from "@/components/inventory/inventory-view";
import { listInventory, listInventoryMovements } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [inventory, movements] = await Promise.all([
    listInventory(),
    listInventoryMovements({ limit: 50 }),
  ]);
  return (
    <AppShell title="Inventory Management" subtitle="Stok operasional & history pemakaian">
      <InventoryView initialInventory={inventory} initialMovements={movements} />
    </AppShell>
  );
}
