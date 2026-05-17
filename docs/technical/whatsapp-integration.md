# WhatsApp Integration

⚠️ **Status**: UI ready, integration logic placeholder. Dokumen ini blueprint.

## Provider Comparison

| Provider          | Pricing         | Setup        | Stability    | Use Case                |
| ----------------- | --------------- | ------------ | ------------ | ----------------------- |
| **Fonnte**        | ~Rp 100K/bulan  | Mudah (QR)   | ⭐⭐⭐⭐⭐    | Recommended Indonesia    |
| **WAHA**          | Self-host (free)| Medium       | ⭐⭐⭐⭐      | High volume, technical    |
| **Evolution API** | Self-host (free)| Medium       | ⭐⭐⭐⭐      | Open source preference   |
| **Official WA**   | Volume-based    | Hard (verify)| ⭐⭐⭐⭐⭐    | Enterprise, compliance   |

## Fonnte Integration (Recommended)

### Setup

1. Sign up [fonnte.com](https://fonnte.com)
2. Add device → Scan QR via WhatsApp di HP
3. Copy API Token

### Send Message

```typescript
// src/lib/whatsapp/fonnte.ts
const FONNTE_URL = "https://api.fonnte.com/send";

export async function sendWhatsApp({
  to,
  message,
  delay = 0,
}: {
  to: string;
  message: string;
  delay?: number;
}) {
  const formData = new FormData();
  formData.append("target", normalizePhone(to));
  formData.append("message", message);
  if (delay > 0) formData.append("delay", String(delay));

  const res = await fetch(FONNTE_URL, {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_API_KEY!,
    },
    body: formData,
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(`Fonnte error: ${data.reason ?? "Unknown"}`);
  }
  return data;
}

function normalizePhone(phone: string): string {
  // Indonesian phone format: 08... → 628...
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (!p.startsWith("62")) p = "62" + p;
  return p;
}
```

### Bulk / Broadcast

```typescript
export async function sendBulkWhatsApp(
  recipients: { phone: string; vars: Record&lt;string, string&gt; }[],
  template: string
) {
  const results = await Promise.allSettled(
    recipients.map(({ phone, vars }) => {
      const message = renderTemplate(template, vars);
      return sendWhatsApp({ to: phone, message, delay: 1 });
    })
  );

  return {
    success: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
  };
}

function renderTemplate(template: string, vars: Record&lt;string, string&gt;) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}
```

### Webhook (Receive Messages)

#### Setup di Fonnte

Dashboard Fonnte → Devices → Webhook URL:
```
https://[bisnis].laundryhub.id/api/whatsapp/webhook
```

#### Handle Webhook

```typescript
// src/app/api/whatsapp/webhook/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { processIncomingMessage } from "@/lib/whatsapp/handler";

export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const sender = body.get("sender") as string;
    const message = body.get("message") as string;
    const device = body.get("device") as string;

    if (!sender || !message) {
      return NextResponse.json({ ok: true });  // ignore invalid
    }

    // Process async (don't block webhook response)
    processIncomingMessage({ sender, message, device }).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### AI Auto-Reply

```typescript
// src/lib/whatsapp/handler.ts
import OpenAI from "openai";
import { sendWhatsApp } from "./fonnte";

const openai = new OpenAI();

export async function processIncomingMessage({
  sender,
  message,
}: {
  sender: string;
  message: string;
}) {
  // 1. Find or create customer
  const customer = await findOrCreateCustomer(sender);

  // 2. Save message to DB
  await saveMessage({ customerId: customer.id, message, fromCustomer: true });

  // 3. Try AI auto-reply
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
    tools: [
      { type: "function", function: createOrderFunc },
      { type: "function", function: getOrderStatusFunc },
      { type: "function", function: handoffFunc },
    ],
  });

  // 4. Handle function calls (create order, etc.)
  const result = await handleAIResponse(aiResponse, customer);

  // 5. Send reply
  if (result.shouldReply) {
    await sendWhatsApp({ to: sender, message: result.reply });
    await saveMessage({
      customerId: customer.id,
      message: result.reply,
      fromCustomer: false,
      isBot: true,
    });
  }
}
```

#### System Prompt

```
You are a friendly customer service for LaundryHub, a laundry business in Indonesia.

Your capabilities:
- Answer pricing questions (use get_pricing tool)
- Check order status (use get_order_status tool)
- Create new pickup orders (use create_order tool)
- Provide info about operating hours, branch locations
- Handoff to human admin if uncertain (use handoff tool)

Tone:
- Friendly and helpful
- Use Bahasa Indonesia santai (Kak, dll)
- Concise (max 3 sentences)
- No emojis
- Always confirm before creating orders

