import { AppShell } from "@/components/layout/app-shell";
import { ReportsView } from "@/components/reports/reports-view";
import { getOrderStats, getServiceBreakdown, listOrders } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [stats, breakdown, orders] = await Promise.all([
    getOrderStats(),
    getServiceBreakdown(),
    listOrders({ limit: 1000 }),
  ]);

  return (
    <AppShell title="Reports & Analytics" subtitle="Laporan bisnis dan analitik laundry">
      <ReportsView stats={stats} breakdown={breakdown} orders={orders} />
    </AppShell>
  );
}
