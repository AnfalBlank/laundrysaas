import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { Money3D } from "@/components/ui/laundry-icons";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { Banknote, CreditCard, QrCode, Wallet } from "lucide-react";
import {
  listPayments,
  getPaymentSummary,
  getOutstandingPayments,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

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

export default async function PaymentsPage() {
  const [payments, summary, outstanding] = await Promise.all([
    listPayments(20),
    getPaymentSummary(),
    getOutstandingPayments(),
  ]);

  // Ensure all 4 main methods always show
  const methods = ["cash", "qris", "transfer", "ewallet"].map((m) => {
    const found = summary.find((s) => s.method === m);
    return {
      method: m,
      total: found?.total ?? 0,
      count: found?.count ?? 0,
    };
  });

  return (
    <AppShell title="Payments" subtitle="Riwayat dan pencatatan pembayaran">
      {/* Methods overview */}
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
                <Icon3D variant={meta.variant} size="lg" animate="float">
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
            <Icon3D variant="red" size="lg" animate="wiggle">
              <Money3D className="w-9 h-9" />
            </Icon3D>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-rose-900">Tagihan Belum Lunas</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                {outstanding.count} order menunggu · {formatCurrency(outstanding.total)}
              </p>
            </div>
          </div>
          <Button variant="secondary" className="shrink-0 sm:self-center">
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
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    Belum ada pembayaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
