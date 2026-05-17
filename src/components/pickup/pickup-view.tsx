"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select, Field } from "@/components/ui/select";
import { Icon3D } from "@/components/ui/icon3d";
import {
  TruckDelivery3D,
  Package3D,
  ClockFast3D,
  Scooter3D,
  CarSimple3D,
} from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
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
  Play,
} from "lucide-react";

const driverColors: Parameters<typeof Icon3D>[0]["variant"][] = [
  "blue",
  "cyan",
  "orange",
  "purple",
  "amber",
];

interface Pickup {
  id: string;
  type: string;
  status: string;
  address: string | null;
  scheduledAt: Date;
  completedAt: Date | null;
  orderId: string;
  invoice: string;
  customerName: string | null;
  driverName: string | null;
}

interface Driver {
  id: string;
  name: string;
  phone: string | null;
  isActive: boolean;
  taskCount: number;
  ongoingCount: number;
}

interface Order {
  id: string;
  invoice: string;
  customerName: string | null;
  pickupType: string;
  status: string;
}

export function PickupView({
  initialPickups,
  drivers,
  orders,
}: {
  initialPickups: Pickup[];
  drivers: Driver[];
  orders: Order[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    driverId: drivers[0]?.id ?? "",
    type: "pickup" as "pickup" | "delivery",
    address: "",
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPickups = initialPickups.filter(
    (p) => p.type === "pickup" && new Date(p.scheduledAt) >= today
  ).length;
  const todayDeliveries = initialPickups.filter(
    (p) => p.type === "delivery" && new Date(p.scheduledAt) >= today
  ).length;
  const activeDrivers = drivers.filter((d) => d.isActive).length;

  const eligibleOrders = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId) {
      toast.error("Pilih order");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/pickups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Pickup dibuat", "Task baru ditambahkan");
      setShowCreate(false);
      router.refresh();
    } catch (err) {
      toast.error("Gagal membuat pickup", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (
    id: string,
    status: "scheduled" | "ongoing" | "completed" | "cancelled"
  ) => {
    try {
      const res = await fetch(`/api/pickups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      const labels = {
        scheduled: "Dijadwalkan ulang",
        ongoing: "Driver berangkat",
        completed: "Task selesai",
        cancelled: "Dibatalkan",
      };
      toast.success(labels[status]);
      router.refresh();
    } catch (err) {
      toast.error("Gagal update status", String(err));
    }
  };

  const callDriver = (phone: string | null) => {
    if (!phone) return toast.warning("Nomor tidak tersedia");
    const cleaned = phone.replace(/\D/g, "");
    window.open(`tel:${cleaned}`, "_self");
  };

  const trackOnMap = (address: string | null) => {
    if (!address) return toast.warning("Alamat tidak tersedia");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(url, "_blank");
  };

  return (
    <>
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
                {initialPickups.length} task aktif & terjadwal
              </p>
            </div>
            <Button
              className="shrink-0"
              onClick={() => setShowCreate(true)}
              type="button"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Buat Pickup</span>
              <span className="sm:hidden">Buat</span>
            </Button>
          </CardHeader>

          <div className="divide-y divide-slate-100">
            {initialPickups.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-slate-400">
                Belum ada pickup terjadwal
              </div>
            )}
            {initialPickups.map((p) => (
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
                    <div className="flex gap-1">
                      {p.status === "scheduled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => updateStatus(p.id, "ongoing")}
                        >
                          <Play size={12} /> Mulai
                        </Button>
                      )}
                      {p.status === "ongoing" && (
                        <Button
                          variant="primary"
                          size="sm"
                          type="button"
                          onClick={() => updateStatus(p.id, "completed")}
                        >
                          <CheckCircle2 size={12} /> Selesai
                        </Button>
                      )}
                      {p.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => trackOnMap(p.address)}
                          className="hidden sm:inline-flex"
                        >
                          <Navigation size={14} /> Track
                        </Button>
                      )}
                    </div>
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
                  <button
                    onClick={() => callDriver(d.phone)}
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 shrink-0"
                    aria-label="Call"
                  >
                    <Phone size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Buat Pickup / Delivery"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCreate(false)}
              disabled={submitting}
              type="button"
            >
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={submitting} type="submit" form="pickup-form">
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        <form id="pickup-form" onSubmit={handleCreate} className="space-y-3">
          <Field label="Tipe" required>
            <div className="grid grid-cols-2 gap-2">
              {(["pickup", "delivery"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-semibold capitalize",
                    form.type === t
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Order" required>
            <Select
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              required
            >
              <option value="">Pilih order...</option>
              {eligibleOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.invoice} — {o.customerName ?? "—"}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Driver">
            <Select
              value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            >
              <option value="">Auto-assign nanti</option>
              {drivers
                .filter((d) => d.isActive)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.taskCount} task)
                  </option>
                ))}
            </Select>
          </Field>

          <Field label="Alamat">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat lokasi"
            />
          </Field>

          <Field label="Jadwal" required>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              required
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
