import { NextResponse } from "next/server";
import { listInventory, createInventoryItem } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const inventory = await listInventory();
    return NextResponse.json({ inventory });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.category || !body.unit) {
      return NextResponse.json(
        { error: "name, category, unit required" },
        { status: 400 }
      );
    }
    const result = await createInventoryItem({
      name: body.name,
      category: body.category,
      unit: body.unit,
      stock: Number(body.stock ?? 0),
      minimumStock: Number(body.minimumStock ?? 0),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
