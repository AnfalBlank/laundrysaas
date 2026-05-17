"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ServiceDatum {
  name: string;
  value: number;
  color: string;
}

export function ServicePieCard({ data }: { data: ServiceDatum[] }) {
  if (data.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Layanan Terpopuler</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Belum ada data</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-sm text-slate-400">
            Belum ada order untuk dianalisis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Layanan Terpopuler</CardTitle>
        <p className="text-xs text-slate-500 mt-0.5">Distribusi order minggu ini</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-44 -mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v}%`, "Persentase"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {data.slice(0, 6).map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-xs min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="flex-1 truncate text-slate-600">{s.name}</span>
              <span className="font-semibold text-slate-900 shrink-0">{s.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
