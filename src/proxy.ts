import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read cookies set by login API route
  const token = request.cookies.get("__payrollAccessToken__")?.value;
  const rawUserRole = request.cookies.get("userRole")?.value || "";
  const normalizedUserRole =
    rawUserRole.toLowerCase() === "operator"
      ? "worker"
      : rawUserRole.toLowerCase();

  const isAuthenticated = Boolean(token);

  const isRootRoute = pathname === "/";
  const isAuthRoute = pathname.startsWith("/login");
  const isAdminRoute = pathname.startsWith("/admin");
  const isWorkerRoute = pathname.startsWith("/worker");

  const defaultDashboard = normalizedUserRole === "admin" ? "/admin/dashboard" : "/worker";

  // 1. Handle "/" root route
  if (isRootRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  // 2. Protect private routes if unauthenticated
  if (!isAuthenticated && (isAdminRoute || isWorkerRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Prevent Workers from accessing Admin routes
  if (isAuthenticated && isAdminRoute && normalizedUserRole !== "admin") {
    return NextResponse.redirect(new URL("/worker", request.url));
  }

  // 4. Prevent Admins from accessing Worker routes
  if (isAuthenticated && isWorkerRoute && normalizedUserRole === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // 5. Redirect logged-in users away from /login
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/worker/:path*", "/login"],
};