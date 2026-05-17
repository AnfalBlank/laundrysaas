import { AppShell } from "@/components/layout/app-shell";
import { CustomersView } from "@/components/customers/customers-view";
import { listCustomers, getCustomerStats } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const [customers, stats] = await Promise.all([
    listCustomers(),
    getCustomerStats(),
  ]);

  return (
    <AppShell title="Customer Management" subtitle="Kelola data dan loyalitas pelanggan">
      <CustomersView initialCustomers={customers} stats={stats} />
    </AppShell>
  );
}
