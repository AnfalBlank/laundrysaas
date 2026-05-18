import { NextResponse } from "next/server";
import { getProfitAndLoss } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    const startDate = startStr
      ? new Date(startStr)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = endStr ? new Date(endStr) : new Date();

    const pnl = await getProfitAndLoss({ startDate, endDate });
    return NextResponse.json(pnl);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
