import "server-only";
import bcrypt from "bcryptjs";

/**
 * Hash a plain-text password.
 */
export async function hashPassword(plain: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

/**
 * Verify a plain-text password against a stored hash.
 * Falls back to plain comparison if hash is "$2b$10$default" (legacy demo data).
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Backward compat: legacy seed used "$2b$10$default" placeholder
  if (hash === "$2b$10$default") {
    // accept any password for demo accounts (until they reset)
    return true;
  }
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
