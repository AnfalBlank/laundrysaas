"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, Textarea, Field } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Service, Branch } from "@/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  services: Service[];
  branches: Branch[];
  onSuccess: () => void;
}

interface ItemRow {
  id: string;
  serviceId: string;
  qty: number;
}

export function OrderFormModal({ open, onClose, services, branches, onSuccess }: Props) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    branchId: branches[0]?.id ?? "",
    pickupType: "walk_in" as "walk_in" | "pickup",
    pickupAddress: "",
    isExpress: false,
    discount: 0,
    notes: "",
  });

  const [items, setItems] = useState<ItemRow[]>([
    { id: "row1", serviceId: services[0]?.id ?? "", qty: 1 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: `row${Date.now()}`, serviceId: services[0]?.id ?? "", qty: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<ItemRow>) => {
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  // Compute totals
  const subtotal = items.reduce((sum, item) => {
    const svc = services.find((s) => s.id === item.serviceId);
    return sum + (svc?.price ?? 0) * item.qty;
  }, 0);
  const expressSurcharge = form.isExpress ? Math.floor(subtotal * 0.5) : 0;
  const total = Math.max(0, subtotal + expressSurcharge - form.discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      toast.error("Lengkapi data", "Nama dan no. HP customer wajib diisi");
      return;
    }
    if (items.some((i) => !i.serviceId || i.qty <= 0)) {
      toast.error("Item tidak valid", "Pilih layanan dan qty > 0 untuk semua item");
      return;
    }
    if (form.pickupType === "pickup" && !form.pickupAddress.trim()) {
      toast.error("Alamat pickup wajib", "Isi alamat untuk pickup");
      return;
    }
    if (form.discount < 0 || form.discount > total + form.discount) {
      toast.error("Diskon tidak valid");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ serviceId: i.serviceId, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Order berhasil dibuat", `Invoice: ${data.invoiceNumber}`);
      onSuccess();
      // Reset form
      setForm({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        branchId: branches[0]?.id ?? "",
        pickupType: "walk_in",
        pickupAddress: "",
        isExpress: false,
        discount: 0,
        notes: "",
      });
      setItems([{ id: "row1", serviceId: services[0]?.id ?? "", qty: 1 }]);
    } catch (err) {
      toast.error("Gagal membuat order", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Order Baru"
      description="Input data order laundry baru — bisa multi-item"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting} type="button">
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            type="submit"
            form="order-form"
          >
            {submitting ? "Menyimpan..." : "Simpan Order"}
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Customer info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nama Customer" required>
            <Input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Andi Pratama"
              required
            />
          </Field>
          <Field label="No. HP" required>
            <Input
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              placeholder="0812-xxxx-xxxx"
              required
            />
          </Field>
        </div>

        <Field label="Alamat Customer" hint="Opsional, bisa diisi nanti">
          <Input
            value={form.customerAddress}
            onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
            placeholder="Jl. ..."
          />
        </Field>

        {/* Branch */}
        {branches.length > 0 && (
          <Field label="Cabang">
            <Select
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {/* Multi-item */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Items Layanan</label>
            <button
              type="button"
              onClick={addItem}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <Plus size={12} /> Tambah Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item) => {
              const svc = services.find((s) => s.id === item.serviceId);
              const lineTotal = (svc?.price ?? 0) * item.qty;
              return (
                <div key={item.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      value={item.serviceId}
                      onChange={(e) => updateItem(item.id, { serviceId: e.target.value })}
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {formatCurrency(s.price)}/{s.pricingType.replace("per_", "")}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(item.id, { qty: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Qty"
                    />
                  </div>
                  <div className="w-28 text-sm pt-2 text-slate-700 text-right font-semibold">
                    {formatCurrency(lineTotal)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pickup type */}
        <Field label="Tipe Layanan">
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                form.pickupType === "walk_in"
                  ? "border-primary-500 bg-primary-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                checked={form.pickupType === "walk_in"}
                onChange={() => setForm({ ...form, pickupType: "walk_in" })}
                className="text-primary-600"
              />
              <span className="text-sm font-medium">Walk-in</span>
            </label>
            <label
              className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                form.pickupType === "pickup"
                  ? "border-primary-500 bg-primary-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                checked={form.pickupType === "pickup"}
                onChange={() => setForm({ ...form, pickupType: "pickup" })}
                className="text-primary-600"
              />
              <span className="text-sm font-medium">Pickup</span>
            </label>
          </div>
        </Field>

        {form.pickupType === "pickup" && (
          <Field label="Alamat Pickup" required>
            <Input
              value={form.pickupAddress}
              onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
              placeholder="Alamat lengkap untuk pickup"
              required
            />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-amber-300 transition">
            <input
              type="checkbox"
              checked={form.isExpress}
              onChange={(e) => setForm({ ...form, isExpress: e.target.checked })}
              className="rounded text-primary-600"
            />
            <span className="text-sm">Express (+50% surcharge)</span>
          </label>
          <Field label="Diskon (Rp)" hint="Opsional">
            <Input
              type="number"
              min="0"
              step="1000"
              value={form.discount}
              onChange={(e) =>
                setForm({ ...form, discount: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </Field>
        </div>

        <Field label="Catatan" hint="Permintaan khusus customer">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Parfum lavender, jangan terlalu kering, dll..."
            rows={2}
          />
        </Field>

        {/* Total preview */}
        <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-4 border border-primary-100 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {form.isExpress && (
            <div className="flex items-center justify-between text-xs text-amber-700">
              <span>Express surcharge (+50%)</span>
              <span>+ {formatCurrency(expressSurcharge)}</span>
            </div>
          )}
          {form.discount > 0 && (
            <div className="flex items-center justify-between text-xs text-green-700">
              <span>Diskon</span>
              <span>− {formatCurrency(form.discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-primary-200">
            <span className="text-sm font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
