import { AppShell } from "@/components/layout/app-shell";
import { PaymentsView } from "@/components/payments/payments-view";
import {
  listPayments,
  getPaymentSummary,
  getOutstandingPayments,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const [payments, summary, outstanding] = await Promise.all([
    listPayments(50),
    getPaymentSummary(),
    getOutstandingPayments(),
  ]);

  return (
    <AppShell title="Payments" subtitle="Riwayat dan pencatatan pembayaran">
      <PaymentsView payments={payments} summary={summary} outstanding={outstanding} />
    </AppShell>
  );
}
