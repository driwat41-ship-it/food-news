import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const allowedAdminRoles = new Set(["ADMIN", "EDITOR", "SUPER_ADMIN"]);

function isAdminBypassEnabled() {
  return process.env.ADMIN_BYPASS === "true" && process.env.NODE_ENV !== "production";
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  if (isAdminBypassEnabled()) return NextResponse.next();

  const role = request.headers.get("x-user-role");
  if (role && allowedAdminRoles.has(role)) return NextResponse.next();

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*"] };
