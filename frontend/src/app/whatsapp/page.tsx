import { AppShell } from "@/components/layout/app-shell";
import { WhatsappView } from "@/components/whatsapp/whatsapp-view";
import { listWhatsappTemplates } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const templates = await listWhatsappTemplates();
  return (
    <AppShell title="WhatsApp Automation" subtitle="AI-powered customer service & broadcast">
      <WhatsappView templates={templates} />
    </AppShell>
  );
}
