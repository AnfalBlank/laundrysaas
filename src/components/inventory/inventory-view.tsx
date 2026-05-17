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
  Detergent3D,
  Perfume3D,
  Package3D,
  ChemicalFlask3D,
  AlertWarning3D,
  CartIcon3D,
  Money3D,
} from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowDown, ArrowUp, Plus, Truck } from "lucide-react";

const categoryMeta: Record<
  string,
  { icon: React.ReactNode; variant: Parameters<typeof Icon3D>[0]["variant"] }
> = {
  Sabun: { icon: <Detergent3D className="w-7 h-7" />, variant: "blue" },
  Parfum: { icon: <Perfume3D className="w-7 h-7" />, variant: "pink" },
  Packaging: { icon: <Package3D className="w-7 h-7" />, variant: "amber" },
  Chemical: { icon: <ChemicalFlask3D className="w-7 h-7" />, variant: "purple" },
};

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minimumStock: number;
}

export function InventoryView({ initialInventory }: { initialInventory: InventoryItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [adjustItem, setAdjustItem] = useState<{ item: InventoryItem; type: "in" | "out" } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    category: "Sabun",
    unit: "kg",
    stock: 0,
    minimumStock: 0,
  });
  const [adjustQty, setAdjustQty] = useState("");

  const lowStock = initialInventory.filter((i) => i.stock <= i.minimumStock);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Item ditambahkan", createForm.name);
      setShowCreate(false);
      setCreateForm({ name: "", category: "Sabun", unit: "kg", stock: 0, minimumStock: 0 });
      router.refresh();
    } catch (err) {
      toast.error("Gagal menambah", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    const qty = parseFloat(adjustQty);
    if (!qty || qty <= 0) {
      toast.error("Quantity tidak valid");
      return;
    }
    const delta = adjustItem.type === "in" ? qty : -qty;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${adjustItem.item.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delta,
          reason: adjustItem.type === "in" ? "restock" : "production",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(
        adjustItem.type === "in" ? "Stok masuk" : "Stok keluar",
        `${qty} ${adjustItem.item.unit} ${adjustItem.item.name}`
      );
      setAdjustItem(null);
      setAdjustQty("");
      router.refresh();
    } catch (err) {
      toast.error("Gagal update stok", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Alerts */}
      {lowStock.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Icon3D variant="amber" size="md" animate="wiggle">
                <AlertTriangle size={20} />
              </Icon3D>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-amber-900">
                  {lowStock.length} item perlu restock!
                </h3>
                <p className="text-xs text-amber-700 mt-0.5 break-words">
                  {lowStock.map((i) => i.name).join(", ")}
                </p>
              </div>
            </div>
            <Button
              className="shrink-0 sm:self-center"
              type="button"
              onClick={() =>
                toast.info("Buat Order Pembelian", "Fitur ini akan segera tersedia")
              }
            >
              <Truck size={14} /> Buat Order
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5">
        {[
          {
            label: "Total Item",
            value: initialInventory.length.toString(),
            icon: <Package3D className="w-9 h-9" />,
            v: "blue" as const,
          },
          {
            label: "Perlu Restock",
            value: lowStock.length.toString(),
            icon: <AlertWarning3D className="w-9 h-9" />,
            v: "amber" as const,
          },
          {
            label: "Order Bulan Ini",
            value: "12",
            icon: <CartIcon3D className="w-9 h-9" />,
            v: "cyan" as const,
          },
          {
            label: "Nilai Stok",
            value: "Rp 8.4 Jt",
            icon: <Money3D className="w-9 h-9" />,
            v: "green" as const,
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                {s.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
                {s.value}
              </div>
            </div>
            <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
              <Icon3D variant={s.v} size="lg" animate="float">
                {s.icon}
              </Icon3D>
            </div>
          </Card>
        ))}
      </div>

      {/* Inventory list */}
      <Card className="mt-4 sm:mt-5 overflow-hidden">
        <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle>Daftar Inventaris</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Stok operasional terbaru</p>
          </div>
          <Button
            className="shrink-0"
            type="button"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Item Baru</span>
            <span className="sm:hidden">Baru</span>
          </Button>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5">
          {initialInventory.map((item) => {
            const meta = categoryMeta[item.category] ?? {
              icon: <Package3D className="w-7 h-7" />,
              variant: "blue" as const,
            };
            const isLow = item.stock <= item.minimumStock;
            const ratio = Math.min(
              100,
              (item.stock / Math.max(item.minimumStock * 3, 1)) * 100
            );
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border p-4 hover:shadow-md transition-all",
                  isLow ? "border-amber-200 bg-amber-50/40" : "border-slate-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon3D variant={meta.variant} size="md" animate="float">
                    {meta.icon}
                  </Icon3D>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
                      {isLow && <Badge variant="warning">Low</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-slate-900">{item.stock}</span>
                  <span className="text-sm text-slate-500">{item.unit}</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    min {item.minimumStock}
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isLow
                        ? "bg-gradient-to-r from-amber-400 to-orange-500"
                        : "bg-gradient-to-r from-primary-400 to-accent-500"
                    )}
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    type="button"
                    onClick={() => setAdjustItem({ item, type: "out" })}
                  >
                    <ArrowDown size={12} /> Keluar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    type="button"
                    onClick={() => setAdjustItem({ item, type: "in" })}
                  >
                    <ArrowUp size={12} /> Masuk
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Item Inventory Baru"
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
              form="inv-form"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        <form id="inv-form" onSubmit={handleCreate} className="space-y-3">
          <Field label="Nama Item" required>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Detergent Premium"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori" required>
              <Select
                value={createForm.category}
                onChange={(e) =>
                  setCreateForm({ ...createForm, category: e.target.value })
                }
              >
                {["Sabun", "Parfum", "Packaging", "Chemical"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Unit" required>
              <Select
                value={createForm.unit}
                onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
              >
                {["kg", "L", "pcs", "box"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stok Awal">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={createForm.stock}
                onChange={(e) =>
                  setCreateForm({ ...createForm, stock: parseFloat(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Min. Stok">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={createForm.minimumStock}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    minimumStock: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Adjust Modal */}
      <Modal
        open={!!adjustItem}
        onClose={() => {
          setAdjustItem(null);
          setAdjustQty("");
        }}
        title={
          adjustItem
            ? `${adjustItem.type === "in" ? "Stok Masuk" : "Stok Keluar"} — ${adjustItem.item.name}`
            : ""
        }
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setAdjustItem(null);
                setAdjustQty("");
              }}
              disabled={submitting}
              type="button"
            >
              Batal
            </Button>
            <Button
              onClick={handleAdjust}
              disabled={submitting}
              type="submit"
              form="adjust-form"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        {adjustItem && (
          <form id="adjust-form" onSubmit={handleAdjust} className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="text-xs text-slate-500">Stok saat ini</div>
              <div className="font-bold text-slate-900">
                {adjustItem.item.stock} {adjustItem.item.unit}
              </div>
            </div>
            <Field
              label={`Quantity ${adjustItem.type === "in" ? "Masuk" : "Keluar"}`}
              required
            >
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="0"
                required
                autoFocus
              />
            </Field>
            <p className="text-xs text-slate-500">
              Stok setelah:{" "}
              <span className="font-semibold text-slate-900">
                {(
                  adjustItem.item.stock +
                  (adjustItem.type === "in" ? 1 : -1) * (parseFloat(adjustQty) || 0)
                ).toFixed(2)}{" "}
                {adjustItem.item.unit}
              </span>
            </p>
          </form>
        )}
      </Modal>
    </>
  );
}
