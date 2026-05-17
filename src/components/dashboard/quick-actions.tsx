"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Icon3D } from "@/components/ui/icon3d";
import {
  WashingMachine3D,
  TruckDelivery3D,
  Whatsapp3D,
  QRCode3D,
  Receipt3D,
  Sparkles3D,
} from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import { Zap } from "lucide-react";

export function QuickActions() {
  const router = useRouter();
  const toast = useToast();

  const actions = [
    {
      label: "Order Baru",
      desc: "Input cepat",
      icon: <WashingMachine3D className="w-8 h-8 sm:w-9 sm:h-9" />,
      action: () => router.push("/orders"),
    },
    {
      label: "Pickup",
      desc: "Jadwal jemput",
      icon: <TruckDelivery3D className="w-8 h-8 sm:w-9 sm:h-9" />,
      action: () => router.push("/pickup"),
    },
    {
      label: "Broadcast",
      desc: "WhatsApp",
      icon: <Whatsapp3D className="w-8 h-8 sm:w-9 sm:h-9" />,
      action: () => router.push("/whatsapp"),
    },
    {
      label: "Scan QR",
      desc: "Update status",
      icon: <QRCode3D className="w-8 h-8 sm:w-9 sm:h-9" />,
      action: () => toast.info("Scan QR", "Fitur scanner akan segera tersedia"),
    },
    {
      label: "Invoice",
      desc: "Cetak thermal",
      icon: <Receipt3D className="w-8 h-8 sm:w-9 sm:h-9" />,
      action: () => router.push("/orders"),
    },
    {
      label: "AI Assist",
      desc: "Saran promo",
      icon: <Sparkles3D className="w-8 h-8 sm:w-9 sm:h-9" />,
      action: () => router.push("/marketing"),
    },
  ];

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Aksi Cepat</h3>
        <Icon3D variant="cyan" size="sm" animate="wiggle">
          <Zap size={14} />
        </Icon3D>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.action}
            className="group flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl p-2 sm:p-3 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all border border-transparent hover:border-primary-100"
          >
            <div className="transition-transform group-hover:-translate-y-1 group-hover:scale-110">
              {a.icon}
            </div>
            <div className="text-center">
              <div className="text-[11px] sm:text-xs font-semibold text-slate-900 leading-tight">
                {a.label}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight hidden sm:block">
                {a.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
