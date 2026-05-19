import { AppShell } from "@/components/layout/app-shell";
import MarketingView from "@/components/marketing/marketing-view";
import { listCampaigns, getSegmentStats } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const [campaigns, segments] = await Promise.all([
    listCampaigns(),
    getSegmentStats(),
  ]);

  return (
    <AppShell title="Marketing" subtitle="Broadcast WhatsApp, promo, dan retensi customer">
      <MarketingView initialCampaigns={campaigns} segments={segments} />
    </AppShell>
  );
}
