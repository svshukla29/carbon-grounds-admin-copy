"use client";

import { useAuth } from "@/lib/auth-context";

export type Role = "ADMIN" | "PROJECT_MANAGER" | "FIELD_OFFICER" | "ANALYST" | "VIEWER";

/**
 * What each staff role may do in the dashboard. Mirrors the backend's @Roles
 * decorators — the server enforces these; the UI only hides what would fail.
 * Viewing is open to every role.
 */
const PERMISSIONS = {
  /** Farmers, gram panchayats, plots, trees (incl. loss/replace), measurements,
   * photos, crop areas, kyari beds, monitoring periods & checklists */
  editFieldData: ["ADMIN", "PROJECT_MANAGER", "FIELD_OFFICER"],
  /** Permanent deletes (farmers, crop areas, kyari beds, tree photos, reports) */
  deleteRecords: ["ADMIN"],
  runCalculations: ["ADMIN", "PROJECT_MANAGER"],
  approveMonitoring: ["ADMIN", "PROJECT_MANAGER"],
  manageSpecies: ["ADMIN", "PROJECT_MANAGER"],
  manageProjects: ["ADMIN", "PROJECT_MANAGER"],
  editReports: ["ADMIN", "PROJECT_MANAGER", "ANALYST"],
  manageUsers: ["ADMIN"],
} satisfies Record<string, Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: string | undefined, permission: Permission): boolean {
  return !!role && (PERMISSIONS[permission] as string[]).includes(role);
}

/** `const can = useCan(); can("editFieldData")` */
export function useCan() {
  const { user } = useAuth();
  return (permission: Permission) => can(user?.role, permission);
}

/** Pages that only make sense for roles allowed to submit them. */
const PAGE_PERMISSIONS: [RegExp, Permission][] = [
  [/^\/dashboard\/(farmers|gram-panchayat|instances)\/(create|edit)(\/|$)/, "editFieldData"],
  [/^\/dashboard\/instances\/[^/]+\/add-trees$/, "editFieldData"],
  [/^\/dashboard\/reports\/(create|edit)(\/|$)/, "editReports"],
];

export function pagePermission(pathname: string): Permission | undefined {
  return PAGE_PERMISSIONS.find(([pattern]) => pattern.test(pathname))?.[1];
}
