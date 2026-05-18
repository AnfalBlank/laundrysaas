"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { useToast } from "@/components/ui/toast";
import { statusLabels, statusColors, type OrderStatus } from "@/lib/dummy-data";
import { cn, formatDateTime } from "@/lib/utils";
import {
  WashingMachine3D,
  Sparkles3D,
  AlertWarning3D,
} from "@/components/ui/laundry-icons";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

const PRODUCTION_STATUSES: OrderStatus[] = [
  "RECEIVED",
  "WASHING",
  "DRYING",
  "IRONING",
  "PACKING",
];

const NEXT_STATUS: Record<string, OrderStatus> = {
  RECEIVED: "WASHING",
  WASHING: "DRYING",
  DRYING: "IRONING",
  IRONING: "PACKING",
  PACKING: "READY_DELIVERY",
};

export function StaffDashboard({
  orders,
  inventory,
  userName,
}: {
  orders: any[];
  inventory: { id: string; name: string; stock: number; minimumStock: number; unit: string }[];
  userName: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  // Filter only production orders
  const productionOrders = orders.filter((o) =>
    PRODUCTION_STATUSES.includes(o.status as OrderStatus)
  );

  const lowStock = inventory.filter((i) => i.stock <= i.minimumStock);

  // Group by status
  const byStatus = PRODUCTION_STATUSES.reduce<Record<string, any[]>>((acc, s) => {
    acc[s] = productionOrders.filter((o) => o.status === s);
    return acc;
  }, {});

  const moveToNext = async (orderId: string, currentStatus: string) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Status diupdate", `${statusLabels[nextStatus]}`);
      router.refresh();
    } catch (err) {
      toast.error("Gagal update", String(err));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
              Total Aktif
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {productionOrders.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">order produksi</div>
          </div>
          <Icon3D variant="blue" size="lg">
            <WashingMachine3D className="w-9 h-9" />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
              Dicuci
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {byStatus.WASHING?.length ?? 0}
            </div>
          </div>
          <Icon3D variant="cyan" size="lg">
            <Sparkles3D className="w-9 h-9" />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
              Disetrika
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {byStatus.IRONING?.length ?? 0}
            </div>
          </div>
          <Icon3D variant="indigo" size="lg">
            <Sparkles3D className="w-9 h-9" />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
              Stok Rendah
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {lowStock.length}
            </div>
            <div className="text-[11px] text-amber-600 mt-1">item perlu refill</div>
          </div>
          <Icon3D variant="amber" size="lg">
            <AlertWarning3D className="w-9 h-9" />
          </Icon3D>
        </Card>
      </div>

      {/* Production board - kanban style */}
      <div className="mt-5">
        <h2 className="font-bold text-slate-900 mb-3">Production Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {PRODUCTION_STATUSES.map((status) => {
            const items = byStatus[status] ?? [];
            return (
              <Card key={status} className="overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                        statusColors[status]
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusLabels[status]}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{items.length}</span>
                  </div>
                </div>
                <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                  {items.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-4">Kosong</div>
                  )}
                  {items.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-xl border border-slate-200 p-2.5 bg-white hover:shadow-sm transition"
                    >
                      <div className="text-[11px] font-mono font-bold text-primary-700 truncate">
                        {o.invoice}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 mt-0.5 truncate">
                        {o.customerName ?? "—"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {o.service}
                        {o.weight && ` · ${o.weight}kg`}
                      </div>
                      {NEXT_STATUS[o.status] && (
                        <Button
                          size="sm"
                          variant="primary"
                          type="button"
                          onClick={() => moveToNext(o.id, o.status)}
                          disabled={updating === o.id}
                          className="w-full mt-2 h-7 text-[11px]"
                        >
                          {updating === o.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <>
                              {statusLabels[NEXT_STATUS[o.status]]}{" "}
                              <ArrowRight size={10} />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Card className="mt-5 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Icon3D variant="amber" size="md">
              <AlertWarning3D className="w-7 h-7" />
            </Icon3D>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900">
                Stok Rendah — Lapor Admin
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                {lowStock.map((i) => `${i.name} (${i.stock} ${i.unit})`).join(", ")}
              </p>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => router.push("/inventory")}
                className="mt-2"
              >
                Lihat Inventory
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Help info */}
      <Card className="mt-5 p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-blue-900">Tips Staff</h3>
            <p className="text-xs text-blue-800 mt-0.5">
              Klik tombol di kartu order untuk memindahkan ke status berikutnya. Pastikan kualitas
              sebelum mark sebagai &quot;Dikemas&quot;.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
