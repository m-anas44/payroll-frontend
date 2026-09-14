import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

function clearAllAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set("__payrollAccessToken__", "", { path: "/", maxAge: 0 });
  response.cookies.set("__payrollRefreshToken__", "", {
    path: "/api/auth/refresh",
    maxAge: 0,
  });
  response.cookies.set("userRole", "", { path: "/", maxAge: 0 });
  return response;
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("__payrollRefreshToken__")?.value;

  if (!refreshToken) {
    return clearAllAuthCookies(
      NextResponse.json({ error: "No refresh token present." }, { status: 401 })
    );
  }

  try {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    const resData = response.data?.data || response.data;

    const newAccessToken = resData?.accessToken;
    const newRefreshToken = resData?.refreshToken;

    if (!newAccessToken) {
      return clearAllAuthCookies(
        NextResponse.json({ error: "Invalid refresh response from backend." }, { status: 401 })
      );
    }

    const res = NextResponse.json(
      { success: true, message: "Token refreshed successfully." },
      { status: 200 }
    );

    res.cookies.set("__payrollAccessToken__", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    if (newRefreshToken) {
      res.cookies.set("__payrollRefreshToken__", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (error: any) {
    const status = error.response?.status || 401;
    const message = error.response?.data?.detail || "Session expired.";
    return clearAllAuthCookies(NextResponse.json({ error: message }, { status }));
  }
}