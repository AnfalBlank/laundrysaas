import { AppShell } from "@/components/layout/app-shell";
import { OwnerDashboard } from "@/components/dashboard/owner-dashboard";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { DriverDashboard } from "@/components/dashboard/driver-dashboard";
import { getCurrentUser } from "@/lib/auth";
import {
  getOrderStats,
  getRevenueChart,
  getServiceBreakdown,
  getBranchPerformance,
  listOrders,
  listInventory,
  listPickups,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "owner";
  const userName = user?.name ?? "User";

  // Driver dashboard
  if (role === "driver") {
    const pickups = await listPickups();
    const myPickups = pickups.filter(
      (p) => p.driverName === userName && p.status !== "completed" && p.status !== "cancelled"
    );

    return (
      <AppShell title="Dashboard Driver" subtitle={`Halo ${userName}, hari ini ada ${myPickups.length} task`}>
        <DriverDashboard pickups={myPickups} userName={userName} />
      </AppShell>
    );
  }

  // Staff dashboard
  if (role === "staff") {
    const orders = await listOrders({ limit: 100 });
    const inventory = await listInventory();
    return (
      <AppShell
        title="Dashboard Staff"
        subtitle={`Halo ${userName}, kelola order produksi`}
      >
        <StaffDashboard orders={orders} inventory={inventory} userName={userName} />
      </AppShell>
    );
  }

  // Owner & Admin: full dashboard
  const [stats, revenueChart, serviceBreakdown, branches, recentOrders] =
    await Promise.all([
      getOrderStats(),
      getRevenueChart(7),
      getServiceBreakdown(),
      getBranchPerformance(),
      listOrders({ limit: 6 }),
    ]);

  return (
    <AppShell title="Dashboard" subtitle={`Selamat datang kembali, ${userName}`}>
      <OwnerDashboard
        stats={stats}
        revenueChart={revenueChart}
        serviceBreakdown={serviceBreakdown}
        branches={branches}
        recentOrders={recentOrders}
        showFinancials={role === "owner"}
      />
    </AppShell>
  );
}
