import { NextResponse } from "next/server";
import { listSuppliers, createSupplier } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const suppliers = await listSuppliers();
    return NextResponse.json({ suppliers });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const result = await createSupplier(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