If the question is complex (komplain, refund, hilang), use handoff tool.
```

#### Function Calls

```typescript
const createOrderFunc = {
  name: "create_order",
  description: "Create a new laundry pickup order",
  parameters: {
    type: "object",
    properties: {
      service: { type: "string", description: "Cuci Setrika, Cuci Kering, etc" },
      weight: { type: "number" },
      pickupAddress: { type: "string" },
      scheduledAt: { type: "string", description: "ISO 8601 datetime" },
    },
    required: ["service", "pickupAddress", "scheduledAt"],
  },
};
```

## Notification Triggers

Setiap status order change → trigger WhatsApp:

```typescript
// src/lib/whatsapp/triggers.ts
import { sendWhatsApp } from "./fonnte";
import { db } from "@/db/client";
import { whatsappTemplates, customers } from "@/db/schema";

export async function notifyOrderStatusChange(
  orderId: string,
  newStatus: string
) {
  // Get order + customer
  const [order] = await db
    .select({
      invoice: orders.invoiceNumber,
      customerName: customers.name,
      customerPhone: customers.phone,
      estimatedAt: orders.estimatedAt,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, orderId));

  // Find matching template
  const templateKey = STATUS_TO_TEMPLATE[newStatus];
  if (!templateKey) return;

  const [template] = await db
    .select()
    .from(whatsappTemplates)
    .where(and(
      eq(whatsappTemplates.tenantId, getCurrentTenantId()),
      eq(whatsappTemplates.key, templateKey),
      eq(whatsappTemplates.isActive, true)
    ));

  if (!template) return;

  // Render &amp; send
  const message = renderTemplate(template.body, {
    customer: order.customerName ?? "",
    invoice: order.invoice,
    estimated: order.estimatedAt?.toLocaleDateString("id-ID") ?? "",
    trackUrl: `https://${tenant.subdomain}.laundryhub.id/track/${order.invoice}`,
  });

  await sendWhatsApp({ to: order.customerPhone, message });

  // Update sent count
  await db
    .update(whatsappTemplates)
    .set({ sentCount: sql`${whatsappTemplates.sentCount} + 1` })
    .where(eq(whatsappTemplates.id, template.id));
}

const STATUS_TO_TEMPLATE: Record&lt;string, string&gt; = {
  RECEIVED: "order_received",
  PICKUP_PROCESS: "pickup_driver",
  READY_DELIVERY: "laundry_done",
  COMPLETED: "order_completed",
};
```

### Hook into Status Updates

```typescript
// src/db/repositories.ts
export async function updateOrderStatus(orderId: string, status: string) {
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  
  // Trigger notification (don't block)
  notifyOrderStatusChange(orderId, status).catch(console.error);
}
```

## Reminder Job

Cron job untuk reminder belum diambil 3 hari:

```typescript
// src/app/api/cron/reminders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { sendWhatsApp } from "@/lib/whatsapp/fonnte";

export async function GET(req: Request) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const orders = await db
    .select()
    .from(orders)
    .where(and(
      eq(orders.status, "READY_DELIVERY"),
      sql`${orders.updatedAt} < ${threeDaysAgo.getTime() / 1000}`,
    ));

  for (const order of orders) {
    await notifyReminder(order.id);
  }

  return NextResponse.json({ processed: orders.length });
}
```

Configure cron di Vercel `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

## Testing

### Test Mode

```typescript
const isTestMode = process.env.NODE_ENV !== "production";

export async function sendWhatsApp({ to, message }) {
  if (isTestMode) {
    console.log(`[TEST] WA to ${to}: ${message}`);
    return { status: true };
  }
  // real send
}
```

### Mock for Tests

```typescript
// __tests__/setup.ts
vi.mock("@/lib/whatsapp/fonnte", () => ({
  sendWhatsApp: vi.fn().mockResolvedValue({ status: true }),
}));
```

## Anti-Spam &amp; Compliance

### Opt-in

Customer harus opt-in untuk receive marketing:

```typescript
// Add to customers schema
optInWhatsapp: integer({ mode: "boolean" }).default(false),
```

Bedakan transactional (notifikasi order — always OK) vs marketing (broadcast — butuh opt-in).

### Unsubscribe

Setiap broadcast include opt-out:

```
... 

Reply STOP untuk berhenti.
```

Handle reply:

```typescript
if (incomingMessage.toUpperCase() === "STOP") {
  await db
    .update(customers)
    .set({ optInWhatsapp: false })
    .where(eq(customers.phone, sender));
  await sendWhatsApp({
    to: sender,
    message: "Anda telah berhenti menerima pesan promo. Terima kasih.",
  });
  return;
}
```

### Rate Limiting

Don't blast too fast (Fonnte limits ~30 msg/min on basic plan):

```typescript
import pLimit from "p-limit";
const limit = pLimit(5);  // Max 5 concurrent

await Promise.all(
  recipients.map((r) => limit(() => sendWhatsApp({ ... })))
);
```

## Selanjutnya

- [Backend Guide](./backend-guide.md)
- [Payment Integration](./payment-integration.md)
