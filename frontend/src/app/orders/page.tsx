import { AppShell } from "@/components/layout/app-shell";
import { OrdersView } from "@/components/orders/orders-view";
import { listOrders } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await listOrders({ limit: 100 });

  return (
    <AppShell title="Order Management" subtitle="Kelola seluruh transaksi laundry">
      <OrdersView initialOrders={orders} />
    </AppShell>
  );
}
