import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

const allowedRoles: UserRole[] = ["ADMIN", "EDITOR", "SUPER_ADMIN"];

export function isAdminBypassEnabled() {
  return process.env.ADMIN_BYPASS === "true" && process.env.NODE_ENV !== "production";
}

export async function getCurrentAdmin() {
  if (isAdminBypassEnabled()) return { id: "system", role: "ADMIN" as UserRole, email: "admin@local" };
  const requestHeaders = await headers();
  const role = requestHeaders.get("x-user-role") as UserRole | null;
  const userId = requestHeaders.get("x-user-id") ?? "system";
  const email = requestHeaders.get("x-user-email") ?? "admin@example.com";
  if (!role || !allowedRoles.includes(role)) return null;
  return { id: userId, role, email };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/auth/login?next=/admin");
  return admin;
}
