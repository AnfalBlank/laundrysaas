import { NextResponse } from "next/server";
import { listCustomers, getCustomerStats, createCustomer } from "@/db/repositories";
import { requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await requirePermission("customers:read");
  if (guard instanceof NextResponse) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier") ?? undefined;
    const q = searchParams.get("q") ?? undefined;
    const [customers, stats] = await Promise.all([
      listCustomers({ tier, q }),
      getCustomerStats(),
    ]);
    return NextResponse.json({ customers, stats });
  } catch (err) {
    console.error("Customers GET error:", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requirePermission("customers:create");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Name and phone required" }, { status: 400 });
    }
    const result = await createCustomer(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
