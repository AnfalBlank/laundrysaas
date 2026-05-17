import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import {
  Detergent3D,
  Perfume3D,
  Package3D,
  ChemicalFlask3D,
  AlertWarning3D,
  CartIcon3D,
  Money3D,
} from "@/components/ui/laundry-icons";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowDown, ArrowUp, Plus, Truck } from "lucide-react";
import { listInventory } from "@/db/repositories";

export const dynamic = "force-dynamic";

const categoryMeta: Record<
  string,
  { icon: React.ReactNode; variant: Parameters<typeof Icon3D>[0]["variant"] }
> = {
  Sabun: { icon: <Detergent3D className="w-7 h-7" />, variant: "blue" },
  Parfum: { icon: <Perfume3D className="w-7 h-7" />, variant: "pink" },
  Packaging: { icon: <Package3D className="w-7 h-7" />, variant: "amber" },
  Chemical: { icon: <ChemicalFlask3D className="w-7 h-7" />, variant: "purple" },
};

export default async function InventoryPage() {
  const inventory = await listInventory();
  const lowStock = inventory.filter((i) => i.stock <= i.minimumStock);

  return (
    <AppShell title="Inventory Management" subtitle="Stok operasional laundry">
      {/* Alerts */}
      {lowStock.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Icon3D variant="amber" size="md" animate="wiggle">
                <AlertTriangle size={20} />
              </Icon3D>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-amber-900">
                  {lowStock.length} item perlu restock!
                </h3>
                <p className="text-xs text-amber-700 mt-0.5 break-words">
                  {lowStock.map((i) => i.name).join(", ")}
                </p>
              </div>
            </div>
            <Button className="shrink-0 sm:self-center">
              <Truck size={14} /> Buat Order
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5">
        {[
          {
            label: "Total Item",
            value: inventory.length.toString(),
            icon: <Package3D className="w-9 h-9" />,
            v: "blue" as const,
          },
          {
            label: "Perlu Restock",
            value: lowStock.length.toString(),
            icon: <AlertWarning3D className="w-9 h-9" />,
            v: "amber" as const,
          },
          {
            label: "Order Bulan Ini",
            value: "12",
            icon: <CartIcon3D className="w-9 h-9" />,
            v: "cyan" as const,
          },
          {
            label: "Nilai Stok",
            value: "Rp 8.4 Jt",
            icon: <Money3D className="w-9 h-9" />,
            v: "green" as const,
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                {s.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
                {s.value}
              </div>
            </div>
            <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
              <Icon3D variant={s.v} size="lg" animate="float">
                {s.icon}
              </Icon3D>
            </div>
          </Card>
        ))}
      </div>

      {/* Inventory list */}
      <Card className="mt-4 sm:mt-5 overflow-hidden">
        <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle>Daftar Inventaris</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Stok operasional terbaru</p>
          </div>
          <Button className="shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">Item Baru</span>
            <span className="sm:hidden">Baru</span>
          </Button>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5">
          {inventory.map((item) => {
            const meta = categoryMeta[item.category] ?? {
              icon: <Package3D className="w-7 h-7" />,
              variant: "blue" as const,
            };
            const isLow = item.stock <= item.minimumStock;
            const ratio = Math.min(100, (item.stock / Math.max(item.minimumStock * 3, 1)) * 100);
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border p-4 hover:shadow-md transition-all",
                  isLow ? "border-amber-200 bg-amber-50/40" : "border-slate-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon3D variant={meta.variant} size="md" animate="float">
                    {meta.icon}
                  </Icon3D>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
                      {isLow && <Badge variant="warning">Low</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-slate-900">{item.stock}</span>
                  <span className="text-sm text-slate-500">{item.unit}</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    min {item.minimumStock}
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isLow
                        ? "bg-gradient-to-r from-amber-400 to-orange-500"
                        : "bg-gradient-to-r from-primary-400 to-accent-500"
                    )}
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <ArrowDown size={12} /> Keluar
                  </Button>
                  <Button size="sm" className="flex-1">
                    <ArrowUp size={12} /> Masuk
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}
