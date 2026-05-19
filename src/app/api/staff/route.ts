import { NextResponse } from "next/server";
import { listStaff, createStaff } from "@/db/repositories";
import { requireRole } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    const staff = await listStaff();
    return NextResponse.json({ staff });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requireRole("owner");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json({ error: "name, email, role required" }, { status: 400 });
    }
    const result = await createStaff(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
