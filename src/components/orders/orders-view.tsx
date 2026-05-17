"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { WashingMachine3D } from "@/components/ui/laundry-icons";
import { useToast } from "@/components/ui/toast";
import { OrderFormModal } from "./order-form-modal";
import { OrderDetailModal } from "./order-detail-modal";
import { PrintInvoice } from "./print-invoice";
import {
  statusLabels,
  statusColors,
  type OrderStatus,
} from "@/lib/dummy-data";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { exportToCSV } from "@/lib/export";
import type { Service, Branch } from "@/db/schema";
import {
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  QrCode,
  MoreHorizontal,
  Phone,
  CheckCircle2,
  Eye,
} from "lucide-react";

const statusFilters: ("ALL" | OrderStatus)[] = [
  "ALL",
  "WAITING_PICKUP",
  "WASHING",
  "DRYING",
  "IRONING",
  "READY_DELIVERY",
  "COMPLETED",
];

interface OrderRow {
  id: string;
  invoice: string;
  status: string;
  paymentStatus: string;
  pickupType: string;
  isExpress: boolean;
  weight: number | null;
  total: number;
  createdAt: Date;
  estimatedAt: Date | null;
  customerId?: string | null;
  customerName: string | null;
  customerPhone: string | null;
  branchName: string | null;
  service: string;
}

