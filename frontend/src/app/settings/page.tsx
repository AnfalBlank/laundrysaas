"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { cn } from "@/lib/utils";
import { Building2, Globe, Palette, Plug, Receipt, Shield, MessageCircleMore, CreditCard, Map, Cloud, Bot } from "lucide-react";

const tabs = [
  { id: "business", label: "Profil Bisnis", icon: <Building2 size={16} />, variant: "blue" as const },
  { id: "branches", label: "Cabang", icon: <Globe size={16} />, variant: "cyan" as const },
  { id: "appearance", label: "Branding", icon: <Palette size={16} />, variant: "pink" as const },
  { id: "integration", label: "Integrasi", icon: <Plug size={16} />, variant: "purple" as const },
  { id: "billing", label: "Subscription", icon: <Receipt size={16} />, variant: "amber" as const },
  { id: "security", label: "Keamanan", icon: <Shield size={16} />, variant: "red" as const },
];

const integrations = [
  { name: "Fonnte (WhatsApp)", desc: "WhatsApp gateway untuk notifikasi otomatis", connected: true, icon: <MessageCircleMore size={20} className="text-green-600" /> },
  { name: "Midtrans", desc: "Payment gateway QRIS, transfer, e-wallet", connected: true, icon: <CreditCard size={20} className="text-blue-600" /> },
  { name: "Xendit", desc: "Multi-method payment processing", connected: false, icon: <CreditCard size={20} className="text-cyan-600" /> },
  { name: "Google Maps", desc: "Tracking driver dan navigasi", connected: true, icon: <Map size={20} className="text-emerald-600" /> },
  { name: "Cloudflare R2", desc: "Storage foto dan invoice", connected: true, icon: <Cloud size={20} className="text-orange-600" /> },
  { name: "OpenAI", desc: "AI customer service dan content generator", connected: false, icon: <Bot size={20} className="text-purple-600" /> },
];

export default function SettingsPage() {
  const [active, setActive] = useState("business");

  return (
    <AppShell title="Settings" subtitle="Pengaturan akun dan sistem">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Sidebar tabs - horizontal on mobile, vertical on lg+ */}
        <Card className="lg:col-span-1 p-2 sm:p-3 h-fit">
          <div className="flex lg:flex-col gap-1 overflow-x-auto -mx-1 lg:mx-0 px-1 lg:px-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-xl text-sm transition-all whitespace-nowrap",
                  active === t.id
                    ? "bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon3D variant={t.variant} size="sm" interactive={false}>
                  {t.icon}
                </Icon3D>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-5">
          {active === "business" && (
            <Card>
              <CardHeader>
                <CardTitle>Profil Bisnis</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informasi dasar bisnis laundry Anda
                </p>
              </CardHeader>
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama Bisnis" defaultValue="Laundry Sukses" />
                <Field label="Subdomain" defaultValue="laundrysukses.laundryos.com" />
                <Field label="Email" defaultValue="hello@laundrysukses.id" />
                <Field label="No. WhatsApp" defaultValue="+62 812-1234-5678" />
                <div className="sm:col-span-2">
                  <Field label="Alamat Pusat" defaultValue="Jl. Sudirman No. 12, Jakarta Pusat" />
                </div>
                <Field label="Jam Operasional" defaultValue="07:00 - 21:00" />
                <Field label="Mata Uang" defaultValue="IDR (Rupiah)" />
              </div>
              <div className="px-4 sm:px-5 pb-5 flex flex-col sm:flex-row sm:justify-end gap-2">
                <Button variant="secondary">Batal</Button>
                <Button>Simpan Perubahan</Button>
              </div>
            </Card>
          )}

          {active === "integration" && (
            <Card>
              <CardHeader>
                <CardTitle>Integrasi Pihak Ketiga</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hubungkan layanan eksternal untuk fitur tambahan
                </p>
              </CardHeader>
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {integrations.map((i) => (
                  <div
                    key={i.name}
                    className="rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shrink-0">
                        {i.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{i.name}</h4>
                          <Badge variant={i.connected ? "success" : "default"}>
                            {i.connected ? "Terhubung" : "Belum"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{i.desc}</p>
                        <Button
                          variant={i.connected ? "secondary" : "primary"}
                          size="sm"
                          className="mt-3"
                        >
                          {i.connected ? "Atur" : "Hubungkan"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {active === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
              </CardHeader>
              <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 p-5 sm:p-6 text-white relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
                  <Badge className="bg-white/20 text-white border-white/30">CURRENT PLAN</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2">Pro Plan</h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    Multi outlet · Unlimited user · AI analytics · Custom branding
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold">Rp 499K</span>
                    <span className="text-sm opacity-80">/ bulan</span>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                    <Button
                      variant="secondary"
                      className="bg-white text-primary-700 hover:bg-slate-50 w-full sm:w-auto"
                    >
                      Upgrade Enterprise
                    </Button>
                    <span className="text-xs opacity-80">Berakhir 12 Juni 2026</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Order Bulan Ini", value: "1,284" },
                    { label: "Storage Terpakai", value: "2.4 GB" },
                    { label: "Pesan WA Terkirim", value: "8,420" },
                  ].map((u) => (
                    <div key={u.label} className="rounded-xl bg-slate-50 p-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        {u.label}
                      </div>
                      <div className="text-xl font-bold text-slate-900 mt-1">{u.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {active === "branches" && (
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Cabang</CardTitle>
              </CardHeader>
              <div className="p-5 space-y-3">
                {[
                  { name: "Cabang Pusat", address: "Jl. Sudirman No. 12, Jakarta", staff: 8, color: "blue" as const },
                  { name: "Cabang Selatan", address: "Jl. Kemang Raya 88, Jakarta", staff: 5, color: "cyan" as const },
                  { name: "Cabang Utara", address: "Jl. Boulevard 21, Jakarta", staff: 4, color: "purple" as const },
                ].map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-sm transition-all"
                  >
                    <Icon3D variant={b.color} size="md" animate="float">
                      <Building2 size={18} />
                    </Icon3D>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{b.staff}</div>
                      <div className="text-xs text-slate-500">staff</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Atur
                    </Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  + Tambah Cabang Baru
                </Button>
              </div>
            </Card>
          )}

          {active === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Branding & Tampilan</CardTitle>
              </CardHeader>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Warna Primer</label>
                  <div className="mt-2 flex gap-2">
                    {["#2563eb", "#06b6d4", "#10b981", "#7c3aed", "#db2777", "#f59e0b"].map((c) => (
                      <button
                        key={c}
                        className="w-10 h-10 rounded-xl shadow-md hover:scale-110 transition-transform border-2 border-white"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <Field label="Logo URL" defaultValue="https://laundrysukses.com/logo.png" />
                <Field label="Custom Domain" defaultValue="laundrysukses.com" />
              </div>
            </Card>
          )}

          {active === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
              </CardHeader>
              <div className="p-5 space-y-3">
                {[
                  { name: "Two-Factor Authentication", desc: "Tambahan keamanan login", on: true },
                  { name: "Audit Log", desc: "Catat seluruh aktivitas user", on: true },
                  { name: "IP Whitelist", desc: "Batasi akses berdasarkan IP", on: false },
                  { name: "Session Timeout", desc: "Auto logout 60 menit", on: true },
                ].map((opt) => (
                  <div
                    key={opt.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{opt.name}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={opt.on} />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-br peer-checked:from-primary-500 peer-checked:to-accent-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <Input defaultValue={defaultValue} className="mt-1.5" />
    </div>
  );
}
