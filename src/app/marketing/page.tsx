import { AppShell } from "@/components/layout/app-shell";
import MarketingView from "@/components/marketing/marketing-view";

export const dynamic = "force-dynamic";

export default function MarketingPage() {
  return (
    <AppShell title="Marketing" subtitle="Broadcast WhatsApp, promo, dan retensi customer">
      <MarketingView />
    </AppShell>
  );
}
