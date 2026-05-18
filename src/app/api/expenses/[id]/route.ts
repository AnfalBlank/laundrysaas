import { NextResponse } from "next/server";
import { updateExpense, deleteExpense } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.amount !== undefined) updates.amount = Number(body.amount);
    if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
    if (body.paymentMethod !== undefined) updates.paymentMethod = body.paymentMethod;
    if (body.vendor !== undefined) updates.vendor = body.vendor;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.expenseDate !== undefined) updates.expenseDate = new Date(body.expenseDate);

    await updateExpense(params.id, updates as never);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteExpense(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
