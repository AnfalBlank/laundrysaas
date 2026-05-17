"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, Field } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { statusLabels, statusColors, type OrderStatus } from "@/lib/dummy-data";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { Banknote, CreditCard, QrCode, Wallet, X } from "lucide-react";

const STATUS_FLOW: OrderStatus[] = [
  "WAITING_PICKUP",
  "PICKUP_PROCESS",
  "RECEIVED",
  "WASHING",
  "DRYING",
  "IRONING",
  "PACKING",
  "READY_DELIVERY",
  "DELIVERING",
  "COMPLETED",
];

interface Props {
  orderId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetailModal({ orderId, onClose, onUpdate }: Props) {
  const toast = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "qris" | "transfer" | "ewallet">("cash");

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        const found = data.orders?.find((o: any) => o.id === orderId);
        setOrder(found ?? null);
      })
      .catch(() => toast.error("Gagal memuat", "Order tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    if (!orderId) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Status diupdate", `Order sekarang: ${statusLabels[newStatus as OrderStatus]}`);
      setOrder({ ...order, status: newStatus });
      onUpdate();
    } catch (err) {
      toast.error("Gagal update", String(err));
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrderAction = async () => {
    if (!orderId) return;
    if (!confirm("Yakin batalkan order ini? Aksi ini tidak bisa di-undo.")) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Order dibatalkan");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Gagal batalkan", String(err));
    } finally {
      setUpdating(false);
    }
  };

  const submitPayment = async () => {
    if (!orderId) return;
    const amount = parseInt(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Nominal tidak valid");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount, method: payMethod }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Pembayaran tercatat", formatCurrency(amount));
      setShowPayment(false);
      setPayAmount("");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Gagal catat pembayaran", String(err));
    } finally {
      setUpdating(false);
    }
  };

  const open = !!orderId;
  const currentStepIdx = order ? STATUS_FLOW.indexOf(order.status) : -1;
  const nextStatus = currentStepIdx >= 0 && currentStepIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentStepIdx + 1]
    : null;

  return (
    <Modal open={open} onClose={onClose} title="Detail Order" size="lg">
      {loading && (
        <div className="py-12 text-center text-sm text-slate-500">Memuat detail...</div>
      )}

      {!loading && order && (
        <div className="space-y-5">
          {/* Header info */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-mono text-sm font-semibold text-primary-700">
                {order.invoice}
              </div>
              <div className="font-bold text-slate-900 text-lg mt-0.5">
                {order.customerName ?? "—"}
              </div>
              <div className="text-xs text-slate-500">{order.customerPhone}</div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border",
                statusColors[order.status as OrderStatus]
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {statusLabels[order.status as OrderStatus] ?? order.status}
            </span>
          </div>

          {/* Order info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Info label="Layanan" value={order.service} />
            <Info label="Berat / Qty" value={order.weight ? `${order.weight} kg` : "—"} />
            <Info label="Total" value={formatCurrency(order.total)} highlight />
            <Info label="Pickup" value={order.pickupType === "pickup" ? "Pickup" : "Walk-in"} />
            <Info label="Cabang" value={order.branchName ?? "—"} />
            <Info
              label="Pembayaran"
              value={order.paymentStatus === "paid" ? "Lunas" : "Belum Lunas"}
              highlight={order.paymentStatus === "paid"}
              danger={order.paymentStatus !== "paid"}
            />
            <Info label="Dibuat" value={formatDateTime(order.createdAt)} />
            <Info
              label="Estimasi"
              value={order.estimatedAt ? formatDateTime(order.estimatedAt) : "—"}
            />
          </div>

          {/* Status update */}
          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40">
              <h3 className="font-semibold text-sm text-slate-900 mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {nextStatus && (
                  <Button
                    onClick={() => updateStatus(nextStatus)}
                    disabled={updating}
                    type="button"
                  >
                    Lanjut ke: {statusLabels[nextStatus]}
                  </Button>
                )}
                <Select
                  className="w-auto"
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                >
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Payment section */}
          {order.paymentStatus !== "paid" && order.status !== "CANCELLED" && !showPayment && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-amber-900">Pembayaran Pending</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Order belum dibayar — total {formatCurrency(order.total)}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setPayAmount(String(order.total));
                    setShowPayment(true);
                  }}
                  type="button"
                >
                  Catat Pembayaran
                </Button>
              </div>
            </div>
          )}

          {showPayment && (
            <div className="rounded-xl border-2 border-primary-200 p-4 bg-primary-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Input Pembayaran</h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-slate-400 hover:text-slate-600"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
              <Field label="Nominal">
                <Input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Metode">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: "cash" as const, label: "Cash", icon: <Banknote size={14} /> },
                    { v: "qris" as const, label: "QRIS", icon: <QrCode size={14} /> },
                    { v: "transfer" as const, label: "Transfer", icon: <CreditCard size={14} /> },
                    { v: "ewallet" as const, label: "E-Wallet", icon: <Wallet size={14} /> },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setPayMethod(opt.v)}
                      type="button"
                      className={cn(
                        "px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition",
                        payMethod === opt.v
                          ? "border-primary-500 bg-primary-100 text-primary-700"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowPayment(false)}
                  type="button"
                >
                  Batal
                </Button>
                <Button onClick={submitPayment} disabled={updating} type="button">
                  {updating ? "Menyimpan..." : "Konfirmasi Pembayaran"}
                </Button>
              </div>
            </div>
          )}

          {/* Cancel order */}
          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <div className="border-t border-slate-100 pt-4">
              <Button
                variant="danger"
                onClick={cancelOrderAction}
                disabled={updating}
                type="button"
              >
                Batalkan Order
              </Button>
            </div>
          )}
        </div>
      )}

      {!loading && !order && orderId && (
        <div className="py-12 text-center text-sm text-slate-500">Order tidak ditemukan</div>
      )}
    </Modal>
  );
}

function Info({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div
        className={cn(
          "font-semibold text-sm mt-0.5 truncate",
          highlight && "text-primary-700",
          danger && "text-amber-700",
          !highlight && !danger && "text-slate-900"
        )}
      >
        {value}
      </div>
    </div>
  );
}
