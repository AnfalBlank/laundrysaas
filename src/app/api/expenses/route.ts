import { NextResponse } from "next/server";
import {
  listExpenses,
  createExpense,
  listExpenseCategories,
  getExpenseSummary,
} from "@/db/repositories";
import { requireRole, requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Only owner can see expenses (financial data)
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");
    const start = startStr ? new Date(startStr) : undefined;
    const end = endStr ? new Date(endStr) : undefined;

    const [expenses, categories, summary] = await Promise.all([
      listExpenses({ startDate: start, endDate: end, limit: 100 }),
      listExpenseCategories(),
      getExpenseSummary({ startDate: start, endDate: end }),
    ]);

    return NextResponse.json({ expenses, categories, summary });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requirePermission("expenses:create");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (!body.title || !body.amount) {
      return NextResponse.json(
        { error: "title and amount required" },
        { status: 400 }
      );
    }
    const result = await createExpense({
      title: body.title,
      amount: Number(body.amount),
      categoryId: body.categoryId,
      branchId: body.branchId,
      paymentMethod: body.paymentMethod,
      vendor: body.vendor,
      notes: body.notes,
      expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
