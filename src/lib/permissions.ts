export type AppRole = "admin" | "editor" | "viewer";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "Full access, manages users and organisation settings",
  editor: "Can add and edit records",
  viewer: "Read-only access",
};

/** Admins and editors can change records; viewers can only read. */
export function canEditRecords(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

export function isAdmin(role: AppRole | null | undefined): boolean {
  return role === "admin";
}
