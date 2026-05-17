import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChartCard } from "@/components/dashboard/revenue-chart";
import { ServicePieCard } from "@/components/dashboard/service-pie";
import { RecentOrdersCard } from "@/components/dashboard/recent-orders";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { BranchPerformanceCard } from "@/components/dashboard/branch-performance";
import {
  WashingMachine3D,
  TruckDelivery3D,
  Receipt3D,
  Sparkles3D,
} from "@/components/ui/laundry-icons";
import {
  getOrderStats,
  getRevenueChart,
  getServiceBreakdown,
  getBranchPerformance,
  listOrders,
} from "@/db/repositories";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, revenueChart, serviceBreakdown, branches, recentOrders] =
    await Promise.all([
      getOrderStats(),
      getRevenueChart(7),
      getServiceBreakdown(),
      getBranchPerformance(),
      listOrders({ limit: 6 }),
    ]);

  const formatRevenue = (n: number) =>
    n >= 1_000_000
      ? `Rp ${(n / 1_000_000).toFixed(2)} Jt`
      : formatCurrency(n);

  return (
    <AppShell title="Dashboard" subtitle="Selamat datang kembali, Pak Joko">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Omzet Hari Ini"
          value={formatRevenue(stats.revenueToday)}
          delta={12.4}
          variant="blue"
          icon={<Receipt3D className="w-9 h-9" />}
        />
        <StatCard
          label="Order Hari Ini"
          value={String(stats.ordersToday)}
          delta={8.2}
          variant="cyan"
          icon={<WashingMachine3D className="w-9 h-9" />}
        />
        <StatCard
          label="Laundry Aktif"
          value={String(stats.activeOrders)}
          delta={-3.1}
          deltaLabel="proses berjalan"
          variant="purple"
          icon={<Sparkles3D className="w-9 h-9" />}
        />
        <StatCard
          label="Pickup Pending"
          value={String(stats.pickupPending)}
          delta={5}
          deltaLabel="butuh assign"
          variant="orange"
          icon={<TruckDelivery3D className="w-9 h-9" />}
        />
      </div>

      {/* Charts row */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChartCard data={revenueChart} />
        </div>
        <ServicePieCard data={serviceBreakdown} />
      </div>

      {/* Lower row */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentOrdersCard orders={recentOrders} />
        </div>
        <div className="space-y-4">
          <QuickActions />
          <BranchPerformanceCard branches={branches} />
        </div>
      </div>
    </AppShell>
  );
}
