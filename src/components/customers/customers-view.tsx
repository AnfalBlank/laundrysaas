"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Field, Textarea } from "@/components/ui/select";
import { Icon3D } from "@/components/ui/icon3d";
import { useToast } from "@/components/ui/toast";
import { exportToCSV } from "@/lib/export";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  MessageCircle,
  Plus,
  Search,
  Crown,
  Star,
  User as UserIcon,
  RotateCcw,
  Moon,
  Download,
} from "lucide-react";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  tier: string;
  points: number;
  totalOrders: number;
  totalSpending: number;
  createdAt: Date | null;
}

const tierColors: Record<string, string> = {
  silver: "bg-slate-100 text-slate-700",
  gold: "bg-amber-100 text-amber-700",
  platinum: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700",
};

const tierVariant: Record<string, Parameters<typeof Icon3D>[0]["variant"]> = {
  silver: "indigo",
  gold: "amber",
  platinum: "purple",
};

const tierLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export function CustomersView({
  initialCustomers,
  stats,
}: {
  initialCustomers: CustomerRow[];
  stats: { total: number; vip: number };
}) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<string>("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const filtered = useMemo(() => {
    return initialCustomers.filter((c) => {
      const matchesTier = tier === "ALL" || c.tier === tier.toLowerCase();
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
      return matchesTier && matchesQuery;
    });
  }, [tier, query, initialCustomers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Lengkapi data", "Nama dan no. HP wajib");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Customer ditambahkan", form.name);
      setShowCreate(false);
      setForm({ name: "", phone: "", address: "", notes: "" });
      router.refresh();
    } catch (err) {
      toast.error("Gagal menambah customer", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.warning("Tidak ada data");
      return;
    }
    exportToCSV(
      filtered.map((c) => ({
        Name: c.name,
        Phone: c.phone,
        Tier: tierLabel(c.tier),
        "Total Orders": c.totalOrders,
        "Total Spending": c.totalSpending,
        Points: c.points,
        "Created At": c.createdAt ? formatDate(c.createdAt) : "",
      })),
      `customers-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success("Export berhasil", `${filtered.length} customer ter-export`);
  };

  const chatWA = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "").replace(/^0/, "62");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  return (
    <>
      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Total Customer
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {stats.total}
            </div>
            <div className="text-[11px] text-green-600 font-semibold mt-1">
              {filtered.length} ter-filter
            </div>
          </div>
          <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
            <Icon3D variant="purple" size="lg">
              <UserIcon size={24} />
            </Icon3D>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              VIP / Platinum
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats.vip}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              {stats.total > 0 ? ((stats.vip / stats.total) * 100).toFixed(1) : 0}% dari total
            </div>
          </div>
          <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
            <Icon3D variant="amber" size="lg">
              <Crown size={24} />
            </Icon3D>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Repeat Order
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">68%</div>
            <div className="text-[11px] text-green-600 font-semibold mt-1">+4% MoM</div>
          </div>
          <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
            <Icon3D variant="green" size="lg">
              <RotateCcw size={24} />
            </Icon3D>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Inactive 30 hari
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">142</div>
            <div className="text-[11px] text-red-600 font-semibold mt-1">Perlu retensi</div>
          </div>
          <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
            <Icon3D variant="red" size="lg">
              <Moon size={24} />
            </Icon3D>
          </div>
        </Card>
      </div>

      {/* Action bar */}
      <Card className="mt-4 sm:mt-5 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau nomor HP..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1 sm:flex-none">
            {["ALL", "Silver", "Gold", "Platinum"].map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                type="button"
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  tier === t
                    ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white border-transparent shadow-md shadow-primary-500/30"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary-200"
                )}
              >
                {t === "ALL" ? "Semua" : t}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={handleExport}
            type="button"
            className="shrink-0"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowCreate(true)} type="button" className="shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">Customer Baru</span>
            <span className="sm:hidden">Baru</span>
          </Button>
        </div>
      </Card>

      {/* Customer grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card
            key={c.id}
            className="tilt-card p-5 relative overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/30 to-transparent rounded-full -translate-y-12 translate-x-12" />
            <div className="relative">
              <div className="flex items-start gap-3">
                <Icon3D variant={tierVariant[c.tier]} size="lg">
                  {c.tier === "platinum" ? (
                    <Crown size={24} />
                  ) : c.tier === "gold" ? (
                    <Star size={24} />
                  ) : (
                    <UserIcon size={24} />
                  )}
                </Icon3D>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{c.name}</h3>
                  <p className="text-xs text-slate-500">{c.phone}</p>
                  <span
                    className={cn(
                      "inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full",
                      tierColors[c.tier]
                    )}
                  >
                    {tierLabel(c.tier)} Member
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="rounded-xl bg-slate-50 p-2.5 min-w-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Order</div>
                  <div className="font-bold text-slate-900 text-base">{c.totalOrders}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 min-w-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Spent</div>
                  <div className="font-bold text-slate-900 text-[11px] truncate">
                    {formatCurrency(c.totalSpending)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 min-w-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Poin</div>
                  <div className="font-bold text-amber-600 text-base">{c.points}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  size="sm"
                  type="button"
                  onClick={() => chatWA(c.phone)}
                >
                  <MessageCircle size={14} /> Chat
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  type="button"
                  onClick={() => toast.info("Detail belum tersedia", "Coming soon")}
                >
                  Detail
                </Button>
              </div>
              {c.createdAt && (
                <p className="text-[11px] text-slate-400 mt-3">
                  Bergabung sejak {formatDate(c.createdAt)}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="mt-4 p-10 flex flex-col items-center text-center">
          <Icon3D variant="purple" size="xl">
            <UserIcon size={32} />
          </Icon3D>
          <h3 className="mt-4 font-semibold text-slate-900">Tidak ada customer</h3>
          <p className="text-sm text-slate-500 mt-1">
            Tidak ada customer yang cocok dengan filter saat ini.
          </p>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Customer Baru"
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
            <Button onClick={handleCreate} disabled={submitting} type="submit" form="cust-form">
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        <form id="cust-form" onSubmit={handleCreate} className="space-y-3">
          <Field label="Nama" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama lengkap"
              required
            />
          </Field>
          <Field label="No. HP" required>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0812-xxxx-xxxx"
              required
            />
          </Field>
          <Field label="Alamat">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat lengkap (opsional)"
            />
          </Field>
          <Field label="Catatan">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Catatan internal (opsional)"
              rows={2}
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
