import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/**
 * Demo login: find user by email within tenant and set cookie.
 * Production should validate password hash.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const tenantId = getCurrentTenantId();

    const [user] = await db
      .select({ id: users.id, name: users.name, isActive: users.isActive })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.email, email)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak ditemukan. Pastikan email benar." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Akun tidak aktif. Hubungi Owner." },
        { status: 403 }
      );
    }

    // Set auth cookie (demo — no password check)
    cookies().set("lh_user", user.id, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ ok: true, name: user.name });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
