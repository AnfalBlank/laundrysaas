"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { Money3D } from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import { exportToCSV } from "@/lib/export";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { Banknote, CreditCard, Download, QrCode, Wallet } from "lucide-react";

const methodMeta: Record<
  string,
  { name: string; icon: React.ReactNode; variant: Parameters<typeof Icon3D>[0]["variant"] }
> = {
  cash: { name: "Cash", icon: <Banknote size={20} />, variant: "green" },
  qris: { name: "QRIS", icon: <QrCode size={20} />, variant: "purple" },
  transfer: { name: "Transfer", icon: <CreditCard size={20} />, variant: "blue" },
  ewallet: { name: "E-Wallet", icon: <Wallet size={20} />, variant: "amber" },
  other: { name: "Lainnya", icon: <CreditCard size={20} />, variant: "indigo" },
};

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  paidAt: Date;
  invoice: string;
  customerName: string | null;
  customerPhone: string | null;
  paymentStatus: string;
}

export function PaymentsView({
  payments,
  summary,
  outstanding,
}: {
  payments: Payment[];
  summary: { method: string; total: number; count: number }[];
  outstanding: { total: number; count: number };
}) {
  const toast = useToast();
  const router = useRouter();

  const methods = ["cash", "qris", "transfer", "ewallet"].map((m) => {
    const found = summary.find((s) => s.method === m);
    return { method: m, total: found?.total ?? 0, count: found?.count ?? 0 };
  });

  const handleExport = () => {
    if (payments.length === 0) {
      toast.warning("Tidak ada data");
      return;
    }
    exportToCSV(
      payments.map((p) => ({
        Invoice: p.invoice,
        Customer: p.customerName ?? "",
        Phone: p.customerPhone ?? "",
        Method: methodMeta[p.method]?.name ?? p.method,
        Amount: p.amount,
        Status: p.paymentStatus,
        Date: formatDateTime(p.paidAt),
      })),
      `payments-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success("Export berhasil", `${payments.length} pembayaran`);
  };

  const handleSendReminder = async () => {
    if (outstanding.count === 0) {
      toast.info("Tidak ada tagihan", "Semua sudah lunas");
      return;
    }
    try {
      const res = await fetch("/api/payments/reminder", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        "Reminder dikirim",
        `${data.sentCount} reminder berhasil dikirim ke customer`
      );
    } catch (err) {
      toast.error("Gagal kirim reminder", String(err));
    }
  };

  const handleRefund = async (paymentId: string, invoice: string) => {
    if (!confirm(`Refund pembayaran untuk invoice ${invoice}?\n\nIni akan membuat record refund dan update payment status order.`)) return;
    const reason = window.prompt("Alasan refund (opsional):") ?? undefined;
    try {
      const res = await fetch(`/api/payments/${paymentId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Refund tercatat", `Sebesar Rp ${Math.abs(data.amount).toLocaleString("id-ID")}`);
      router.refresh();
    } catch (err) {
      toast.error("Gagal refund", String(err));
    }
  };

  return (
    <>
      {/* Methods overview */}
      <div className="flex justify-end mb-3">
        <Button variant="secondary" type="button" onClick={handleExport}>
          <Download size={14} /> Export CSV
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {methods.map((m) => {
          const meta = methodMeta[m.method];
          return (
            <Card
              key={m.method}
              className="p-4 sm:p-5 flex items-center justify-between gap-2 tilt-card"
            >
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                  {meta.name}
                </div>
                <div className="text-base sm:text-xl font-bold text-slate-900 mt-1 truncate">
                  {formatCurrency(m.total)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.count} transaksi</div>
              </div>
              <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
                <Icon3D variant={meta.variant} size="lg">
                  {meta.icon}
                </Icon3D>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Outstanding */}
      <Card className="mt-4 sm:mt-5 p-4 sm:p-5 bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Icon3D variant="red" size="lg">
              <Money3D className="w-9 h-9" />
            </Icon3D>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-rose-900">Tagihan Belum Lunas</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                {outstanding.count} order menunggu · {formatCurrency(outstanding.total)}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 sm:self-center"
            type="button"
            onClick={handleSendReminder}
          >
            Kirim Reminder
          </Button>
        </div>
      </Card>

      {/* Transactions */}
      <Card className="mt-4 sm:mt-5 overflow-hidden">
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-slate-50/80">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Invoice</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Metode</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Jumlah</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => {
                const meta = methodMeta[p.method] ?? methodMeta.other;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary-700">
                      {p.invoice}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{p.customerName ?? "—"}</div>
                      <div className="text-xs text-slate-500">{p.customerPhone ?? ""}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="default">
                        {meta.icon} <span className="ml-1">{meta.name}</span>
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {formatDateTime(p.paidAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.paymentStatus === "paid" ? "success" : "warning"}>
                        <span className={cn("w-1.5 h-1.5 rounded-full bg-current")} />
                        {p.paymentStatus === "paid" ? "Lunas" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {p.amount < 0 ? (
                        <span className="text-red-600">{formatCurrency(p.amount)}</span>
                      ) : (
                        formatCurrency(p.amount)
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.amount > 0 && p.paymentStatus === "paid" && (
                        <button
                          type="button"
                          onClick={() => handleRefund(p.id, p.invoice)}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    Belum ada pembayaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
