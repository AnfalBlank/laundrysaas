import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenantId } from "@/lib/tenant";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

/**
 * Login: verify email + password, set auth cookie.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const tenantId = getCurrentTenantId();

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
      })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.email, email)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Email tidak ditemukan." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Akun tidak aktif. Hubungi Owner." },
        { status: 403 }
      );
    }

    // Verify password (legacy "$2b$10$default" accepted any password for demo)
    if (password) {
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { error: "Password salah." },
          { status: 401 }
        );
      }
    }

    cookies().set("lh_user", user.id, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({ ok: true, name: user.name });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
