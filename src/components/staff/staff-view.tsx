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
import { Avatar3D } from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Mail,
  Phone,
  Crown,
  BriefcaseBusiness,
  Sparkles,
  Bike,
  Edit2,
  Trash2,
} from "lucide-react";
import type { Branch } from "@/db/schema";

type AvatarVariant = "blue" | "purple" | "amber" | "pink" | "cyan" | "green";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  branchName: string | null;
}

const roleMeta: Record<
  string,
  {
    label: string;
    variant: Parameters<typeof Icon3D>[0]["variant"];
    icon: React.ReactNode;
    avatar: AvatarVariant;
  }
> = {
  owner: { label: "Owner", variant: "purple", icon: <Crown size={22} />, avatar: "purple" },
  admin: {
    label: "Admin / Kasir",
    variant: "blue",
    icon: <BriefcaseBusiness size={22} />,
    avatar: "blue",
  },
  staff: {
    label: "Staff Laundry",
    variant: "cyan",
    icon: <Sparkles size={22} />,
    avatar: "cyan",
  },
  driver: { label: "Driver", variant: "orange", icon: <Bike size={22} />, avatar: "amber" },
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "staff" as "owner" | "admin" | "staff" | "driver",
  branchId: "",
};

export function StaffView({
  initialStaff,
  branches,
}: {
  initialStaff: Staff[];
  branches: Branch[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Count per role
  const counts: Record<string, number> = {};
  for (const s of initialStaff) counts[s.role] = (counts[s.role] ?? 0) + 1;
  const roles = Object.keys(roleMeta).map((r) => ({
    role: r,
    count: counts[r] ?? 0,
    ...roleMeta[r],
  }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, branchId: branches[0]?.id ?? "" });
    setShowForm(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone ?? "",
      role: s.role as typeof form.role,
      branchId: branches.find((b) => b.name === s.branchName)?.id ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Lengkapi data", "Nama dan email wajib");
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/staff/${editing.id}` : "/api/staff";
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
      toast.success(editing ? "Staff ter-update" : "Staff baru ditambahkan", form.name);
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast.error("Gagal menyimpan", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: Staff) => {
    if (!confirm(`Nonaktifkan staff "${s.name}"?\n\nStaff akan tidak bisa login lagi.`)) return;
    try {
      const res = await fetch(`/api/staff/${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Staff dinonaktifkan", s.name);
      router.refresh();
    } catch (err) {
      toast.error("Gagal", String(err));
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {roles.map((r) => (
          <Card
            key={r.role}
            className="p-4 sm:p-5 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                {r.label}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{r.count}</div>
            </div>
            <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
              <Icon3D variant={r.variant} size="lg">
                {r.icon}
              </Icon3D>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 sm:mt-5 overflow-hidden">
        <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
          <CardTitle>Daftar Karyawan ({initialStaff.length})</CardTitle>
          <Button className="shrink-0" type="button" onClick={openCreate}>
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Staff</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5">
          {initialStaff.length === 0 && (
            <div className="col-span-full text-center py-8 text-sm text-slate-500">
              Belum ada staff. Tambahkan staff pertama.
            </div>
          )}
          {initialStaff.map((s) => {
            const meta = roleMeta[s.role] ?? roleMeta.staff;
            return (
              <Card key={s.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar3D className="w-14 h-14 shrink-0" variant={meta.avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 truncate">{s.name}</h4>
                      <span
                        className={
                          s.isActive
                            ? "w-2 h-2 rounded-full bg-green-500 shrink-0"
                            : "w-2 h-2 rounded-full bg-slate-300 shrink-0"
                        }
                      />
                    </div>
                    <Badge variant="primary" className="mt-1">
                      {meta.label}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-2">
                      Cabang {s.branchName ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    {s.isActive && (
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Nonaktifkan"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone size={11} className="text-slate-400 shrink-0" /> {s.phone ?? "—"}
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={11} className="text-slate-400 shrink-0" /> {s.email}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit Staff: ${editing.name}` : "Tambah Staff Baru"}
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
              form="staff-form"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : editing ? "Update" : "Simpan"}
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit} className="space-y-3">
          <Field label="Nama Lengkap" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Pak Joko"
              required
              autoFocus
            />
          </Field>
          <Field label="Email" required hint="Untuk login">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@laundryhub.id"
              required
            />
          </Field>
          <Field label="No. HP">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0812-xxxx-xxxx"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" required>
              <Select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as typeof form.role })
                }
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin / Kasir</option>
                <option value="staff">Staff Laundry</option>
                <option value="driver">Driver</option>
              </Select>
            </Field>
            <Field label="Cabang">
              <Select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">Tanpa cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {!editing && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
              Password default akan dikirim ke email staff. Mereka bisa ganti password setelah
              login pertama.
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
