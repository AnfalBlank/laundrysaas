"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Textarea } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Plus, Edit2, Trash2, Phone, Mail, Loader2 } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
  notes: string | null;
  isActive: boolean;
}

export function SuppliersManager() {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      setSuppliers(data.suppliers ?? []);
    } catch {
      toast.error("Gagal memuat supplier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", phone: "", email: "", address: "", contactPerson: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name,
      phone: s.phone ?? "",
      email: s.email ?? "",
      address: s.address ?? "",
      contactPerson: s.contactPerson ?? "",
      notes: s.notes ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama supplier wajib");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/suppliers/${editing.id}` : "/api/suppliers";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success(editing ? "Supplier diupdate" : "Supplier ditambahkan");
      setShowModal(false);
      load();
    } catch (e) {
      toast.error("Gagal simpan", String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!confirm(`Hapus supplier "${s.name}"?`)) return;
    try {
      const res = await fetch(`/api/suppliers/${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success("Supplier dihapus");
      load();
    } catch (e) {
      toast.error("Gagal hapus", String(e));
    }
  };

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600">{suppliers.length} supplier terdaftar</p>
        <Button size="sm" type="button" onClick={openCreate}>
          <Plus size={14} /> Tambah Supplier
        </Button>
      </div>

      {loading && <div className="text-sm text-slate-400 py-8 text-center">Memuat...</div>}

      {!loading && suppliers.length === 0 && (
        <div className="text-sm text-slate-400 py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
          Belum ada supplier. Tambahkan supplier pertama untuk Purchase Orders.
        </div>
      )}

      <div className="space-y-2">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-slate-200 p-3 sm:p-4 flex items-start gap-3 hover:border-primary-300 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900">{s.name}</div>
              {s.contactPerson && (
                <div className="text-xs text-slate-500">PIC: {s.contactPerson}</div>
              )}
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-600">
                {s.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={11} /> {s.phone}
                  </span>
                )}
                {s.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={11} /> {s.email}
                  </span>
                )}
              </div>
              {s.address && (
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">{s.address}</div>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(s)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Supplier" : "Supplier Baru"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Nama Supplier" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="PT Daia Indonesia"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="No. Telepon">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="021-xxx"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="sales@supplier.com"
              />
            </Field>
          </div>
          <Field label="Contact Person (PIC)">
            <Input
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              placeholder="Pak Budi"
            />
          </Field>
          <Field label="Alamat">
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat lengkap supplier"
              rows={2}
            />
          </Field>
          <Field label="Catatan">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Term pembayaran, lead time, dll"
              rows={2}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}{" "}
              {editing ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
