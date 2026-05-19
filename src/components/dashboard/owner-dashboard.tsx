import { StatCard } from "./stat-card";
import { RevenueChartCard } from "./revenue-chart";
import { ServicePieCard } from "./service-pie";
import { RecentOrdersCard } from "./recent-orders";
import { QuickActions } from "./quick-actions";
import { BranchPerformanceCard } from "./branch-performance";
import {
  WashingMachine3D,
  TruckDelivery3D,
  Receipt3D,
  Sparkles3D,
} from "@/components/ui/laundry-icons";
import { formatCurrency } from "@/lib/utils";

export function OwnerDashboard({
  stats,
  revenueChart,
  serviceBreakdown,
  branches,
  recentOrders,
  showFinancials = true,
}: {
  stats: {
    revenueToday: number;
    ordersToday: number;
    activeOrders: number;
    pickupPending: number;
  };
  revenueChart: { day: string; revenue: number; orders: number }[];
  serviceBreakdown: { name: string; value: number; color: string }[];
  branches: { name: string; revenue: number; orders: number }[];
  recentOrders: any[];
  showFinancials?: boolean;
}) {
  const formatRevenue = (n: number) =>
    n >= 1_000_000 ? `Rp ${(n / 1_000_000).toFixed(2)} Jt` : formatCurrency(n);

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {showFinancials && (
          <StatCard
            label="Omzet Hari Ini"
            value={formatRevenue(stats.revenueToday)}
            variant="blue"
            icon={<Receipt3D className="w-9 h-9" />}
          />
        )}
        <StatCard
          label="Order Hari Ini"
          value={String(stats.ordersToday)}
          variant="cyan"
          icon={<WashingMachine3D className="w-9 h-9" />}
        />
        <StatCard
          label="Laundry Aktif"
          value={String(stats.activeOrders)}
          deltaLabel="proses berjalan"
          variant="purple"
          icon={<Sparkles3D className="w-9 h-9" />}
        />
        <StatCard
          label="Pickup Pending"
          value={String(stats.pickupPending)}
          deltaLabel="butuh assign"
          variant="orange"
          icon={<TruckDelivery3D className="w-9 h-9" />}
        />
      </div>

      {/* Charts row - only for financial roles */}
      {showFinancials && (
        <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueChartCard data={revenueChart} />
          </div>
          <ServicePieCard data={serviceBreakdown} />
        </div>
      )}

      {/* Lower row */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentOrdersCard orders={recentOrders} />
        </div>
        <div className="space-y-4">
          <QuickActions />
          {showFinancials && <BranchPerformanceCard branches={branches} />}
        </div>
      </div>
    </>
  );
}
