import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/ui/icon3d";
import {
  Chart3D,
  Receipt3D,
  Diamond3D,
  Trophy3D,
  Bolt3D,
} from "@/components/ui/laundry-icons";
import { formatCurrency } from "@/lib/utils";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { ReportsCharts } from "@/components/reports/reports-charts";
import {
  getOrderStats,
  getServiceBreakdown,
  listOrders,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [stats, breakdown, orders] = await Promise.all([
    getOrderStats(),
    getServiceBreakdown(),
    listOrders({ limit: 1000 }),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const aov = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const profit = Math.round(totalRevenue * 0.42);

  // Top services by frequency
  const serviceCount: Record<string, { count: number; revenue: number }> = {};
  for (const o of orders) {
    const s = o.service;
    if (!serviceCount[s]) serviceCount[s] = { count: 0, revenue: 0 };
    serviceCount[s].count++;
    serviceCount[s].revenue += o.total;
  }
  const topServices = Object.entries(serviceCount)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 5-month trend (mock distribution from total)
  const monthlyTrend = [
    { month: "Jan", revenue: Math.round(totalRevenue * 0.6), profit: Math.round(profit * 0.6) },
    { month: "Feb", revenue: Math.round(totalRevenue * 0.7), profit: Math.round(profit * 0.7) },
    { month: "Mar", revenue: Math.round(totalRevenue * 0.8), profit: Math.round(profit * 0.8) },
    { month: "Apr", revenue: Math.round(totalRevenue * 0.9), profit: Math.round(profit * 0.9) },
    { month: "Mei", revenue: totalRevenue, profit },
  ];

  return (
    <AppShell title="Reports & Analytics" subtitle="Laporan bisnis dan analitik laundry">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-gradient-to-br from-primary-500 to-accent-500 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80">
              Omzet Bulan Ini
            </div>
            <div className="text-xl sm:text-3xl font-bold mt-1 truncate">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-[11px] mt-2 opacity-90">+9.3% vs bulan lalu</div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Profit Bersih
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
              {formatCurrency(profit)}
            </div>
            <div className="text-[11px] text-green-600 font-semibold mt-1">Margin 42%</div>
          </div>
          <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
            <Chart3D className="w-12 h-12" />
          </div>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Total Order
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {orders.length}
            </div>
            <div className="text-[11px] text-green-600 font-semibold mt-1">
              {stats.ordersToday} hari ini
            </div>
          </div>
          <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
            <Receipt3D className="w-12 h-12" />
          </div>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              AOV
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
              {formatCurrency(aov)}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">Avg Order Value</div>
          </div>
          <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
            <Icon3D variant="amber" size="lg" animate="float">
              <Diamond3D className="w-9 h-9" />
            </Icon3D>
          </div>
        </Card>
      </div>

      {/* Filter & Export */}
      <Card className="mt-4 sm:mt-5 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {["Hari Ini", "7 Hari", "30 Hari", "Bulan Ini", "Custom"].map((p, i) => (
            <button
              key={p}
              className={
                i === 2
                  ? "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/30"
                  : "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-primary-200"
              }
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="flex-1 sm:flex-none">
            <FileText size={14} /> PDF
          </Button>
          <Button variant="secondary" className="flex-1 sm:flex-none">
            <FileSpreadsheet size={14} /> Excel
          </Button>
          <Button className="flex-1 sm:flex-none">
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </Card>

      {/* Charts */}
      <ReportsCharts trend={monthlyTrend} breakdown={breakdown} />

      {/* Top services & busy hour */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy3D className="w-6 h-6" /> Top 5 Layanan
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Berdasarkan jumlah order</p>
          </CardHeader>
          <div className="p-4 sm:p-5 pt-0 space-y-3">
            {topServices.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">Belum ada data</div>
            )}
            {topServices.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <Icon3D
                  variant={i === 0 ? "amber" : i === 1 ? "indigo" : i === 2 ? "purple" : "blue"}
                  size="sm"
                  interactive={false}
                >
                  <span className="text-xs font-bold">{i + 1}</span>
                </Icon3D>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.count} order</div>
                </div>
                <div className="font-bold text-sm text-slate-900 whitespace-nowrap">
                  {formatCurrency(s.revenue)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bolt3D className="w-6 h-6" /> Jam Tersibuk
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Heatmap order per jam</p>
          </CardHeader>
          <div className="p-4 sm:p-5 pt-0">
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }).map((_, h) => {
                const intensity =
                  h < 7
                    ? 0.1
                    : h < 10
                    ? 0.4
                    : h < 13
                    ? 0.9
                    : h < 16
                    ? 0.6
                    : h < 19
                    ? 1
                    : h < 22
                    ? 0.5
                    : 0.15;
                return (
                  <div
                    key={h}
                    className="aspect-square rounded-md text-[8px] sm:text-[9px] font-semibold flex items-center justify-center text-white"
                    style={{
                      background: `linear-gradient(135deg, rgba(37,99,235,${intensity}), rgba(6,182,212,${intensity}))`,
                    }}
                    title={`${h}:00 - intensity ${(intensity * 100).toFixed(0)}%`}
                  >
                    {h}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
              <span>Sepi</span>
              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-primary-100 to-primary-600" />
              <span>Padat</span>
            </div>
            <div className="mt-3 text-xs text-slate-600">
              Peak hour:{" "}
              <span className="font-bold text-primary-700">17:00 - 19:00</span> · Order
              terbanyak hari Sabtu
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
