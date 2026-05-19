"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { useToast } from "@/components/ui/toast";
import { BranchesManager } from "./branches-manager";
import { SuppliersManager } from "./suppliers-manager";
import { cn } from "@/lib/utils";
import {
  Building2,
  Globe,
  Palette,
  Plug,
  Receipt,
  Shield,
  MessageCircleMore,
  CreditCard,
  Map,
  Cloud,
  Bot,
  Loader2,
  Send,
  Truck,
} from "lucide-react";

const tabs = [
  { id: "business", label: "Profil Bisnis", icon: <Building2 size={16} />, variant: "blue" as const },
  { id: "branches", label: "Cabang", icon: <Globe size={16} />, variant: "cyan" as const },
  { id: "suppliers", label: "Suppliers", icon: <Truck size={16} />, variant: "orange" as const },
  { id: "messaging", label: "Messaging", icon: <MessageCircleMore size={16} />, variant: "green" as const },
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

interface InitialTenant {
  name: string;
  subdomain: string;
  customDomain: string;
  logoUrl: string;
  primaryColor: string;
  messagingChannel: string;
  whatsappNumber: string;
  whatsappToken: string;
  telegramBotToken: string;
  telegramBotUsername: string;
}

export function SettingsView({ initialTenant }: { initialTenant: InitialTenant }) {
  const router = useRouter();
  const toast = useToast();
  const [active, setActive] = useState("business");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialTenant);
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      toast.success(
        "Perubahan disimpan",
        "Sidebar dan branding ter-update otomatis"
      );
      // Refresh server components — sidebar akan re-fetch tenant info
      router.refresh();
    } catch (err) {
      toast.error("Gagal menyimpan", String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAction = (label: string) =>
    toast.info(label, "Fitur ini akan tersedia di update berikutnya");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Sidebar tabs */}
      <Card className="lg:col-span-1 p-2 sm:p-3 h-fit">
        <div className="flex lg:flex-col gap-1 overflow-x-auto -mx-1 lg:mx-0 px-1 lg:px-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-xl text-sm transition-all whitespace-nowrap",
                active === t.id
                  ? "bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon3D variant={t.variant} size="sm">
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
                Informasi dasar bisnis. Perubahan langsung tersinkron ke seluruh halaman.
              </p>
            </CardHeader>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Nama Bisnis"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Laundry Sukses"
              />
              <FieldInput
                label="Subdomain"
                value={form.subdomain}
                onChange={(v) => setForm({ ...form, subdomain: v })}
                placeholder="laundrysukses"
                hint=".laundryhub.id"
              />
              <FieldInput
                label="Custom Domain"
                value={form.customDomain}
                onChange={(v) => setForm({ ...form, customDomain: v })}
                placeholder="app.laundrysukses.com"
              />
              <FieldInput
                label="Logo URL"
                value={form.logoUrl}
                onChange={(v) => setForm({ ...form, logoUrl: v })}
                placeholder="https://..."
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Warna Primer</label>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-32"
                    placeholder="#2563eb"
                  />
                  <div className="flex gap-1.5">
                    {["#2563eb", "#06b6d4", "#10b981", "#7c3aed", "#db2777", "#f59e0b"].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setForm({ ...form, primaryColor: c })}
                          className={cn(
                            "w-7 h-7 rounded-lg border-2 transition",
                            form.primaryColor === c
                              ? "border-slate-900 scale-110"
                              : "border-white shadow-sm"
                          )}
                          style={{ background: c }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-5 pb-5 flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setForm(initialTenant)}
                disabled={saving}
              >
                Reset
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </Card>
        )}

        {active === "branches" && (
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Cabang</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambah, edit, atau hapus cabang. Perubahan tersimpan ke database.
              </p>
            </CardHeader>
            <BranchesManager />
          </Card>
        )}

        {active === "suppliers" && (
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Supplier</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar supplier untuk Purchase Orders. Tambah supplier sebelum buat PO.
              </p>
            </CardHeader>
            <SuppliersManager />
          </Card>
        )}

        {active === "messaging" && (
          <Card>
            <CardHeader>
              <CardTitle>Channel Messaging</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih channel utama untuk notifikasi otomatis &amp; customer service.
                Semua automation akan menggunakan channel yang dipilih.
              </p>
            </CardHeader>
            <div className="p-4 sm:p-5 space-y-5">
              {/* Channel selector */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Channel Aktif</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, messagingChannel: "whatsapp" })}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left transition-all",
                      form.messagingChannel === "whatsapp"
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                        <MessageCircleMore size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">WhatsApp</div>
                        <div className="text-xs text-slate-500">via Fonnte / WAHA</div>
                      </div>
                    </div>
                    {form.messagingChannel === "whatsapp" && (
                      <Badge variant="success" className="mt-2">Aktif</Badge>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, messagingChannel: "telegram" })}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left transition-all",
                      form.messagingChannel === "telegram"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                        <Send size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Telegram</div>
                        <div className="text-xs text-slate-500">via Telegram Bot API</div>
                      </div>
                    </div>
                    {form.messagingChannel === "telegram" && (
                      <Badge variant="primary" className="mt-2">Aktif</Badge>
                    )}
                  </button>
                </div>
              </div>

              {/* WhatsApp config */}
              {form.messagingChannel === "whatsapp" && (
                <div className="space-y-3 rounded-xl border border-green-200 bg-green-50/50 p-4">
                  <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <MessageCircleMore size={16} className="text-green-600" />
                    Konfigurasi WhatsApp
                  </h4>
                  <FieldInput
                    label="Nomor WhatsApp"
                    value={form.whatsappNumber}
                    onChange={(v) => setForm({ ...form, whatsappNumber: v })}
                    placeholder="+62 812-xxxx-xxxx"
                  />
                  <FieldInput
                    label="API Token (Fonnte)"
                    value={form.whatsappToken}
                    onChange={(v) => setForm({ ...form, whatsappToken: v })}
                    placeholder="Token dari dashboard Fonnte"
                  />
                </div>
              )}

              {/* Telegram config */}
              {form.messagingChannel === "telegram" && (
                <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <Send size={16} className="text-blue-600" />
                    Konfigurasi Telegram
                  </h4>
                  <FieldInput
                    label="Bot Token"
                    value={form.telegramBotToken}
                    onChange={(v) => setForm({ ...form, telegramBotToken: v })}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  />
                  <FieldInput
                    label="Bot Username"
                    value={form.telegramBotUsername}
                    onChange={(v) => setForm({ ...form, telegramBotUsername: v })}
                    placeholder="@YourLaundryBot"
                  />
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Webhook URL</label>
                    <p className="text-[11px] text-slate-500 mb-1">URL publik app Anda (Vercel). Contoh: https://laundrysaas.vercel.app</p>
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-app.vercel.app"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        if (!webhookUrl.trim()) {
                          toast.error("Isi Webhook URL dulu", "Masukkan URL Vercel Anda di field di atas");
                          return;
                        }
                        const fullUrl = webhookUrl.replace(/\/$/, "") + "/api/telegram/webhook";
                        try {
                          const res = await fetch("/api/telegram/setup", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ webhookUrl: fullUrl }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            toast.success("Webhook Telegram aktif!", fullUrl);
                          } else {
                            toast.error("Gagal setup webhook", data.error || JSON.stringify(data));
                          }
                        } catch (e) {
                          toast.error("Gagal menghubungi server", String(e));
                        }
                      }}
                    >
                      <Plug size={14} /> Aktifkan Webhook
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/telegram/setup");
                          const data = await res.json();
                          if (data.webhookInfo?.url) {
                            toast.success("Webhook aktif", data.webhookInfo.url);
                          } else {
                            toast.info("Webhook belum di-setup", "Isi URL dan klik Aktifkan Webhook");
                          }
                        } catch {
                          toast.error("Gagal cek status");
                        }
                      }}
                    >
                      Cek Status
                    </Button>
                  </div>
                  <div className="text-xs text-slate-500 bg-white rounded-lg p-3 border border-blue-100">
                    <strong>Cara setup:</strong>
                    <ol className="mt-1 space-y-1 list-decimal list-inside">
                      <li>Buka @BotFather di Telegram → /newbot → copy token</li>
                      <li>Paste token di field &quot;Bot Token&quot; di atas</li>
                      <li>Klik <b>Simpan Channel</b></li>
                      <li>Isi <b>Webhook URL</b> dengan URL Vercel Anda (tanpa /api/...)</li>
                      <li>Klik <b>Aktifkan Webhook</b></li>
                      <li>Chat bot Anda di Telegram → bot akan auto-reply!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <strong>Catatan:</strong> Mengganti channel akan mengalihkan semua notifikasi otomatis
                (order diterima, pickup driver, laundry selesai, dll) ke channel yang dipilih.
                Template pesan tetap sama, hanya delivery channel yang berubah.
              </div>
            </div>
            <div className="px-4 sm:px-5 pb-5 flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Channel"
                )}
              </Button>
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
                        type="button"
                        onClick={() =>
                          handleAction(
                            i.connected ? `Atur ${i.name}` : `Hubungkan ${i.name}`
                          )
                        }
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
                    type="button"
                    onClick={() => handleAction("Upgrade Enterprise")}
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

        {active === "appearance" && (
          <Card>
            <CardHeader>
              <CardTitle>Branding & Tampilan</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Preview branding aktif. Edit di tab &quot;Profil Bisnis&quot; untuk menyimpan.
              </p>
            </CardHeader>
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Warna Primer Aktif</label>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl shadow-md border-2 border-white"
                    style={{ background: form.primaryColor }}
                  />
                  <div>
                    <div className="font-mono text-sm text-slate-900">{form.primaryColor}</div>
                    <div className="text-xs text-slate-500">
                      Tab &quot;Profil Bisnis&quot; untuk ubah
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Preview</label>
                <div className="mt-2 rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ background: form.primaryColor }}
                  >
                    {form.name.charAt(0).toUpperCase() || "L"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{form.name || "LaundryHub"}</div>
                    <div className="text-xs text-slate-500">
                      {form.subdomain || "subdomain"}.laundryhub.id
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {active === "security" && <SecurityTab toast={toast} />}
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        {hint && <span className="text-xs text-slate-400 shrink-0">{hint}</span>}
      </div>
    </div>
  );
}


function SecurityTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [settings, setSettings] = useState<{
    twoFactorEnabled: boolean;
    auditLogEnabled: boolean;
    ipWhitelistEnabled: boolean;
    sessionTimeoutEnabled: boolean;
    sessionTimeoutMinutes: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/security")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: string, value: boolean, label: string) => {
    try {
      const res = await fetch("/api/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error("Failed");
      setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      toast.success(`${label} ${value ? "diaktifkan" : "dinonaktifkan"}`, "Tersimpan");
    } catch {
      toast.error("Gagal simpan");
    }
  };

  const options = [
    {
      key: "twoFactorEnabled",
      name: "Two-Factor Authentication",
      desc: "Tambahan keamanan login dengan OTP",
    },
    {
      key: "auditLogEnabled",
      name: "Audit Log",
      desc: "Catat seluruh aktivitas user",
    },
    {
      key: "ipWhitelistEnabled",
      name: "IP Whitelist",
      desc: "Batasi akses berdasarkan IP",
    },
    {
      key: "sessionTimeoutEnabled",
      name: "Session Timeout",
      desc: "Auto logout setelah 60 menit idle",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keamanan</CardTitle>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi keamanan tenant. Perubahan tersimpan ke database.
        </p>
      </CardHeader>
      <div className="p-4 sm:p-5 space-y-3">
        {loading && <div className="text-sm text-slate-400 py-4 text-center">Memuat...</div>}
        {!loading &&
          settings &&
          options.map((opt) => {
            const value = settings[opt.key as keyof typeof settings] as boolean;
            return (
              <div
                key={opt.key}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-900">{opt.name}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={(e) => toggle(opt.key, e.target.checked, opt.name)}
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-br peer-checked:from-primary-500 peer-checked:to-accent-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            );
          })}
      </div>
    </Card>
  );
}
