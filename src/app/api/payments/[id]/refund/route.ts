import { NextResponse } from "next/server";
import { refundPayment } from "@/db/repositories";
import { requireRole } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Only owner can issue refunds
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json().catch(() => ({}));
    const result = await refundPayment({
      paymentId: params.id,
      amount: body.amount ? Number(body.amount) : undefined,
      reason: body.reason,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
