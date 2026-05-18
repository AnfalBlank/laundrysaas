"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, Textarea, Field } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { statusLabels, statusColors, type OrderStatus } from "@/lib/dummy-data";
import { Loader2, Edit2, Save, X, Trash2 } from "lucide-react";

interface Props {
  customerId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function CustomerDetailModal({ customerId, onClose, onUpdate }: Props) {
  const toast = useToast();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    tier: "silver" as "silver" | "gold" | "platinum",
    isBlacklisted: false,
  });

  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      setEditing(false);
      return;
    }
    setLoading(true);
    fetch(`/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
          setForm({
            name: data.customer.name ?? "",
            phone: data.customer.phone ?? "",
            address: data.customer.address ?? "",
            notes: data.customer.notes ?? "",
            tier: data.customer.tier ?? "silver",
            isBlacklisted: data.customer.isBlacklisted ?? false,
          });
        }
      })
      .catch(() => toast.error("Gagal memuat data customer"))
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleSave = async () => {
    if (!customerId) return;
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Nama dan no. HP wajib");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Customer ter-update", form.name);
      setCustomer({ ...customer, ...form });
      setEditing(false);
      onUpdate();
    } catch (err) {
      toast.error("Gagal update", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!customerId || !customer) return;
    if (
      !confirm(
        `Hapus customer "${customer.name}"? Aksi ini tidak bisa di-undo.\n\nNote: customer dengan order tidak bisa dihapus, gunakan blacklist sebagai alternatif.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Customer dihapus");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Gagal hapus", String(err));
    }
  };

  const open = !!customerId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Customer" : "Detail Customer"}
      size="lg"
      footer={
        editing ? (
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditing(false)}
              disabled={submitting}
            >
              <X size={14} /> Batal
            </Button>
            <Button type="button" onClick={handleSave} disabled={submitting}>
              <Save size={14} /> {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        ) : customer ? (
          <>
            <Button
              variant="danger"
              type="button"
              onClick={handleDelete}
              disabled={submitting}
            >
              <Trash2 size={14} /> Hapus
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditing(true)}
            >
              <Edit2 size={14} /> Edit
            </Button>
            <Button type="button" onClick={onClose}>
              Tutup
            </Button>
          </>
        ) : null
      }
    >
      {loading && (
        <div className="py-12 flex items-center justify-center text-slate-400">
          <Loader2 size={20} className="animate-spin mr-2" /> Memuat...
        </div>
      )}

      {!loading && customer && !editing && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-xl text-slate-900">{customer.name}</div>
              <div className="text-sm text-slate-500">{customer.phone}</div>
              {customer.address && (
                <div className="text-xs text-slate-500 mt-1">{customer.address}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant={
                  customer.tier === "platinum"
                    ? "purple"
                    : customer.tier === "gold"
                    ? "warning"
                    : "default"
                }
              >
                {customer.tier?.toUpperCase()}
              </Badge>
              {customer.isBlacklisted && <Badge variant="danger">BLACKLIST</Badge>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Total Order</div>
              <div className="font-bold text-xl text-slate-900 mt-0.5">
                {customer.totalOrders}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Total Spending</div>
              <div className="font-bold text-sm text-slate-900 mt-0.5">
                {formatCurrency(customer.totalSpending ?? 0)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Loyalty Poin</div>
              <div className="font-bold text-xl text-amber-600 mt-0.5">
                {customer.points ?? 0}
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="rounded-xl border border-slate-200 p-3 bg-amber-50/40">
              <div className="text-xs font-semibold text-slate-600 mb-1">Catatan Internal</div>
              <p className="text-sm text-slate-700">{customer.notes}</p>
            </div>
          )}

          {/* Order history */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-2">
              Riwayat Order ({customer.orders?.length ?? 0})
            </h4>
            {customer.orders?.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl">
                Belum ada order
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {customer.orders?.map((o: any) => (
                  <div
                    key={o.id}
                    className="px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-semibold text-primary-700 truncate">
                        {o.invoice}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDateTime(o.createdAt)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
                        statusColors[o.status as OrderStatus] ??
                          "bg-slate-50 text-slate-600 border-slate-200"
                      )}
                    >
                      {statusLabels[o.status as OrderStatus] ?? o.status}
                    </span>
                    <div className="font-bold text-sm text-slate-900 whitespace-nowrap shrink-0">
                      {formatCurrency(o.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && customer && editing && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3">
          <Field label="Nama" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="No. HP" required>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </Field>
          <Field label="Alamat">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="Tier">
            <Select
              value={form.tier}
              onChange={(e) =>
                setForm({ ...form, tier: e.target.value as typeof form.tier })
              }
            >
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </Select>
          </Field>
          <Field label="Catatan Internal">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Preferensi customer, history komplain, dll"
            />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={form.isBlacklisted}
              onChange={(e) => setForm({ ...form, isBlacklisted: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">
              Blacklist (tolak order baru dari customer ini)
            </span>
          </label>
        </form>
      )}
    </Modal>
  );
}
