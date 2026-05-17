import { NextResponse } from "next/server";
import { listPickups, listDrivers, createPickup } from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [pickups, drivers] = await Promise.all([listPickups(), listDrivers()]);
    return NextResponse.json({ pickups, drivers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.orderId || !body.scheduledAt) {
      return NextResponse.json(
        { error: "orderId and scheduledAt required" },
        { status: 400 }
      );
    }
    const result = await createPickup({
      orderId: body.orderId,
      driverId: body.driverId,
      type: body.type ?? "pickup",
      address: body.address,
      scheduledAt: new Date(body.scheduledAt),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
