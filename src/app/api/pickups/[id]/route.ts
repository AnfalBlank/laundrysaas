import { NextResponse } from "next/server";
import { updatePickupStatus } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    if (!body.status) {
      return NextResponse.json({ error: "status required" }, { status: 400 });
    }
    await updatePickupStatus(params.id, body.status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
