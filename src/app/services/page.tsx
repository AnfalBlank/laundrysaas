import { AppShell } from "@/components/layout/app-shell";
import { ServicesView } from "@/components/services/services-view";
import { listServices } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await listServices();
  return (
    <AppShell title="Services & Pricing" subtitle="Kelola layanan dan harga laundry">
      <ServicesView initialServices={services} />
    </AppShell>
  );
}
