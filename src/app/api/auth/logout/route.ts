import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Clear all auth cookies
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set("__payrollAccessToken__", "", { path: "/", maxAge: 0 });
  response.cookies.set("__payrollRefreshToken__", "", { path: "/", maxAge: 0 });
  response.cookies.set("userRole", "", { path: "/", maxAge: 0 });

  // Notify backend (best-effort — do not fail logout if backend is unreachable)
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Ignore backend errors; cookie clearing is the primary revocation mechanism
  }

  return response;
}