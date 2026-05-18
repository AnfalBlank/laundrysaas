"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select, Textarea, Field } from "@/components/ui/select";
import { Icon3D } from "@/components/ui/icon3d";
import { Money3D } from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import { exportToCSV } from "@/lib/export";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Download,
  Edit2,
  Plus,
  Trash2,
  Wallet,
  TrendingDown,
  Receipt,
} from "lucide-react";
import type { Branch, ExpenseCategory } from "@/db/schema";

interface Expense {
  id: string;
  title: string;
  amount: number;
  paymentMethod: string;
  vendor: string | null;
  notes: string | null;
  expenseDate: Date;
  branchName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

interface Summary {
  total: number;
  count: number;
  byCategory: { categoryId: string | null; name: string; color: string; total: number; count: number }[];
}

const emptyForm = {
  title: "",
  amount: 0,
  categoryId: "",
  branchId: "",
  paymentMethod: "cash" as "cash" | "transfer" | "qris" | "ewallet" | "other",
  vendor: "",
  notes: "",
  expenseDate: new Date().toISOString().slice(0, 10),
};

export function ExpensesView({
  initialExpenses,
  categories,
  summary,
  branches,
}: {
  initialExpenses: Expense[];
  categories: ExpenseCategory[];
  summary: Summary;
  branches: Branch[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? "",
      branchId: branches[0]?.id ?? "",
    });
    setShowForm(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({
      title: e.title,
      amount: e.amount,
      categoryId: e.categoryId ?? "",
      branchId: branches.find((b) => b.name === e.branchName)?.id ?? "",
      paymentMethod: e.paymentMethod as typeof form.paymentMethod,
      vendor: e.vendor ?? "",
      notes: e.notes ?? "",
      expenseDate: new Date(e.expenseDate).toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      toast.error("Lengkapi data", "Judul dan nominal wajib");
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/expenses/${editing.id}` : "/api/expenses";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expenseDate: new Date(form.expenseDate).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(
        editing ? "Pengeluaran ter-update" : "Pengeluaran tercatat",
        formatCurrency(form.amount)
      );
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast.error("Gagal menyimpan", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: Expense) => {
    if (!confirm(`Hapus pengeluaran "${e.title}"?`)) return;
    try {
      const res = await fetch(`/api/expenses/${e.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Pengeluaran dihapus");
      router.refresh();
    } catch (err) {
      toast.error("Gagal hapus", String(err));
    }
  };

  const handleExport = () => {
    if (initialExpenses.length === 0) {
      toast.warning("Tidak ada data");
      return;
    }
    exportToCSV(
      initialExpenses.map((e) => ({
        Tanggal: formatDate(e.expenseDate),
        Kategori: e.categoryName ?? "—",
        Judul: e.title,
        Vendor: e.vendor ?? "",
        Cabang: e.branchName ?? "",
        "Metode Bayar": e.paymentMethod,
        Nominal: e.amount,
        Notes: e.notes ?? "",
      })),
      `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success("Export berhasil");
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-gradient-to-br from-rose-500 to-orange-500 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80">
              Total Bulan Ini
            </div>
            <div className="text-xl sm:text-3xl font-bold mt-1 truncate">
              {formatCurrency(summary.total)}
            </div>
            <div className="text-[11px] mt-2 opacity-90">{summary.count} transaksi</div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Kategori Aktif
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {summary.byCategory.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">dari {categories.length}</div>
          </div>
          <Icon3D variant="purple" size="lg">
            <Wallet size={24} />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Top Kategori
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-900 mt-1 truncate">
              {summary.byCategory[0]?.name ?? "—"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              {summary.byCategory[0] ? formatCurrency(summary.byCategory[0].total) : "—"}
            </div>
          </div>
          <Icon3D variant="amber" size="lg">
            <TrendingDown size={24} />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Rata-rata
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-900 mt-1 truncate">
              {formatCurrency(summary.count > 0 ? Math.round(summary.total / summary.count) : 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">per transaksi</div>
          </div>
          <Icon3D variant="red" size="lg">
            <Money3D className="w-9 h-9" />
          </Icon3D>
        </Card>
      </div>

      {/* Action bar */}
      <Card className="mt-4 sm:mt-5 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Receipt size={18} className="text-slate-500" />
          <div>
            <div className="font-semibold text-slate-900">Pengeluaran Bulan Ini</div>
            <div className="text-xs text-slate-500">
              {initialExpenses.length} transaksi tercatat
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={handleExport}>
            <Download size={14} /> Export
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus size={16} /> Catat Pengeluaran
          </Button>
        </div>
      </Card>

      {/* Two-column: Categories breakdown + Recent list */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Kategori</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Bulan ini</p>
          </CardHeader>
          <div className="p-4 sm:p-5 pt-0 space-y-2.5">
            {summary.byCategory.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-6">
                Belum ada pengeluaran
              </div>
            )}
            {summary.byCategory
              .sort((a, b) => b.total - a.total)
              .map((c) => {
                const pct = summary.total > 0 ? (c.total / summary.total) * 100 : 0;
                return (
                  <div key={c.categoryId ?? "none"} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: c.color }}
                      />
                      <span className="flex-1 truncate font-medium text-slate-700">
                        {c.name}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(c.total)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: c.color }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 text-right">
                      {pct.toFixed(1)}% · {c.count} transaksi
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle>Daftar Pengeluaran</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Bulan ini, terbaru di atas</p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Judul</th>
                  <th className="px-5 py-3.5">Metode</th>
                  <th className="px-5 py-3.5 text-right">Nominal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                      Belum ada pengeluaran. Klik &quot;Catat Pengeluaran&quot; untuk menambah.
                    </td>
                  </tr>
                )}
                {initialExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(e.expenseDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md"
                        style={{
                          background: `${e.categoryColor}20`,
                          color: e.categoryColor ?? "#64748b",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: e.categoryColor ?? "#64748b" }}
                        />
                        {e.categoryName ?? "Lain-lain"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{e.title}</div>
                      {e.vendor && (
                        <div className="text-xs text-slate-500">{e.vendor}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="default">{e.paymentMethod}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-rose-600 whitespace-nowrap">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(e)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit Pengeluaran: ${editing.title}` : "Catat Pengeluaran"}
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
              form="exp-form"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : editing ? "Update" : "Simpan"}
            </Button>
          </>
        }
      >
        <form id="exp-form" onSubmit={handleSubmit} className="space-y-3">
          <Field label="Judul" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Bayar listrik bulan Mei"
              required
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori" required>
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">Pilih kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tanggal" required>
              <Input
                type="date"
                value={form.expenseDate}
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nominal (Rp)" required>
              <Input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: parseInt(e.target.value) || 0 })
                }
                required
              />
            </Field>
            <Field label="Metode Bayar">
              <Select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentMethod: e.target.value as typeof form.paymentMethod,
                  })
                }
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
                <option value="ewallet">E-Wallet</option>
                <option value="other">Lainnya</option>
              </Select>
            </Field>
          </div>
          <Field label="Vendor / Tujuan">
            <Input
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              placeholder="PLN, supplier, dll (opsional)"
            />
          </Field>
          {branches.length > 0 && (
            <Field label="Cabang">
              <Select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">Tidak terkait cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Catatan">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Detail tambahan..."
              rows={2}
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
