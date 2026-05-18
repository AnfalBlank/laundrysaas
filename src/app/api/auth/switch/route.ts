import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Demo endpoint: switch active user by setting cookie.
 * Real production should validate password & issue JWT.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    cookies().set("lh_user", body.userId, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  cookies().delete("lh_user");
  return NextResponse.json({ ok: true });
}
