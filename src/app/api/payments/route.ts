import { NextResponse } from "next/server";
import {
  listPayments,
  getPaymentSummary,
  getOutstandingPayments,
  recordPayment,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [payments, summary, outstanding] = await Promise.all([
      listPayments(20),
      getPaymentSummary(),
      getOutstandingPayments(),
    ]);
    return NextResponse.json({ payments, summary, outstanding });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.orderId || !body.amount || !body.method) {
      return NextResponse.json(
        { error: "orderId, amount, method required" },
        { status: 400 }
      );
    }
    const result = await recordPayment({
      orderId: body.orderId,
      amount: Number(body.amount),
      method: body.method,
      reference: body.reference,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
