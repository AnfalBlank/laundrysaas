"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendDatum {
  month: string;
  revenue: number;
  profit: number;
}

interface BreakdownDatum {
  name: string;
  value: number;
  color: string;
}

export function ReportsCharts({
  trend,
  breakdown,
}: {
  trend: TrendDatum[];
  breakdown: BreakdownDatum[];
}) {
  return (
    <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      <Card className="lg:col-span-2 overflow-hidden">
        <CardHeader>
          <CardTitle>Omzet vs Profit (5 Bulan Terakhir)</CardTitle>
        </CardHeader>
        <div className="px-2 sm:px-5 pb-5">
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#67e8f9" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={40}
                  tickFormatter={(v) =>
                    v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${v / 1000}K`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="revenue" fill="url(#rev)" radius={[8, 8, 0, 0]} name="Omzet" />
                <Bar dataKey="profit" fill="url(#prof)" radius={[8, 8, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Distribusi Layanan</CardTitle>
        </CardHeader>
        <div className="p-4 sm:p-5 pt-0">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {breakdown.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {breakdown.slice(0, 6).map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span className="flex-1 text-slate-600 truncate">{s.name}</span>
                <span className="font-semibold text-slate-900 shrink-0">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
