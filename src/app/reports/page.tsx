import { AppShell } from "@/components/layout/app-shell";
import { ReportsView } from "@/components/reports/reports-view";
import {
  getOrderStats,
  getServiceBreakdown,
  listOrders,
  getProfitAndLoss,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  // Default: bulan ini
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = now;

  const [stats, breakdown, orders, pnl] = await Promise.all([
    getOrderStats(),
    getServiceBreakdown(),
    listOrders({ limit: 1000 }),
    getProfitAndLoss({ startDate, endDate }),
  ]);

  return (
    <AppShell title="Reports & Analytics" subtitle="Laporan keuangan & analitik bisnis">
      <ReportsView stats={stats} breakdown={breakdown} orders={orders} pnl={pnl} />
    </AppShell>
  );
}
