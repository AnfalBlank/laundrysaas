/**
 * Client-safe types & constants (no server imports).
 */

export type Role = "owner" | "admin" | "staff" | "driver";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId: string | null;
  branchName: string | null;
  tenantId: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin / Kasir",
  staff: "Staff Laundry",
  driver: "Driver",
};
