"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { useToast } from "@/components/ui/toast";
import {
  Scooter3D,
  Package3D,
  ClockFast3D,
  TruckDelivery3D,
} from "@/components/ui/laundry-icons";
import { cn, formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Play,
} from "lucide-react";

interface Pickup {
  id: string;
  type: string;
  status: string;
  address: string | null;
  scheduledAt: Date;
  invoice: string;
  customerName: string | null;
  driverName: string | null;
}

export function DriverDashboard({
  pickups,
  userName,
}: {
  pickups: Pickup[];
  userName: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const todayPickups = pickups.filter((p) => p.type === "pickup");
  const todayDeliveries = pickups.filter((p) => p.type === "delivery");
  const ongoing = pickups.filter((p) => p.status === "ongoing");
  const scheduled = pickups.filter((p) => p.status === "scheduled");

  const updateStatus = async (
    id: string,
    status: "ongoing" | "completed"
  ) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/pickups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(
        status === "ongoing" ? "Mulai berangkat" : "Task selesai"
      );
      router.refresh();
    } catch (err) {
      toast.error("Gagal update", String(err));
    } finally {
      setUpdating(null);
    }
  };

  const trackOnMap = (address: string | null) => {
    if (!address) return toast.warning("Alamat tidak tersedia");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(url, "_blank");
  };

  const callCustomer = (invoice: string) => {
    toast.info(`Hubungi customer ${invoice}`, "Buka detail order untuk no. HP");
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2 bg-gradient-to-br from-orange-500 to-rose-500 text-white">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80">
              Total Task
            </div>
            <div className="text-2xl sm:text-3xl font-bold mt-1">{pickups.length}</div>
            <div className="text-[11px] mt-1 opacity-90">aktif hari ini</div>
          </div>
          <Scooter3D className="w-12 h-12" />
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
              Pickup
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {todayPickups.length}
            </div>
          </div>
          <Icon3D variant="orange" size="lg">
            <Scooter3D className="w-9 h-9" />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
              Delivery
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {todayDeliveries.length}
            </div>
          </div>
          <Icon3D variant="cyan" size="lg">
            <Package3D className="w-9 h-9" />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
              Berlangsung
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {ongoing.length}
            </div>
          </div>
          <Icon3D variant="amber" size="lg">
            <ClockFast3D className="w-9 h-9" />
          </Icon3D>
        </Card>
      </div>

      {/* Ongoing tasks - priority */}
      {ongoing.length > 0 && (
        <Card className="mt-5 border-amber-200 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin text-amber-600" /> Sedang Berlangsung
              ({ongoing.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Task aktif yang belum selesai
            </p>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {ongoing.map((p) => (
              <TaskCard
                key={p.id}
                pickup={p}
                updating={updating === p.id}
                onComplete={() => updateStatus(p.id, "completed")}
                onTrack={() => trackOnMap(p.address)}
                onCall={() => callCustomer(p.invoice)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Scheduled tasks */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckDelivery3D className="w-6 h-6" /> Task Terjadwal ({scheduled.length})
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Klik &quot;Mulai&quot; saat berangkat</p>
        </CardHeader>
        <div className="divide-y divide-slate-100">
          {scheduled.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              Tidak ada task terjadwal saat ini
            </div>
          )}
          {scheduled.map((p) => (
            <TaskCard
              key={p.id}
              pickup={p}
              updating={updating === p.id}
              onStart={() => updateStatus(p.id, "ongoing")}
              onTrack={() => trackOnMap(p.address)}
              onCall={() => callCustomer(p.invoice)}
            />
          ))}
        </div>
      </Card>
    </>
  );
}

function TaskCard({
  pickup,
  updating,
  onStart,
  onComplete,
  onTrack,
  onCall,
}: {
  pickup: Pickup;
  updating: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onTrack: () => void;
  onCall: () => void;
}) {
  return (
    <div className="px-4 sm:px-5 py-4">
      <div className="flex items-start gap-3">
        <Icon3D variant={pickup.type === "pickup" ? "orange" : "cyan"} size="md">
          {pickup.type === "pickup" ? (
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
                pickup.type === "pickup"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-cyan-100 text-cyan-700"
              )}
            >
              {pickup.type}
            </span>
            <span className="font-semibold text-sm text-slate-900 truncate">
              {pickup.customerName ?? "—"}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{pickup.invoice}</span>
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-start gap-1">
            <MapPin size={12} className="mt-0.5 shrink-0 text-slate-400" />
            <span className="break-words font-medium">{pickup.address ?? "—"}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ⏰ {formatDateTime(pickup.scheduledAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {onStart && (
          <Button size="sm" type="button" onClick={onStart} disabled={updating}>
            <Play size={12} /> Mulai Berangkat
          </Button>
        )}
        {onComplete && (
          <Button
            size="sm"
            variant="primary"
            type="button"
            onClick={onComplete}
            disabled={updating}
          >
            <CheckCircle2 size={12} /> Selesai
          </Button>
        )}
        <Button size="sm" variant="secondary" type="button" onClick={onTrack}>
          <Navigation size={12} /> Maps
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onCall}>
          <Phone size={12} /> Customer
        </Button>
      </div>
    </div>
  );
}
