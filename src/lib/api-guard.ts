import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "./auth";
import type { AuthUser, Role } from "./auth-types";

/**
 * API route guard. Returns either an authenticated user or a NextResponse error.
 *
 * Usage:
 *   const guard = await requireAuth();
 *   if (guard instanceof NextResponse) return guard;
 *   const user = guard;
 */
export async function requireAuth(): Promise<AuthUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login kembali." },
      { status: 401 }
    );
  }
  return user;
}

/**
 * Require auth + specific permission. Returns user or 403 response.
 */
export async function requirePermission(
  permission: string
): Promise<AuthUser | NextResponse> {
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;

  if (!hasPermission(guard.role, permission)) {
    return NextResponse.json(
      { error: `Akses ditolak. Anda tidak punya permission: ${permission}` },
      { status: 403 }
    );
  }
  return guard;
}

/**
 * Require one of specific roles.
 */
export async function requireRole(
  ...roles: Role[]
): Promise<AuthUser | NextResponse> {
  const guard = await requireAuth();
  if (guard instanceof NextResponse) return guard;

  if (!roles.includes(guard.role)) {
    return NextResponse.json(
      {
        error: `Akses ditolak. Hanya ${roles.join(", ")} yang bisa akses endpoint ini.`,
      },
      { status: 403 }
    );
  }
  return guard;
}
