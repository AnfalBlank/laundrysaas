/**
 * Tenant resolution helper.
 * In production this would derive tenant from subdomain/JWT/session.
 * For now we use a default tenant for the demo.
 */

export const DEFAULT_TENANT_ID = "tenant_laundrysukses";

export function getCurrentTenantId(): string {
  // TODO: derive from session/cookie/subdomain in production
  return DEFAULT_TENANT_ID;
}
