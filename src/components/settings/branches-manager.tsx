"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/select";
import { Icon3D } from "@/components/ui/icon3d";
import { useToast } from "@/components/ui/toast";
import { Building2, Edit2, Trash2, Loader2 } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

const branchColors: Parameters<typeof Icon3D>[0]["variant"][] = [
  "blue",
  "cyan",
  "purple",
  "amber",
  "green",
  "pink",
];

export function BranchesManager() {
  const toast = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      setBranches(data.branches ?? []);
    } catch {
      toast.error("Gagal memuat cabang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", address: "", phone: "" });
    setShowForm(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({
      name: b.name,
      address: b.address ?? "",
      phone: b.phone ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama cabang wajib");
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/branches/${editing.id}` : "/api/branches";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      toast.success(
        editing ? "Cabang ter-update" : "Cabang baru ditambahkan",
        form.name
      );
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error("Gagal menyimpan", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (b: Branch) => {
    if (!confirm(`Hapus cabang "${b.name}"? Aksi ini tidak bisa di-undo.`)) return;
    try {
      const res = await fetch(`/api/branches/${b.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Cabang dihapus", b.name);
      await load();
    } catch (err) {
      toast.error("Gagal menghapus", String(err));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Memuat cabang...
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-5 space-y-3">
        {branches.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-500">
            Belum ada cabang. Klik tombol di bawah untuk menambah.
          </div>
        )}
        {branches.map((b, i) => (
          <div
            key={b.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <Icon3D
              variant={branchColors[i % branchColors.length]}
              size="md"
            >
              <Building2 size={18} />
            </Icon3D>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 truncate">{b.name}</div>
              <div className="text-xs text-slate-500 truncate">
                {b.address ?? "—"}
                {b.phone && ` · ${b.phone}`}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(b)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(b)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                title="Hapus"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <Button
          className="w-full"
          variant="outline"
          type="button"
          onClick={openCreate}
        >
          + Tambah Cabang Baru
        </Button>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Cabang" : "Tambah Cabang Baru"}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="branch-form"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Menyimpan..." : editing ? "Update" : "Simpan"}
            </Button>
          </>
        }
      >
        <form id="branch-form" onSubmit={handleSubmit} className="space-y-3">
          <Field label="Nama Cabang" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Cabang Pusat"
              required
              autoFocus
            />
          </Field>
          <Field label="Alamat">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Jl. ..."
            />
          </Field>
          <Field label="No. Telepon">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="021-xxxx-xxxx"
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