export function OrdersView({
  initialOrders,
  services,
  branches,
}: {
  initialOrders: OrderRow[];
  services: Service[];
  branches: Branch[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<OrderRow | null>(null);

  const filtered = useMemo(() => {
    return initialOrders.filter((o) => {
      const matchesStatus = filter === "ALL" || o.status === filter;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        o.invoice.toLowerCase().includes(q) ||
        (o.customerName ?? "").toLowerCase().includes(q) ||
        (o.customerPhone ?? "").includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [filter, query, initialOrders]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: initialOrders.length };
    for (const o of initialOrders) map[o.status] = (map[o.status] ?? 0) + 1;
    return map;
  }, [initialOrders]);

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.warning("Tidak ada data", "List kosong, tidak ada yang di-export");
      return;
    }
    exportToCSV(
      filtered.map((o) => ({
        Invoice: o.invoice,
        Customer: o.customerName ?? "",
        Phone: o.customerPhone ?? "",
        Service: o.service,
        Weight: o.weight ?? "",
        Status: statusLabels[o.status as OrderStatus] ?? o.status,
        "Payment Status": o.paymentStatus,
        Pickup: o.pickupType,
        Branch: o.branchName ?? "",
        Total: o.total,
        Created: o.createdAt ? formatDateTime(o.createdAt) : "",
        Estimated: o.estimatedAt ? formatDateTime(o.estimatedAt) : "",
      })),
      `orders-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success("Export berhasil", `${filtered.length} order ter-export`);
  };

  const handlePrint = (order: OrderRow) => {
    setPrintOrder(order);
    // Print will trigger via PrintInvoice component
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintOrder(null), 500);
    }, 200);
  };

  const handleShowQR = (order: OrderRow) => {
    const url = `${window.location.origin}/track/${order.invoice}`;
    if (navigator.share) {
      navigator
        .share({ title: `Tracking ${order.invoice}`, url })
        .catch(() => copyToClipboard(url));
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Tersalin", "Link tracking sudah di-copy"),
      () => toast.error("Gagal copy", "Browser tidak support")
    );
  };

  return (
    <>
      {/* Action bar */}
      <Card className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, invoice, atau HP..."
              className="pl-9"
            />
          </div>
          <Button variant="secondary" size="icon" aria-label="Filter" type="button">
            <Filter size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={handleExport}
            type="button"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => setShowCreate(true)}
            type="button"
          >
            <Plus size={16} /> Order Baru
          </Button>
        </div>
      </Card>

      {/* Status pill filters */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
              filter === s
                ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white border-transparent shadow-md shadow-primary-500/30"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary-200 hover:text-primary-700"
            )}
          >
            {s === "ALL" ? "Semua" : statusLabels[s]}
            <span
              className={cn(
                "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px]",
                filter === s ? "bg-white/20" : "bg-slate-100 text-slate-600"
              )}
            >
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile card list */}
      <div className="mt-4 space-y-3 lg:hidden">
        {filtered.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px] font-semibold text-primary-700">
                  {o.invoice}
                </div>
                <div className="font-bold text-slate-900 mt-0.5 truncate">
                  {o.customerName ?? "—"}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                  <Phone size={11} className="shrink-0" /> {o.customerPhone ?? "—"}
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0",
                  statusColors[o.status as OrderStatus] ??
                    "bg-slate-50 text-slate-600 border-slate-200"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusLabels[o.status as OrderStatus] ?? o.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-100">
              <div>
                <div className="text-slate-500">Layanan</div>
                <div className="font-semibold text-slate-900 truncate">
                  {o.service}
                  {o.weight ? ` · ${o.weight} kg` : ""}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Total</div>
                <div className="font-bold text-slate-900">{formatCurrency(o.total)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {o.paymentStatus === "paid" ? (
                  <Badge variant="success">Lunas</Badge>
                ) : (
                  <Badge variant="warning">Belum Bayar</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedOrderId(o.id)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  type="button"
                  aria-label="Detail"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => handlePrint(o)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600"
                  type="button"
                  aria-label="Print"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={() => handleShowQR(o)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-accent-50 hover:text-accent-600"
                  type="button"
                  aria-label="Share"
                >
                  <QrCode size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <Card className="mt-4 overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Invoice</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Layanan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Cabang</th>
                <th className="px-5 py-3.5">Pickup</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Estimasi</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrderId(o.id)}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs font-semibold text-primary-700">
                      {o.invoice}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatDateTime(o.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">
                      {o.customerName ?? "—"}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone size={11} /> {o.customerPhone ?? "—"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-900">{o.service}</div>
                    {o.weight && <div className="text-xs text-slate-500">{o.weight} kg</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap",
                        statusColors[o.status as OrderStatus] ??
                          "bg-slate-50 text-slate-600 border-slate-200"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusLabels[o.status as OrderStatus] ?? o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                    {o.branchName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {o.pickupType === "pickup" ? (
                      <Badge variant="primary">
                        <CheckCircle2 size={10} /> Pickup
                      </Badge>
                    ) : (
                      <Badge>Walk-in</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(o.total)}
                    </div>
                    <div className="text-xs">
                      {o.paymentStatus === "paid" ? (
                        <span className="text-green-600">Lunas</span>
                      ) : (
                        <span className="text-amber-600">Belum bayar</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                    {o.estimatedAt ? formatDateTime(o.estimatedAt) : "—"}
                  </td>
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedOrderId(o.id)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        title="Detail"
                        type="button"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handlePrint(o)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600"
                        title="Cetak Invoice"
                        type="button"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        onClick={() => handleShowQR(o)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-accent-50 hover:text-accent-600"
                        title="Share Tracking Link"
                        type="button"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        onClick={() => setSelectedOrderId(o.id)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                        title="More"
                        type="button"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
            dari <span className="font-semibold text-slate-900">{initialOrders.length}</span>{" "}
            order
          </div>
        </div>
      </Card>

      {filtered.length === 0 && (
        <Card className="mt-4 p-10 flex flex-col items-center text-center">
          <Icon3D variant="cyan" size="xl" animate="float">
            <WashingMachine3D className="w-12 h-12" />
          </Icon3D>
          <h3 className="mt-4 font-semibold text-slate-900">Tidak ada order</h3>
          <p className="text-sm text-slate-500 mt-1">
            Tidak ada order yang cocok dengan filter saat ini.
          </p>
        </Card>
      )}

      {/* Modals */}
      <OrderFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        services={services}
        branches={branches}
        onSuccess={() => {
          setShowCreate(false);
          toast.success("Order dibuat", "Order baru berhasil disimpan");
          router.refresh();
        }}
      />

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onUpdate={() => router.refresh()}
      />

      {/* Hidden print area */}
      {printOrder && <PrintInvoice order={printOrder} />}
    </>
  );
}
