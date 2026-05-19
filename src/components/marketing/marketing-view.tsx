"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select, Textarea, Field } from "@/components/ui/select";
import { Icon3D } from "@/components/ui/icon3d";
import { Sparkles3D } from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import {
  ArrowRight,
  Crown,
  Megaphone,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Users,
  Moon,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  segment: string | null;
  channel: string;
  body: string;
  status: string;
  scheduledAt: Date | null;
  sentAt: Date | null;
  recipientCount: number;
  deliveredCount: number;
  readCount: number;
  conversionCount: number;
  createdAt: Date;
}

interface SegmentStats {
  vip: number;
  newCustomers: number;
  repeat: number;
  inactive: number;
}

const aiTemplates = [
  "🎉 Promo spesial khusus member {tier}! Dapatkan diskon 20% untuk semua layanan reguler. Berlaku sampai {date}. Pesan sekarang sebelum kehabisan!",
  "Halo Kak {name}, sudah lama nih kita tidak bertemu. Yuk laundry lagi dengan diskon 15% pakai kode COMEBACK. Kami rindu pelanggan setia kami!",
  "🌟 Promo Akhir Bulan! Cuci 5kg gratis 1kg di semua cabang. Promo terbatas, buruan order via WhatsApp ya kak!",
];

export default function MarketingView({
  initialCampaigns = [],
  segments: segmentStats = { vip: 0, newCustomers: 0, repeat: 0, inactive: 0 },
}: {
  initialCampaigns?: Campaign[];
  segments?: SegmentStats;
} = {}) {
  const router = useRouter();
  const toast = useToast();

  const segments = [
    { name: "VIP Platinum", count: segmentStats.vip, variant: "purple" as const, icon: <Crown size={20} /> },
    { name: "New Customer", count: segmentStats.newCustomers, variant: "cyan" as const, icon: <Star size={20} /> },
    { name: "Repeat Order ≥ 5", count: segmentStats.repeat, variant: "blue" as const, icon: <RotateCcw size={20} /> },
    { name: "Inactive 30 hari", count: segmentStats.inactive, variant: "amber" as const, icon: <Moon size={20} /> },
  ];

  // Display campaigns from DB
  const displayCampaigns = initialCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status === "sent" ? "Sent" as const : c.status === "scheduled" ? "Scheduled" as const : "Draft" as const,
    sent: c.deliveredCount,
    opened: c.readCount,
    cta: c.conversionCount,
    date: c.scheduledAt
      ? new Date(c.scheduledAt).toLocaleDateString("id-ID")
      : c.sentAt
      ? new Date(c.sentAt).toLocaleDateString("id-ID")
      : new Date(c.createdAt).toLocaleDateString("id-ID"),
  }));

  const [campaigns, setCampaigns] = useState(displayCampaigns);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [campForm, setCampForm] = useState({
    name: "",
    segment: "VIP Platinum",
    message: "",
    scheduledAt: "",
  });

  const openCampaign = (segment?: string) => {
    setCampForm({
      name: "",
      segment: segment ?? "VIP Platinum",
      message: "",
      scheduledAt: "",
    });
    setSelectedSegment(segment ?? null);
    setShowCampaign(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campForm.name.trim() || !campForm.message.trim()) {
      toast.error("Lengkapi data", "Nama campaign dan pesan wajib");
      return;
    }
    setSubmitting(true);

    const segment = segments.find((s) => s.name === campForm.segment);
    const status = campForm.scheduledAt ? "scheduled" : "sent";

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campForm.name,
          segment: campForm.segment,
          channel: "whatsapp",
          body: campForm.message,
          status,
          scheduledAt: campForm.scheduledAt || undefined,
          recipientCount: segment?.count ?? 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success(
        campForm.scheduledAt ? "Campaign dijadwalkan" : "Campaign tersimpan",
        `${segment?.count ?? 0} customer akan menerima`
      );
      setShowCampaign(false);
      router.refresh();
    } catch (err) {
      toast.error("Gagal simpan campaign", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const useAITemplate = (template: string) => {
    setCampForm({ ...campForm, message: template });
    setShowAI(false);
    toast.success("Template AI dipakai", "Edit pesan sesuai kebutuhan");
  };

  return (
    <>
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
            <h2 className="text-xl sm:text-2xl font-bold mt-2">Generate Promo dengan AI</h2>
            <p className="text-xs sm:text-sm opacity-90 mt-1">
              AI siapkan template caption WhatsApp siap-pakai. Pilih, edit, kirim.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            type="button"
            onClick={() => setShowAI(true)}
            className="shrink-0 bg-white text-primary-700 hover:bg-slate-50 w-full md:w-auto"
          >
            <Sparkles size={16} /> Buat Promo
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5">
        {[
          {
            label: "Campaign Aktif",
            value: campaigns.length.toString(),
            v: "blue" as const,
            icon: <Megaphone size={22} />,
          },
          {
            label: "Reach Bulan Ini",
            value: campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString(),
            v: "purple" as const,
            icon: <Users size={22} />,
          },
          { label: "Open Rate", value: "—", v: "green" as const, icon: <Send size={22} /> },
          { label: "Conversion", value: "—", v: "amber" as const, icon: <Sparkles size={22} /> },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                {s.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            </div>
            <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
              <Icon3D variant={s.v} size="lg">
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
                type="button"
                onClick={() => openCampaign(s.name)}
                key={s.name}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-primary-200"
              >
                <Icon3D variant={s.variant} size="md">
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
            <Button type="button" onClick={() => openCampaign()}>
              <Plus size={16} /> Campaign Baru
            </Button>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {campaigns.map((c) => (
              <div key={c.id} className="px-4 sm:px-5 py-4 hover:bg-slate-50/60 transition-colors">
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
                          <div className="font-bold text-slate-900">
                            {c.sent.toLocaleString()}
                          </div>
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

      {/* Campaign Modal */}
      <Modal
        open={showCampaign}
        onClose={() => setShowCampaign(false)}
        title={selectedSegment ? `Campaign untuk ${selectedSegment}` : "Buat Campaign Baru"}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowCampaign(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="camp-form"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? "Mengirim..."
                : campForm.scheduledAt
                ? "Jadwalkan"
                : "Kirim Sekarang"}
            </Button>
          </>
        }
      >
        <form id="camp-form" onSubmit={handleSubmit} className="space-y-3">
          <Field label="Nama Campaign" required>
            <Input
              value={campForm.name}
              onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
              placeholder="Promo Akhir Bulan Mei"
              required
              autoFocus
            />
          </Field>
          <Field label="Target Segmen" required>
            <Select
              value={campForm.segment}
              onChange={(e) => setCampForm({ ...campForm, segment: e.target.value })}
            >
              {segments.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.count} customer)
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pesan WhatsApp" required hint="Bisa pakai placeholder {name}, {tier}, {date}">
            <div className="space-y-2">
              <Textarea
                value={campForm.message}
                onChange={(e) => setCampForm({ ...campForm, message: e.target.value })}
                placeholder="Halo Kak {name}, promo spesial..."
                rows={4}
                required
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowAI(true)}
              >
                <Sparkles size={12} /> Pakai Template AI
              </Button>
            </div>
          </Field>
          <Field label="Jadwal" hint="Kosongkan untuk kirim sekarang">
            <Input
              type="datetime-local"
              value={campForm.scheduledAt}
              onChange={(e) => setCampForm({ ...campForm, scheduledAt: e.target.value })}
            />
          </Field>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
            <strong>Estimasi reach:</strong>{" "}
            {segments.find((s) => s.name === campForm.segment)?.count ?? 0} customer akan
            menerima pesan ini.
          </div>
        </form>
      </Modal>

      {/* AI Template Picker */}
      <Modal
        open={showAI}
        onClose={() => setShowAI(false)}
        title="AI Template Generator"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Pilih template yang sesuai, lalu edit untuk menyesuaikan campaign Anda.
          </p>
          {aiTemplates.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => useAITemplate(t)}
              className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all"
            >
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-primary-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{t}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
