import { NextResponse } from "next/server";
import { listCustomers, getCustomerStats } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
    console.error("Customers API error:", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
