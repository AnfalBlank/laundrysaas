"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select, Field } from "@/components/ui/select";
import { Icon3D } from "@/components/ui/icon3d";
import { WashingMachine3D, Bolt3D, Sparkles3D } from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Tag } from "lucide-react";
import type { Service } from "@/db/schema";

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

export function ServicesView({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "regular" as "regular" | "express" | "special",
    pricingType: "per_kg" as "per_kg" | "per_item" | "per_unit",
    price: 0,
    durationDays: 2,
  });

  const grouped = initialServices.reduce<Record<string, typeof initialServices>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error("Lengkapi data", "Nama dan harga wajib");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Layanan ditambahkan", form.name);
      setShowCreate(false);
      setForm({
        name: "",
        category: "regular",
        pricingType: "per_kg",
        price: 0,
        durationDays: 2,
      });
      router.refresh();
    } catch (err) {
      toast.error("Gagal menambah", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0">
            <Icon3D variant="cyan" size="md">
              <Tag size={20} />
            </Icon3D>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">
              {initialServices.length} Layanan Aktif
            </div>
            <div className="text-xs text-slate-500">
              Tersusun dalam {Object.keys(grouped).length} kategori
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none"
            type="button"
            onClick={() => toast.info("Promo Harga", "Fitur akan segera tersedia")}
          >
            Promo Harga
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => setShowCreate(true)}
            type="button"
          >
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
              <Icon3D variant={meta.variant} size="sm">
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
                      <Icon3D variant={meta.variant} size="lg">
                        {meta.icon}
                      </Icon3D>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info("Edit Layanan", "Fitur akan segera tersedia")
                        }
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50"
                        aria-label="Edit"
                      >
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

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Layanan Baru"
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
            <Button
              onClick={handleCreate}
              disabled={submitting}
              type="submit"
              form="svc-form"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        <form id="svc-form" onSubmit={handleCreate} className="space-y-3">
          <Field label="Nama Layanan" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Cuci Setrika Premium"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori" required>
              <Select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as typeof form.category })
                }
              >
                <option value="regular">Reguler</option>
                <option value="express">Express</option>
                <option value="special">Spesial</option>
              </Select>
            </Field>
            <Field label="Tipe Harga" required>
              <Select
                value={form.pricingType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricingType: e.target.value as typeof form.pricingType,
                  })
                }
              >
                <option value="per_kg">Per Kg</option>
                <option value="per_item">Per Item</option>
                <option value="per_unit">Per Unit</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga (Rp)" required>
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                required
              />
            </Field>
            <Field label="Durasi (hari)" required>
              <Input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) =>
                  setForm({ ...form, durationDays: parseInt(e.target.value) || 1 })
                }
                required
              />
            </Field>
          </div>
        </form>
      </Modal>
    </>
  );
}
