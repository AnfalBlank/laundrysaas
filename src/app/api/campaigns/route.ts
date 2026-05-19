import { NextResponse } from "next/server";
import { listCampaigns, createCampaign, getSegmentStats } from "@/db/repositories";
import { requirePermission } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("marketing:read");
  if (guard instanceof NextResponse) return guard;
  try {
    const [campaigns, segments] = await Promise.all([
      listCampaigns(),
      getSegmentStats(),
    ]);
    return NextResponse.json({ campaigns, segments });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requirePermission("marketing:create");
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    if (!body.name || !body.body) {
      return NextResponse.json({ error: "name and body required" }, { status: 400 });
    }
    const result = await createCampaign({
      name: body.name,
      segment: body.segment,
      channel: body.channel ?? "whatsapp",
      body: body.body,
      status: body.status ?? "draft",
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      recipientCount: body.recipientCount ?? 0,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
