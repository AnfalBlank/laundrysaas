import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import {
  TruckDelivery3D,
  Package3D,
  ClockFast3D,
  Scooter3D,
  CarSimple3D,
} from "@/components/ui/laundry-icons";
import { cn, formatDateTime } from "@/lib/utils";
import {
  MapPin,
  Navigation,
  Phone,
  Plus,
  User,
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";
import { listPickups, listDrivers } from "@/db/repositories";

export const dynamic = "force-dynamic";

const driverColors: Parameters<typeof Icon3D>[0]["variant"][] = [
  "blue",
  "cyan",
  "orange",
  "purple",
  "amber",
];

export default async function PickupPage() {
  const [pickups, drivers] = await Promise.all([listPickups(), listDrivers()]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPickups = pickups.filter(
    (p) => p.type === "pickup" && new Date(p.scheduledAt) >= today
  ).length;
  const todayDeliveries = pickups.filter(
    (p) => p.type === "delivery" && new Date(p.scheduledAt) >= today
  ).length;
  const activeDrivers = drivers.filter((d) => d.isActive).length;

  return (
    <AppShell title="Pickup & Delivery" subtitle="Manajemen jemput dan antar laundry">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Pickup Hari Ini",
            value: String(todayPickups),
            icon: <TruckDelivery3D className="w-9 h-9" />,
            variant: "blue" as const,
          },
          {
            label: "Delivery Hari Ini",
            value: String(todayDeliveries),
            icon: <Package3D className="w-9 h-9" />,
            variant: "cyan" as const,
          },
          {
            label: "Driver Aktif",
            value: `${activeDrivers} / ${drivers.length}`,
            icon: <User size={28} />,
            variant: "green" as const,
          },
          {
            label: "Rata² Waktu",
            value: "24 mnt",
            icon: <ClockFast3D className="w-9 h-9" />,
            variant: "amber" as const,
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                {s.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            </div>
            <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
              <Icon3D variant={s.variant} size="lg" animate="float">
                {s.icon}
              </Icon3D>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Task list */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
            <div className="min-w-0">
              <CardTitle>Tugas Hari Ini</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {pickups.length} task aktif & terjadwal
              </p>
            </div>
            <Button className="shrink-0">
              <Plus size={16} />
              <span className="hidden sm:inline">Buat Pickup</span>
              <span className="sm:hidden">Buat</span>
            </Button>
          </CardHeader>

          <div className="divide-y divide-slate-100">
            {pickups.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-slate-400">
                Belum ada pickup terjadwal
              </div>
            )}
            {pickups.map((p) => (
              <div key={p.id} className="px-4 sm:px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <Icon3D
                    variant={p.type === "pickup" ? "orange" : "cyan"}
                    size="md"
                    animate="float"
                  >
                    {p.type === "pickup" ? (
                      <Scooter3D className="w-7 h-7" />
                    ) : (
                      <Package3D className="w-7 h-7" />
                    )}
                  </Icon3D>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md",
                          p.type === "pickup"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-cyan-50 text-cyan-700"
                        )}
                      >
                        {p.type}
                      </span>
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {p.customerName ?? "—"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{p.invoice}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      <span className="break-words">{p.address ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                      <span className="text-slate-600 inline-flex items-center gap-1">
                        <CarSimple3D className="w-4 h-4" />
                        <span className="font-semibold">{p.driverName ?? "—"}</span>
                      </span>
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <ClockFast3D className="w-4 h-4" />
                        {formatDateTime(p.scheduledAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge
                      variant={
                        p.status === "completed"
                          ? "success"
                          : p.status === "ongoing"
                          ? "warning"
                          : "primary"
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span className="hidden sm:inline">
                        {p.status === "completed"
                          ? "Selesai"
                          : p.status === "ongoing"
                          ? "Berlangsung"
                          : "Terjadwal"}
                      </span>
                      <span className="sm:hidden">
                        {p.status === "completed" ? (
                          <CheckCircle2 size={11} />
                        ) : p.status === "ongoing" ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Circle size={11} />
                        )}
                      </span>
                    </Badge>
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                      <Navigation size={14} /> Track
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Driver list */}
        <Card>
          <CardHeader>
            <CardTitle>Status Driver</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Realtime monitoring</p>
          </CardHeader>
          <div className="p-3 space-y-2">
            {drivers.map((d, i) => {
              const status = !d.isActive
                ? "offline"
                : d.ongoingCount > 0
                ? "ongoing"
                : "active";
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Icon3D
                    variant={driverColors[i % driverColors.length]}
                    size="md"
                    animate={status === "ongoing" ? "wiggle" : "none"}
                  >
                    <Scooter3D className="w-7 h-7" />
                  </Icon3D>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {d.name}
                      </span>
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          status === "active" &&
                            "bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]",
                          status === "ongoing" &&
                            "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]",
                          status === "offline" && "bg-slate-300"
                        )}
                      />
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {d.taskCount} task aktif · {d.phone ?? "—"}
                    </div>
                  </div>
                  <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 shrink-0">
                    <Phone size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
