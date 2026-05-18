import { NextResponse } from "next/server";
import { listStaff, createStaff } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const staff = await listStaff();
    return NextResponse.json({ staff });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { error: "name, email, role required" },
        { status: 400 }
      );
    }
    const result = await createStaff(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
