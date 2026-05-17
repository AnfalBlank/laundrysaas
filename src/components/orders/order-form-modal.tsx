"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, Textarea, Field } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import type { Service, Branch } from "@/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  services: Service[];
  branches: Branch[];
  onSuccess: () => void;
}

export function OrderFormModal({ open, onClose, services, branches, onSuccess }: Props) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    branchId: branches[0]?.id ?? "",
    serviceId: services[0]?.id ?? "",
    qty: 1,
    pickupType: "walk_in" as "walk_in" | "pickup",
    pickupAddress: "",
    isExpress: false,
    notes: "",
  });

  const selectedService = services.find((s) => s.id === form.serviceId);
  const total = (selectedService?.price ?? 0) * form.qty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      toast.error("Lengkapi data", "Nama dan no. HP customer wajib diisi");
      return;
    }
    if (form.qty <= 0) {
      toast.error("Quantity tidak valid", "Quantity harus lebih dari 0");
      return;
    }
    if (form.pickupType === "pickup" && !form.pickupAddress.trim()) {
      toast.error("Alamat pickup wajib", "Isi alamat untuk pickup");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Order berhasil dibuat", `Invoice: ${data.invoiceNumber}`);
      onSuccess();
      // Reset form
      setForm({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        branchId: branches[0]?.id ?? "",
        serviceId: services[0]?.id ?? "",
        qty: 1,
        pickupType: "walk_in",
        pickupAddress: "",
        isExpress: false,
        notes: "",
      });
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
      description="Input data order laundry baru"
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

        {/* Service */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Field label="Layanan" required>
              <Select
                value={form.serviceId}
                onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatCurrency(s.price)}/{s.pricingType.replace("per_", "")}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field
            label={selectedService?.pricingType === "per_kg" ? "Berat (kg)" : "Quantity"}
            required
          >
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: parseFloat(e.target.value) || 0 })}
              required
            />
          </Field>
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

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isExpress}
            onChange={(e) => setForm({ ...form, isExpress: e.target.checked })}
            className="rounded text-primary-600"
          />
          <span className="text-sm">Express (1 hari selesai, surcharge berlaku)</span>
        </label>

        <Field label="Catatan" hint="Permintaan khusus customer">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Parfum lavender, jangan terlalu kering, dll..."
            rows={2}
          />
        </Field>

        {/* Total preview */}
        <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-4 flex items-center justify-between border border-primary-100">
          <div>
            <div className="text-xs text-slate-600">Estimasi Total</div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</div>
          </div>
          {selectedService && (
            <div className="text-right text-xs text-slate-500">
              <div>{form.qty} × {formatCurrency(selectedService.price)}</div>
              <div className="mt-1">Estimasi {selectedService.durationDays} hari</div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
