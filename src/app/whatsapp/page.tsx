import { AppShell } from "@/components/layout/app-shell";
import { WhatsappView } from "@/components/whatsapp/whatsapp-view";
import { listWhatsappTemplates, listChatConversations } from "@/db/repositories";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const tenantId = getCurrentTenantId();
  const [tenant] = await db
    .select({ messagingChannel: tenants.messagingChannel })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  const channel = tenant?.messagingChannel ?? "whatsapp";
  const [templates, conversations] = await Promise.all([
    listWhatsappTemplates(),
    listChatConversations(),
  ]);

  const title = channel === "telegram" ? "Telegram Automation" : "WhatsApp Automation";
  const subtitle = "AI-powered customer service & broadcast";

  return (
    <AppShell title={title} subtitle={subtitle}>
      <WhatsappView
        templates={templates}
        channel={channel}
        conversations={conversations}
      />
    </AppShell>
  );
}
