import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("__payrollRefreshToken__")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const response = await apiClient.post("/auth/refresh", {
      refreshToken,
    });

    const newAccessToken =
      response.data?.accessToken || response.data?.access_token;

    if (!newAccessToken) {
      return NextResponse.json(
        { error: "Invalid refresh response" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true }, { status: 200 });

    // Re-issue the access token cookie for 15 minutes
    res.cookies.set("__payrollAccessToken__", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    return res;
  } catch (error: any) {
    const status = error.response?.status || 401;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Refresh failed";

    // Clear cookies on refresh failure so the client knows to redirect to login
    const res = NextResponse.json({ error: message }, { status });
    res.cookies.set("__payrollAccessToken__", "", { path: "/", maxAge: 0 });
    res.cookies.set("__payrollRefreshToken__", "", { path: "/", maxAge: 0 });
    res.cookies.set("userRole", "", { path: "/", maxAge: 0 });
    return res;
  }
}
