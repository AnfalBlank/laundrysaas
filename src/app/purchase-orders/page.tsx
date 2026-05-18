import { AppShell } from "@/components/layout/app-shell";
import { PurchaseOrdersView } from "@/components/purchase-orders/purchase-orders-view";
import { listPurchaseOrders, listSuppliers, listInventory } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersPage() {
  const [purchaseOrders, suppliers, inventory] = await Promise.all([
    listPurchaseOrders({ limit: 50 }),
    listSuppliers(),
    listInventory(),
  ]);

  return (
    <AppShell
      title="Purchase Orders"
      subtitle="Pemesanan & pembelian stok ke supplier"
    >
      <PurchaseOrdersView
        initialPOs={purchaseOrders}
        suppliers={suppliers}
        inventory={inventory}
      />
    </AppShell>
  );
}
