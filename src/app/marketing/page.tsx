"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { Sparkles3D } from "@/components/ui/laundry-icons";
import { ArrowRight, Crown, Megaphone, Plus, RotateCcw, Send, Sparkles, Star, Users, Moon } from "lucide-react";

const campaigns = [
  {
    name: "Promo Grand Opening Cabang Utara",
    status: "Sent",
    sent: 1284,
    opened: 982,
    cta: 142,
    date: "12 Mei 2026",
    color: "green",
  },
  {
    name: "Cashback 20% Member Platinum",
    status: "Scheduled",
    sent: 86,
    opened: 0,
    cta: 0,
    date: "20 Mei 2026",
    color: "blue",
  },
  {
    name: "Reminder Customer Inactive 30 hari",
    status: "Draft",
    sent: 0,
    opened: 0,
    cta: 0,
    date: "—",
    color: "slate",
  },
];

const segments = [
  { name: "VIP Platinum", count: 86, variant: "purple" as const, icon: <Crown size={20} /> },
  { name: "New Customer", count: 124, variant: "cyan" as const, icon: <Star size={20} /> },
  { name: "Repeat Order ≥ 5", count: 482, variant: "blue" as const, icon: <RotateCcw size={20} /> },
  { name: "Inactive 30 hari", count: 142, variant: "amber" as const, icon: <Moon size={20} /> },
];

export default function MarketingPage() {
  return (
    <AppShell title="Marketing" subtitle="Broadcast WhatsApp, promo, dan retensi customer">
      {/* AI Generator hero */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-5">
          <div className="shrink-0">
            <Sparkles3D className="w-14 h-14 sm:w-16 sm:h-16" />
          </div>
          <div className="flex-1 min-w-0">
            <Badge className="bg-white/20 text-white border-white/30">
              <Sparkles size={11} /> AI POWERED
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold mt-2">
              Generate Promo dengan AI
            </h2>
            <p className="text-xs sm:text-sm opacity-90 mt-1">
              AI membuat caption WhatsApp, social media, dan template broadcast yang menarik dalam
              hitungan detik.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="shrink-0 bg-white text-primary-700 hover:bg-slate-50 w-full md:w-auto"
          >
            <Sparkles size={16} /> Buat Promo
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5">
        {[
          { label: "Campaign Aktif", value: "8", v: "blue" as const, icon: <Megaphone size={22} /> },
          { label: "Reach Bulan Ini", value: "12.4K", v: "purple" as const, icon: <Users size={22} /> },
          { label: "Open Rate", value: "78%", v: "green" as const, icon: <Send size={22} /> },
          { label: "Conversion", value: "11%", v: "amber" as const, icon: <Sparkles size={22} /> },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                {s.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            </div>
            <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
              <Icon3D variant={s.v} size="lg" animate="float">
                {s.icon}
              </Icon3D>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Segmentasi Customer</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih segmen untuk broadcast tertarget
            </p>
          </CardHeader>
          <div className="p-3 space-y-2">
            {segments.map((s) => (
              <button
                key={s.name}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-primary-200"
              >
                <Icon3D variant={s.variant} size="md" animate="float">
                  {s.icon}
                </Icon3D>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-semibold text-sm text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.count} customer</div>
                </div>
                <span className="text-xs font-bold text-primary-600 inline-flex items-center gap-1">
                  Pilih <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Campaigns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
            <div>
              <CardTitle>Campaign Terbaru</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Performa broadcast WhatsApp</p>
            </div>
            <Button>
              <Plus size={16} /> Campaign Baru
            </Button>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {campaigns.map((c, i) => (
              <div key={i} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900">{c.name}</h4>
                      <Badge
                        variant={
                          c.status === "Sent"
                            ? "success"
                            : c.status === "Scheduled"
                            ? "primary"
                            : "default"
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{c.date}</p>
                    {c.sent > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Terkirim</div>
                          <div className="font-bold text-slate-900">{c.sent.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Dibaca</div>
                          <div className="font-bold text-slate-900">
                            {c.opened.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              ({c.sent ? Math.round((c.opened / c.sent) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Konversi</div>
                          <div className="font-bold text-green-600">
                            {c.cta}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              ({c.sent ? Math.round((c.cta / c.sent) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
