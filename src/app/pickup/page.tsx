import { AppShell } from "@/components/layout/app-shell";
import { PickupView } from "@/components/pickup/pickup-view";
import { listPickups, listDrivers, listOrders } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function PickupPage() {
  const [pickups, drivers, orders] = await Promise.all([
    listPickups(),
    listDrivers(),
    listOrders({ limit: 100 }),
  ]);

  return (
    <AppShell title="Pickup & Delivery" subtitle="Manajemen jemput dan antar laundry">
      <PickupView initialPickups={pickups} drivers={drivers} orders={orders} />
    </AppShell>
  );
}
