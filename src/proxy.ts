import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("__payrollAccessToken__")?.value;
  const rawUserRole = request.cookies.get("userRole")?.value || "";
  const normalizedUserRole = rawUserRole.toLowerCase();

  // Active session exists if access token is valid OR the 7-day session role cookie is present
  const hasActiveSession = Boolean(accessToken || rawUserRole);

  const isRootRoute = pathname === "/";
  const isAuthRoute = pathname.startsWith("/login");
  const isAdminRoute = pathname.startsWith("/admin");
  const isOperatorRoute = pathname.startsWith("/operator");

  const defaultDashboard =
    normalizedUserRole === "admin" ? "/admin/dashboard" : "/operator";

  // 1. Root route handling
  if (isRootRoute) {
    if (!hasActiveSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  // 2. Protect private routes when no session exists
  if (!hasActiveSession && (isAdminRoute || isOperatorRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Role boundary enforcement
  if (hasActiveSession && normalizedUserRole) {
    if (isAdminRoute && normalizedUserRole !== "admin") {
      return NextResponse.redirect(new URL("/operator", request.url));
    }
    if (isOperatorRoute && normalizedUserRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // 4. Redirect authenticated users away from /login
  if (hasActiveSession && isAuthRoute) {
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/operator/:path*", "/login"],
};