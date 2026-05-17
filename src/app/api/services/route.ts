import { NextResponse } from "next/server";
import { listServices, createService } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await listServices();
    return NextResponse.json({ services });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Name and price required" }, { status: 400 });
    }
    const result = await createService({
      name: body.name,
      category: body.category ?? "regular",
      pricingType: body.pricingType ?? "per_kg",
      price: Number(body.price),
      durationDays: Number(body.durationDays ?? 2),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
