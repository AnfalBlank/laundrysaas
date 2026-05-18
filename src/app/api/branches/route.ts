import { NextResponse } from "next/server";
import { listBranches, createBranch } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const branches = await listBranches();
    return NextResponse.json({ branches });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const result = await createBranch({
      name: body.name,
      address: body.address,
      phone: body.phone,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
