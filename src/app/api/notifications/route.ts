import { NextResponse } from "next/server";
import {
  listNotifications,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "@/db/repositories";
import { requireAuth } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const [items, unreadCount] = await Promise.all([
      listNotifications({ userId: guard.id, unreadOnly }),
      getUnreadNotificationCount(guard.id),
    ]);
    return NextResponse.json({ notifications: items, unreadCount });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * Mark all read.
 */
export async function PATCH() {
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;
  try {
    await markAllNotificationsRead(guard.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
