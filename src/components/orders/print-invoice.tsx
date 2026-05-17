"use client";

import { formatCurrency, formatDateTime } from "@/lib/utils";
import { statusLabels, type OrderStatus } from "@/lib/dummy-data";

interface Props {
  order: {
    invoice: string;
    status: string;
    paymentStatus: string;
    customerName: string | null;
    customerPhone: string | null;
    branchName: string | null;
    service: string;
    weight: number | null;
    total: number;
    createdAt: Date;
    estimatedAt: Date | null;
    pickupType: string;
  };
}

/**
 * Hidden invoice that's only visible when printing.
 * Uses CSS @media print to show only this content.
 */
export function PrintInvoice({ order }: Props) {
  return (
    <div className="print-only fixed inset-0 z-[300] bg-white p-8 hidden print:block">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only,
          .print-only * {
            visibility: visible;
          }
          .print-only {
            position: fixed !important;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
        }
      `}</style>

      <div style={{ width: "70mm", margin: "0 auto", fontFamily: "monospace", fontSize: "11px" }}>
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>LAUNDRYHUB</div>
          <div style={{ fontSize: "10px" }}>{order.branchName ?? "Cabang Pusat"}</div>
        </div>

        <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "8px 0", margin: "8px 0" }}>
          <div style={{ fontWeight: "bold" }}>{order.invoice}</div>
          <div>{formatDateTime(order.createdAt)}</div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <div>
            <strong>Customer:</strong> {order.customerName ?? "—"}
          </div>
          <div>
            <strong>HP:</strong> {order.customerPhone ?? "—"}
          </div>
          <div>
            <strong>Tipe:</strong> {order.pickupType === "pickup" ? "Pickup" : "Walk-in"}
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #000", padding: "8px 0", margin: "8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{order.service}</span>
            {order.weight && <span>{order.weight} kg</span>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span>Subtotal</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "8px 0", margin: "8px 0", fontWeight: "bold", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>TOTAL</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div style={{ marginTop: "8px" }}>
          <div>Status: {statusLabels[order.status as OrderStatus] ?? order.status}</div>
          <div>Bayar: {order.paymentStatus === "paid" ? "LUNAS" : "Belum Bayar"}</div>
          {order.estimatedAt && (
            <div>Estimasi: {formatDateTime(order.estimatedAt)}</div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "10px" }}>
          <div>Tracking:</div>
          <div style={{ fontWeight: "bold", margin: "4px 0" }}>
            laundryhub.id/track/{order.invoice}
          </div>
          <div style={{ marginTop: "8px" }}>Terima kasih</div>
        </div>
      </div>
    </div>
  );
}
