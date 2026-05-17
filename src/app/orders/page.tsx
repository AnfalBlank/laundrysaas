import { AppShell } from "@/components/layout/app-shell";
import { OrdersView } from "@/components/orders/orders-view";
import { listOrders, listServices, listBranches } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, services, branches] = await Promise.all([
    listOrders({ limit: 100 }),
    listServices(),
    listBranches(),
  ]);

  return (
    <AppShell title="Order Management" subtitle="Kelola seluruh transaksi laundry">
      <OrdersView
        initialOrders={orders}
        services={services}
        branches={branches}
      />
    </AppShell>
  );
}
