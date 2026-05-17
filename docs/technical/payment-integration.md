# Payment Integration

⚠️ **Status**: UI ready, integration logic placeholder.

## Provider Comparison

| Provider          | QRIS  | Transfer  | E-Wallet  | Fee     | Setup     |
| ----------------- | ----- | --------- | --------- | ------- | --------- |
| **Midtrans**      | ✓     | ✓         | ✓         | 0.7-2%  | Mudah     |
| **Xendit**        | ✓     | ✓         | ✓         | 0.7-2%  | Mudah     |
| **Duitku**        | ✓     | ✓         | ✓         | 0.5-1%  | Medium    |
| Doku              | ✓     | ✓         | ✓         | 0.7-2%  | Medium    |

Midtrans paling popular di Indonesia, recommended.

## Midtrans Integration

### Setup

1. Sign up [midtrans.com](https://midtrans.com)
2. Verify business
3. Get API keys (Sandbox + Production)

### SDK

```bash
npm install midtrans-client
```

### Create Transaction (QRIS)

```typescript
// src/lib/payment/midtrans.ts
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export async function createPayment({
  orderId,
  amount,
  customer,
  items,
}: {
  orderId: string;
  amount: number;
  customer: { name: string; email?: string; phone: string };
  items: { id: string; name: string; price: number; qty: number }[];
}) {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    item_details: items.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.qty,
    })),
    customer_details: customer,
    enabled_payments: ["qris", "bca_va", "bri_va", "gopay", "shopeepay"],
  };

  const transaction = await snap.createTransaction(parameter);
  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
}
```

### Embed Snap di Frontend

```tsx
// In order detail page
"use client";

import Script from "next/script";

export function PayButton({ orderId, amount, customer }: Props) {
  const handlePay = async () => {
    const res = await fetch("/api/payments/create", {
      method: "POST",
      body: JSON.stringify({ orderId, amount, customer }),
    });
    const { token } = await res.json();

    window.snap.pay(token, {
      onSuccess: (result) => {
        window.location.href = "/orders?payment=success";
      },
      onPending: (result) => {
        // Show pending UI
      },
      onError: (result) => {
        alert("Payment failed");
      },
    });
  };

  return (
    <>
      <Script
        src={
          process.env.NODE_ENV === "production"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      <Button onClick={handlePay}>Bayar Sekarang</Button>
    </>
  );
}
```

### Webhook (Notification)

Midtrans kirim webhook saat status payment berubah:

```typescript
// src/app/api/payments/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json();

  // Verify signature
  const signature = crypto
    .createHash("sha512")
    .update(
      body.order_id +
      body.status_code +
      body.gross_amount +
      process.env.MIDTRANS_SERVER_KEY
    )
    .digest("hex");

  if (signature !== body.signature_key) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Process payment
  switch (body.transaction_status) {
    case "settlement":
    case "capture":
      await markOrderPaid(body.order_id, {
        amount: parseInt(body.gross_amount),
        method: mapPaymentType(body.payment_type),
        reference: body.transaction_id,
      });
      break;

    case "deny":
    case "cancel":
    case "expire":
      await markOrderPaymentFailed(body.order_id);
      break;

    case "pending":
      // Wait
      break;
  }

  return NextResponse.json({ ok: true });
}

function mapPaymentType(type: string): "cash" | "transfer" | "qris" | "ewallet" {
  if (type === "qris") return "qris";
  if (["bca_va", "bri_va", "bni_va"].includes(type)) return "transfer";
  if (["gopay", "shopeepay", "dana"].includes(type)) return "ewallet";
  return "cash";
}
```

### Configure Webhook di Midtrans Dashboard

```
Settings → Payment Notification URL:
https://[bisnis].laundryhub.id/api/payments/webhook
```

## Xendit Integration (Alternative)

### SDK

```bash
npm install xendit-node
```

### Create Payment

```typescript
import { Xendit } from "xendit-node";

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET! });

const invoice = await xendit.Invoice.createInvoice({
  data: {
    externalId: orderId,
    amount,
    payerEmail: customer.email,
    description: `Pembayaran ${invoiceNumber}`,
    invoiceDuration: 86400,  // 24 hours
    paymentMethods: ["BCA", "BNI", "QRIS", "DANA", "OVO", "GOPAY"],
  },
});

// Return invoice.invoiceUrl for redirect
```

### Webhook

Mirip Midtrans, verify via callback token.

## Cash / Manual Payment

Untuk cash di kasir (tidak butuh payment gateway):

```typescript
// src/db/repositories.ts
export async function recordCashPayment({
  orderId,
  amount,
  cashier,
}: {
  orderId: string;
  amount: number;
  cashier: string;
}) {
  await db.transaction(async (tx) => {
    // Insert payment
    await tx.insert(payments).values({
      id: generateId("pay"),
      orderId,
      amount,
      method: "cash",
      reference: `CASHIER-${cashier}`,
    });

    // Update order payment status
    const totalPaid = await tx
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(eq(payments.orderId, orderId));

    const order = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const newStatus = 
      Number(totalPaid[0].total) >= order[0].total ? "paid" : "partial";

    await tx
      .update(orders)
      .set({ paymentStatus: newStatus })
      .where(eq(orders.id, orderId));
  });
}
```

## Split Payment

Multiple payments untuk satu order:

```typescript
export async function splitPayment(
  orderId: string,
  payments: { method: string; amount: number }[]
) {
  await db.transaction(async (tx) => {
    for (const p of payments) {
      await tx.insert(payments).values({
        id: generateId("pay"),
        orderId,
        amount: p.amount,
        method: p.method,
      });
    }
    
    // Update order payment status
    await updateOrderPaymentStatus(tx, orderId);
  });
}
```

## Refund

### Midtrans Refund

```typescript
import Midtrans from "midtrans-client";

const core = new Midtrans.CoreApi({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function refundPayment(transactionId: string, amount: number) {
  const result = await core.transaction.refund(transactionId, {
    refund_key: `refund-${Date.now()}`,
    amount,
    reason: "Customer request",
  });

  // Save refund record
  await db.insert(payments).values({
    id: generateId("pay"),
    orderId: ...,
    amount: -amount,  // negative for refund
    method: "refund",
    reference: result.transaction_id,
  });

  return result;
}
```

### Manual Refund (Cash/Transfer)

Just insert negative payment record, no gateway call:

```typescript
await db.insert(payments).values({
  id: generateId("pay"),
  orderId,
  amount: -amount,
  method: "refund",
  reference: "MANUAL-REFUND-CASH",
});
```

## Reconciliation

### Daily Cash Closing

```typescript
export async function getDailyCashSummary(branchId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const summary = await db
    .select({
      method: payments.method,
      total: sql&lt;number&gt;`sum(${payments.amount})`,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(and(
      eq(orders.branchId, branchId),
      sql`${payments.paidAt} between ${startOfDay.getTime()/1000} and ${endOfDay.getTime()/1000}`
    ))
    .groupBy(payments.method);

  return summary;
}
```

### Auto-Reconcile QRIS / E-Wallet

Webhook auto-update payment status saat customer bayar — no manual reconciliation needed.

## Receipt / Invoice

### Generate PDF Invoice

```bash
npm install @react-pdf/renderer
```

```tsx
// src/lib/invoice/template.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 18, marginBottom: 20 },
});

export function InvoicePDF({ order }: { order: Order }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <Text style={styles.header}>{order.invoiceNumber}</Text>
        {/* ... rest of invoice */}
      </Page>
    </Document>
  );
}
```

### Email Invoice

```typescript
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";

const resend = new Resend(process.env.RESEND_API_KEY);

const pdf = await renderToBuffer(<InvoicePDF order={order} />);

await resend.emails.send({
  from: "noreply@laundryhub.id",
  to: customer.email,
  subject: `Invoice ${order.invoiceNumber}`,
  html: `&lt;p&gt;Terlampir invoice Anda.&lt;/p&gt;`,
  attachments: [{ filename: "invoice.pdf", content: pdf }],
});
```

### Thermal Printer (WebUSB)

```typescript
// src/lib/printer/thermal.ts
const ESC = "\x1B";
const GS = "\x1D";

export class ThermalPrinter {
  device: USBDevice | null = null;

  async connect() {
    this.device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x04b8 }],  // Epson VID
    });
    await this.device.open();
    await this.device.selectConfiguration(1);
    await this.device.claimInterface(0);
  }

  async printOrder(order: Order) {
    let buf = "";
    buf += `${ESC}@`;  // Reset
    buf += `${ESC}a\x01`;  // Center
    buf += `LAUNDRYHUB\n`;
    buf += `${order.invoiceNumber}\n`;
    buf += `${ESC}a\x00`;  // Left
    buf += `Customer: ${order.customer.name}\n`;
    // ... more
    buf += `${GS}V\x42\x00`;  // Cut paper

    await this.device!.transferOut(1, new TextEncoder().encode(buf));
  }
}
```

## Security

- [ ] Verify webhook signature
- [ ] Don't trust amount from client (always validate server-side)
- [ ] Use HTTPS for webhook URL
- [ ] Rate limit webhook endpoint
- [ ] Idempotent webhook handler (handle retries)
- [ ] Log every payment event

### Idempotency

```typescript
// Save webhook event ID to prevent duplicate processing
const exists = await db
  .select()
  .from(webhookEvents)
  .where(eq(webhookEvents.id, body.transaction_id))
  .limit(1);

if (exists.length > 0) {
  return NextResponse.json({ ok: true, duplicate: true });
}

// Process &amp; save event
await processPayment(body);
await db.insert(webhookEvents).values({
  id: body.transaction_id,
  payload: JSON.stringify(body),
});
```

## Testing

### Sandbox Mode

Midtrans sandbox cards:

| Card                | Number             | Result   |
| ------------------- | ------------------ | -------- |
| Approved            | 4811 1111 1111 1114 | Success  |
| Denied              | 4911 1111 1111 1113 | Failed   |
| 3DS challenge       | 4411 1111 1111 1118 | Pending  |

QRIS sandbox: scan via Midtrans simulator app.

### Webhook Testing

Use ngrok untuk expose local:

```bash
ngrok http 3000
# https://xxx.ngrok.io/api/payments/webhook
```

Set di Midtrans dashboard sandbox.

## Selanjutnya

- [WhatsApp Integration](./whatsapp-integration.md)
- [Backend Guide](./backend-guide.md)
