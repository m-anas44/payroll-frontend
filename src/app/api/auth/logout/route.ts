import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set("__payrollAccessToken__", "", { path: "/", maxAge: 0 });
  response.cookies.set("userRole", "", { path: "/", maxAge: 0 });

  response.cookies.set("__payrollRefreshToken__", "", {
    path: "/api/auth/refresh",
    maxAge: 0,
  });

  try {
    const accessToken = request.cookies.get("__payrollAccessToken__")?.value;
    if (accessToken) {
      await apiClient.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }
  } catch {
    // Best effort: cookie clearance on the client is the ultimate authority
  }

  return response;
}