"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon3D } from "@/components/ui/icon3d";
import { formatCurrency } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface BranchDatum {
  name: string;
  revenue: number;
  orders: number;
}

const colors: Parameters<typeof Icon3D>[0]["variant"][] = [
  "blue",
  "cyan",
  "purple",
  "amber",
  "green",
];

export function BranchPerformanceCard({ branches }: { branches: BranchDatum[] }) {
  const max = Math.max(...branches.map((b) => b.revenue), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Cabang</CardTitle>
        <p className="text-xs text-slate-500 mt-0.5">Realtime, semua cabang</p>
      </CardHeader>
      <div className="p-5 pt-0 space-y-4">
        {branches.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-6">
            Belum ada cabang
          </div>
        )}
        {branches.map((b, i) => (
          <div key={b.name} className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Icon3D variant={colors[i % colors.length]} size="sm" interactive={false}>
                <MapPin size={14} />
              </Icon3D>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{b.name}</div>
                <div className="text-[11px] text-slate-500">{b.orders} order</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  {formatCurrency(b.revenue)}
                </div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                style={{ width: `${(b.revenue / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
