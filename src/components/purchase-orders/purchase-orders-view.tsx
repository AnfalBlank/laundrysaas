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
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  ClipboardList,
  Package,
  Plus,
  Truck,
  XCircle,
  Trash2,
  PackageCheck,
} from "lucide-react";
import type { Supplier } from "@/db/schema";

interface PORow {
  id: string;
  poNumber: string;
  status: string;
  total: number;
  orderedAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
  notes: string | null;
  supplierName: string | null;
  supplierPhone: string | null;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minimumStock: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  ordered: "bg-blue-50 text-blue-700 border-blue-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  received: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  ordered: "Sudah Order",
  partial: "Sebagian Diterima",
  received: "Diterima",
  cancelled: "Dibatalkan",
};

export function PurchaseOrdersView({
  initialPOs,
  suppliers,
  inventory,
}: {
  initialPOs: PORow[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailPO, setDetailPO] = useState<{
    id: string;
    poNumber: string;
    status: string;
    total: number;
    notes: string | null;
    supplierName: string | null;
    items: { id: string; itemName: string; quantity: number; unitPrice: number; total: number; receivedQuantity: number }[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [items, setItems] = useState<
    { inventoryId: string; quantity: number; unitPrice: number }[]
  >([]);
  const [notes, setNotes] = useState("");

  const lowStockItems = inventory.filter((i) => i.stock <= i.minimumStock);

  const totalDraft = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const openCreate = (preselect?: { items: typeof items }) => {
    if (preselect?.items) {
      setItems(preselect.items);
    } else if (lowStockItems.length > 0) {
      // Pre-fill with low stock items
      setItems(
        lowStockItems.map((i) => ({
          inventoryId: i.id,
          quantity: Math.max(i.minimumStock * 2 - i.stock, i.minimumStock),
          unitPrice: 0,
        }))
      );
    } else {
      setItems([]);
    }
    setSupplierId(suppliers[0]?.id ?? "");
    setNotes("");
    setShowCreate(true);
  };

  const addItemRow = () => {
    setItems([...items, { inventoryId: inventory[0]?.id ?? "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, key: keyof (typeof items)[0], value: number | string) => {
    setItems(
      items.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Tambahkan minimal 1 item");
      return;
    }
    if (items.some((i) => !i.inventoryId || i.quantity <= 0)) {
      toast.error("Lengkapi semua item", "Pastikan quantity > 0");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierId || undefined,
          items,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Purchase Order dibuat", `${data.poNumber} - ${formatCurrency(data.total)}`);
      setShowCreate(false);
      router.refresh();
    } catch (err) {
      toast.error("Gagal membuat PO", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (po: PORow) => {
    setLoadingDetail(true);
    setShowDetail(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDetailPO(data.po);
    } catch (e) {
      toast.error("Gagal memuat detail", String(e));
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleReceive = async (po: PORow) => {
    if (!confirm(`Terima barang dari PO ${po.poNumber}?\n\nStok akan bertambah otomatis.`))
      return;
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "receive" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("PO diterima", "Stok ter-update");
      router.refresh();
    } catch (err) {
      toast.error("Gagal", String(err));
    }
  };

  const handleCancel = async (po: PORow) => {
    if (!confirm(`Batalkan PO ${po.poNumber}?`)) return;
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("PO dibatalkan");
      router.refresh();
    } catch (err) {
      toast.error("Gagal", String(err));
    }
  };

  // Stats
  const totalPending = initialPOs
    .filter((p) => p.status === "ordered")
    .reduce((s, p) => s + p.total, 0);
  const totalReceived = initialPOs
    .filter((p) => p.status === "received")
    .reduce((s, p) => s + p.total, 0);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Total PO
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {initialPOs.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">semua waktu</div>
          </div>
          <Icon3D variant="blue" size="lg">
            <ClipboardList size={24} />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Pending
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-900 mt-1 truncate">
              {formatCurrency(totalPending)}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              {initialPOs.filter((p) => p.status === "ordered").length} PO
            </div>
          </div>
          <Icon3D variant="amber" size="lg">
            <Truck size={24} />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Diterima
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-900 mt-1 truncate">
              {formatCurrency(totalReceived)}
            </div>
            <div className="text-[11px] text-green-600 font-semibold mt-1">
              {initialPOs.filter((p) => p.status === "received").length} PO
            </div>
          </div>
          <Icon3D variant="green" size="lg">
            <PackageCheck size={24} />
          </Icon3D>
        </Card>
        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Low Stock Items
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {lowStockItems.length}
            </div>
            <div className="text-[11px] text-red-600 font-semibold mt-1">perlu restock</div>
          </div>
          <Icon3D variant="red" size="lg">
            <Package size={24} />
          </Icon3D>
        </Card>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Card className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Icon3D variant="amber" size="md">
                <Package size={20} />
              </Icon3D>
              <div>
                <h3 className="font-bold text-amber-900">
                  {lowStockItems.length} item perlu di-restock
                </h3>
                <p className="text-xs text-amber-700">
                  Klik tombol untuk auto-fill PO dengan item low-stock
                </p>
              </div>
            </div>
            <Button type="button" onClick={() => openCreate()}>
              <Plus size={14} /> Auto-Fill PO
            </Button>
          </div>
        </Card>
      )}

      {/* Action bar */}
      <Card className="mt-4 sm:mt-5 p-3 sm:p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900">Daftar Purchase Order</div>
          <div className="text-xs text-slate-500">
            {initialPOs.length} PO total · {suppliers.length} supplier terdaftar
          </div>
        </div>
        <Button type="button" onClick={() => openCreate()}>
          <Plus size={16} /> Buat PO Baru
        </Button>
      </Card>

      {/* PO List */}
      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-slate-50/80">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">PO Number</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Total</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialPOs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    Belum ada Purchase Order
                  </td>
                </tr>
              )}
              {initialPOs.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs font-semibold text-primary-700">
                      {po.poNumber}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-900 font-medium">
                      {po.supplierName ?? "—"}
                    </div>
                    {po.supplierPhone && (
                      <div className="text-xs text-slate-500">{po.supplierPhone}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(po.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap",
                        statusColors[po.status]
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusLabels[po.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(po.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openDetail(po)}
                        className="h-8 px-3 inline-flex items-center justify-center gap-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
                        title="Detail"
                      >
                        Detail
                      </button>
                      {po.status === "ordered" && (
                        <>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleReceive(po)}
                          >
                            <CheckCircle2 size={12} /> Terima
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleCancel(po)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                            title="Batal"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {po.status === "received" && (
                        <Badge variant="success">
                          <CheckCircle2 size={10} /> Selesai
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Buat Purchase Order Baru"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowCreate(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="po-form"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Membuat..." : `Buat PO (${formatCurrency(totalDraft)})`}
            </Button>
          </>
        }
      >
        <form id="po-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Supplier">
            <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Tanpa supplier (manual)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.phone && `· ${s.phone}`}
                </option>
              ))}
            </Select>
            {suppliers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Belum ada supplier. Tambahkan supplier dulu di Settings → Supplier.
              </p>
            )}
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Items ({items.length})
              </label>
              <Button type="button" size="sm" variant="secondary" onClick={addItemRow}>
                <Plus size={12} /> Tambah Item
              </Button>
            </div>
            <div className="space-y-2">
              {items.length === 0 && (
                <div className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                  Belum ada item. Klik &quot;Tambah Item&quot; untuk mulai.
                </div>
              )}
              {items.map((item, idx) => {
                const inv = inventory.find((i) => i.id === item.inventoryId);
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-end p-2 rounded-lg bg-slate-50/60 border border-slate-200"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <label className="text-[10px] font-semibold text-slate-600 uppercase">
                        Item
                      </label>
                      <Select
                        value={item.inventoryId}
                        onChange={(e) => updateItemRow(idx, "inventoryId", e.target.value)}
                        className="h-9 text-xs"
                      >
                        <option value="">Pilih item...</option>
                        {inventory.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} (stok: {i.stock} {i.unit})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] font-semibold text-slate-600 uppercase">
                        Qty {inv?.unit && `(${inv.unit})`}
                      </label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemRow(idx, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-3">
                      <label className="text-[10px] font-semibold text-slate-600 uppercase">
                        Harga / {inv?.unit ?? "unit"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItemRow(idx, "unitPrice", parseInt(e.target.value) || 0)
                        }
                        className="h-9 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <div className="text-[10px] text-slate-500">Subtotal</div>
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="col-span-12 sm:col-span-12 sm:absolute sm:-mt-7 sm:right-2 h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Hapus item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <Field label="Catatan">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan untuk supplier atau internal..."
              rows={2}
            />
          </Field>

          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-4 flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total PO</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalDraft)}
            </span>
          </div>
        </form>
      </Modal>

      {/* PO Detail Modal */}
      <Modal
        open={showDetail}
        onClose={() => {
          setShowDetail(false);
          setDetailPO(null);
        }}
        title={detailPO ? `PO ${detailPO.poNumber}` : "Detail PO"}
        size="lg"
      >
        {loadingDetail && (
          <div className="text-center py-8 text-sm text-slate-400">Memuat...</div>
        )}
        {!loadingDetail && detailPO && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Status</div>
                <Badge
                  className={cn("mt-1", statusColors[detailPO.status])}
                  variant={detailPO.status === "received" ? "success" : "primary"}
                >
                  {statusLabels[detailPO.status]}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-slate-500">Supplier</div>
                <div className="font-semibold mt-1">{detailPO.supplierName ?? "—"}</div>
              </div>
            </div>

            {detailPO.notes && (
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="text-xs text-slate-500 mb-1">Catatan</div>
                <div className="text-slate-700">{detailPO.notes}</div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-2">Items</h4>
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                {detailPO.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900">{item.itemName}</div>
                      <div className="text-xs text-slate-500">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                        {item.receivedQuantity > 0 && (
                          <span className="ml-2 text-green-600">
                            (Diterima: {item.receivedQuantity})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Total</span>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(detailPO.total)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowDetail(false);
                  setDetailPO(null);
                }}
              >
                Tutup
              </Button>
              {detailPO.status === "ordered" && (
                <Button
                  type="button"
                  onClick={async () => {
                    setShowDetail(false);
                    await handleReceive({
                      id: detailPO.id,
                      poNumber: detailPO.poNumber,
                    } as PORow);
                  }}
                >
                  <CheckCircle2 size={14} /> Terima Barang
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
