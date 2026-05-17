import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import {
  WashingMachine3D,
  Bolt3D,
  Sparkles3D,
} from "@/components/ui/laundry-icons";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Tag } from "lucide-react";
import { listServices } from "@/db/repositories";

export const dynamic = "force-dynamic";

const serviceMeta: Record<
  string,
  {
    icon: React.ReactNode;
    variant: Parameters<typeof Icon3D>[0]["variant"];
    label: string;
  }
> = {
  regular: {
    icon: <WashingMachine3D className="w-7 h-7" />,
    variant: "blue",
    label: "Reguler",
  },
  express: { icon: <Bolt3D className="w-7 h-7" />, variant: "amber", label: "Express" },
  special: { icon: <Sparkles3D className="w-7 h-7" />, variant: "purple", label: "Spesial" },
};

const pricingTypeLabel: Record<string, string> = {
  per_kg: "Per Kg",
  per_item: "Per Item",
  per_unit: "Per Unit",
};

export default async function ServicesPage() {
  const services = await listServices();

  // Group by category
  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <AppShell title="Services & Pricing" subtitle="Kelola layanan dan harga laundry">
      <Card className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0">
            <Icon3D variant="cyan" size="md" animate="float">
              <Tag size={20} />
            </Icon3D>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">{services.length} Layanan Aktif</div>
            <div className="text-xs text-slate-500">
              Tersusun dalam {Object.keys(grouped).length} kategori
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="flex-1 sm:flex-none">
            Promo Harga
          </Button>
          <Button className="flex-1 sm:flex-none">
            <Plus size={16} />
            <span className="hidden sm:inline">Layanan Baru</span>
            <span className="sm:hidden">Baru</span>
          </Button>
        </div>
      </Card>

      {Object.entries(grouped).map(([category, items]) => {
        const meta = serviceMeta[category] ?? {
          icon: <WashingMachine3D className="w-7 h-7" />,
          variant: "blue" as const,
          label: category,
        };
        return (
          <div key={category} className="mt-5 sm:mt-6">
            <div className="flex items-center gap-2.5 mb-3">
              <Icon3D variant={meta.variant} size="sm" animate="wiggle">
                {meta.icon}
              </Icon3D>
              <h2 className="font-bold text-slate-900">{meta.label}</h2>
              <Badge variant="primary">{items.length} layanan</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((s) => (
                <Card
                  key={s.id}
                  className="tilt-card p-5 hover:shadow-lg transition-shadow relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-100/40 to-transparent rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <Icon3D variant={meta.variant} size="lg" animate="float">
                        {meta.icon}
                      </Icon3D>
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                        <Edit2 size={14} />
                      </button>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-4">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default">{pricingTypeLabel[s.pricingType]}</Badge>
                      <Badge variant="primary">{meta.label}</Badge>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        {formatCurrency(s.price)}
                      </span>
                      <span className="text-xs text-slate-500">
                        / {pricingTypeLabel[s.pricingType].toLowerCase().replace("per ", "")}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Estimasi {s.durationDays} hari
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </AppShell>
  );
}
