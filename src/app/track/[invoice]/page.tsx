import { Icon3D } from "@/components/ui/icon3d";
import {
  WashingMachine3D,
  TruckDelivery3D,
  Sparkles3D,
  Hanger3D,
  Receipt3D,
  Whatsapp3D,
} from "@/components/ui/laundry-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, Phone, Sparkles } from "lucide-react";
import { db } from "@/db/client";
import { orders, customers, branches, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { statusLabels, type OrderStatus } from "@/lib/dummy-data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const statusOrder = [
  "RECEIVED",
  "PICKUP_PROCESS",
  "WASHING",
  "DRYING",
  "IRONING",
  "PACKING",
  "READY_DELIVERY",
  "DELIVERING",
  "COMPLETED",
];

function statusToStep(status: string): number {
  return statusOrder.indexOf(status);
}

const stepIcons: { label: string; icon: React.ReactNode; status: string }[] = [
  { label: "Order Diterima", icon: <Receipt3D className="w-9 h-9" />, status: "RECEIVED" },
  { label: "Pickup Driver", icon: <TruckDelivery3D className="w-9 h-9" />, status: "PICKUP_PROCESS" },
  { label: "Sedang Dicuci", icon: <WashingMachine3D className="w-9 h-9" />, status: "WASHING" },
  { label: "Dikeringkan", icon: <Sparkles3D className="w-9 h-9" />, status: "DRYING" },
  { label: "Disetrika & Dikemas", icon: <Hanger3D className="w-9 h-9" />, status: "IRONING" },
  { label: "Siap Diantar", icon: <TruckDelivery3D className="w-9 h-9" />, status: "READY_DELIVERY" },
];

export default async function TrackPage({
  params,
}: {
  params: { invoice: string };
}) {
  const decodedInvoice = decodeURIComponent(params.invoice);

  const [orderRow] = await db
    .select({
      id: orders.id,
      invoice: orders.invoiceNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      pickupType: orders.pickupType,
      isExpress: orders.isExpress,
      weight: orders.weight,
      total: orders.total,
      pickupAddress: orders.pickupAddress,
      estimatedAt: orders.estimatedAt,
      createdAt: orders.createdAt,
      customerName: customers.name,
      customerAddress: customers.address,
      branchName: branches.name,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(branches, eq(orders.branchId, branches.id))
    .where(eq(orders.invoiceNumber, decodedInvoice))
    .limit(1);

  if (!orderRow) {
    notFound();
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderRow.id));

  const currentStep = statusToStep(orderRow.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/30 relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-primary-200/30 to-accent-200/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-100/20 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-5 py-6 sm:py-8 md:py-12">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Icon3D variant="blue" size="md">
            <Sparkles size={20} />
          </Icon3D>
          <div>
            <div className="font-bold text-slate-900">LaundryHub</div>
            <div className="text-xs text-slate-500">Tracking laundry Anda</div>
          </div>
        </div>

        {/* Hero status */}
        <Card className="p-4 sm:p-6 mb-5 sm:mb-6 relative overflow-hidden bg-gradient-to-br from-white to-blue-50/40">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-primary-200/20 to-accent-100/10 -translate-y-20 translate-x-20" />
          <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <div className="shrink-0">
              <WashingMachine3D className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="primary">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Status Realtime
              </Badge>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mt-3">
                {statusLabels[orderRow.status as OrderStatus] ?? orderRow.status}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Halo {orderRow.customerName ?? "—"}, status laundry Anda saat ini.
                {orderRow.estimatedAt && (
                  <>
                    {" "}
                    Estimasi selesai{" "}
                    <span className="font-semibold text-slate-900">
                      {formatDateTime(orderRow.estimatedAt)}
                    </span>
                    .
                  </>
                )}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 bg-white rounded-lg border border-slate-200 px-3 py-1.5">
                <span className="font-mono font-semibold text-primary-700 text-[11px] sm:text-xs">
                  {orderRow.invoice}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-4 sm:p-6">
          <h2 className="font-bold text-slate-900">Timeline Proses</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4 sm:mb-5">
            Update otomatis setiap status berubah
          </p>
          <div className="relative">
            <div className="absolute left-[18px] sm:left-[22px] top-2 bottom-2 w-0.5 bg-slate-200" />
            <div className="space-y-4 sm:space-y-5">
              {stepIcons.map((t, i) => {
                const stepIdx = statusToStep(t.status);
                const done = currentStep >= stepIdx;
                const current = orderRow.status === t.status;
                return (
                  <div key={i} className="flex items-start gap-3 sm:gap-4 relative">
                    <div
                      className={`shrink-0 transition-all ${
                        done ? "" : "opacity-40 grayscale"
                      } ${current ? "scale-110" : ""} scale-90 sm:scale-100`}
                    >
                      {t.icon}
                    </div>
                    <div className="flex-1 pt-1.5 sm:pt-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={
                            done
                              ? "font-semibold text-slate-900 text-sm sm:text-base"
                              : "font-medium text-slate-400 text-sm sm:text-base"
                          }
                        >
                          {t.label}
                        </span>
                        {current && (
                          <Badge variant="primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            Aktif
                          </Badge>
                        )}
                        {done && !current && <CheckCircle2 size={14} className="text-green-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Order summary */}
        <Card className="p-4 sm:p-6 mt-5 sm:mt-6">
          <h2 className="font-bold text-slate-900">Detail Order</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
            <div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Layanan</div>
              <div className="font-semibold text-slate-900">{items[0]?.serviceName ?? "—"}</div>
            </div>
            {orderRow.weight && (
              <div>
                <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Berat</div>
                <div className="font-semibold text-slate-900">{orderRow.weight} kg</div>
              </div>
            )}
            <div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Total</div>
              <div className="font-semibold text-slate-900">{formatCurrency(orderRow.total)}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Pickup</div>
              <div className="font-semibold text-slate-900">
                {orderRow.pickupType === "pickup" ? "Ya, di rumah" : "Walk-in"}
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Cabang</div>
              <div className="font-semibold text-slate-900">{orderRow.branchName ?? "—"}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Pembayaran</div>
              <div
                className={
                  orderRow.paymentStatus === "paid"
                    ? "font-semibold text-green-600"
                    : "font-semibold text-amber-600"
                }
              >
                {orderRow.paymentStatus === "paid" ? "Lunas" : "Belum lunas"}
              </div>
            </div>
          </div>

          {orderRow.pickupAddress && (
            <div className="mt-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-3 flex items-center gap-2 text-xs">
              <MapPin size={14} className="text-primary-600 shrink-0" />
              <span className="text-slate-700 break-words">
                Pickup:{" "}
                <span className="font-semibold">
                  {orderRow.pickupAddress ?? orderRow.customerAddress ?? "—"}
                </span>
              </span>
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-5 mt-5 sm:mt-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <Whatsapp3D className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold">Butuh bantuan?</h3>
              <p className="text-xs opacity-90">Chat langsung admin via WhatsApp</p>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-green-700 hover:bg-slate-50 shrink-0"
            >
              <Phone size={14} /> Chat
            </Button>
          </div>
        </Card>

        <div className="text-center text-xs text-slate-400 mt-6 sm:mt-8">
          Powered by <span className="font-semibold text-slate-600">LaundryHub</span> · ERP Laundry
          SaaS
        </div>
      </div>
    </div>
  );
}
