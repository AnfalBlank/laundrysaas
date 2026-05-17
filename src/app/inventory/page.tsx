import { AppShell } from "@/components/layout/app-shell";
import { InventoryView } from "@/components/inventory/inventory-view";
import { listInventory } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const inventory = await listInventory();
  return (
    <AppShell title="Inventory Management" subtitle="Stok operasional laundry">
      <InventoryView initialInventory={inventory} />
    </AppShell>
  );
}
