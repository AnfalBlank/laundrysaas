import { NextResponse } from "next/server";
import {
  listPayments,
  getPaymentSummary,
  getOutstandingPayments,
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
    console.error("Payments API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
