"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusLabels, statusColors, type OrderStatus } from "@/lib/dummy-data";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowRight, Shirt, Sparkles, Footprints, Bed, Square, Zap } from "lucide-react";

interface RecentOrder {
  id: string;
  invoice: string;
  status: OrderStatus | string;
  paymentStatus: string;
  total: number;
  service: string;
  customerName: string | null;
  customerPhone?: string | null;
}

function pickIcon(service: string) {
  const s = service.toLowerCase();
  if (s.includes("setrika") && !s.includes("express")) return <Sparkles size={18} className="text-primary-600" />;
  if (s.includes("kering") && !s.includes("express")) return <Shirt size={18} className="text-cyan-600" />;
  if (s.includes("express")) return <Zap size={18} className="text-amber-600" />;
  if (s.includes("sepatu")) return <Footprints size={18} className="text-purple-600" />;
  if (s.includes("bed")) return <Bed size={18} className="text-indigo-600" />;
  if (s.includes("karpet")) return <Square size={18} className="text-green-600" />;
  return <Sparkles size={18} className="text-primary-600" />;
}

export function RecentOrdersCard({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle>Order Terbaru</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">{orders.length} transaksi terbaru</p>
        </div>
        <button className="text-xs font-semibold text-primary-600 inline-flex items-center gap-1 hover:gap-1.5 transition-all shrink-0">
          <span className="hidden sm:inline">Lihat semua</span>
          <span className="sm:hidden">Semua</span>
          <ArrowRight size={14} />
        </button>
      </CardHeader>
      <div className="divide-y divide-slate-100">
        {orders.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            Belum ada order
          </div>
        )}
        {orders.map((o) => (
          <div
            key={o.id}
            className="px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-slate-50/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center shrink-0">
              {pickIcon(o.service)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 truncate">
                  {o.customerName ?? "—"}
                </span>
                {o.paymentStatus === "unpaid" && (
                  <Badge variant="warning" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                    Belum Bayar
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {o.invoice} · {o.service}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-sm text-slate-900 whitespace-nowrap">
                {formatCurrency(o.total)}
              </div>
              <span
                className={cn(
                  "inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
                  statusColors[o.status as OrderStatus] ??
                    "bg-slate-50 text-slate-600 border-slate-200"
                )}
              >
                {statusLabels[o.status as OrderStatus] ?? o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
