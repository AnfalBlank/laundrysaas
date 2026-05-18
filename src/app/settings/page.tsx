import { AppShell } from "@/components/layout/app-shell";
import { SettingsView } from "@/components/settings/settings-view";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const tenantId = getCurrentTenantId();
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return (
    <AppShell title="Settings" subtitle="Pengaturan akun dan sistem">
      <SettingsView
        initialTenant={{
          name: tenant?.name ?? "",
          subdomain: tenant?.subdomain ?? "",
          customDomain: tenant?.customDomain ?? "",
          logoUrl: tenant?.logoUrl ?? "",
          primaryColor: tenant?.primaryColor ?? "#2563eb",
          messagingChannel: tenant?.messagingChannel ?? "whatsapp",
          whatsappNumber: tenant?.whatsappNumber ?? "",
          whatsappToken: tenant?.whatsappToken ?? "",
          telegramBotToken: tenant?.telegramBotToken ?? "",
          telegramBotUsername: tenant?.telegramBotUsername ?? "",
        }}
      />
    </AppShell>
  );
}
