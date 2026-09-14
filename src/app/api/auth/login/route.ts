import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await apiClient.post("/auth/login", body);

    const resData = response.data?.data || response.data;
    const { accessToken, refreshToken, user } = resData;

    const responseObj = NextResponse.json({ user }, { status: 200 });

    if (accessToken) {
      responseObj.cookies.set("__payrollAccessToken__", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60,
      });

      if (user) {
        responseObj.cookies.set("userRole", user.role, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    if (refreshToken) {
      // CRITICAL: Scoped ONLY to the refresh endpoint
      responseObj.cookies.set("__payrollRefreshToken__", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return responseObj;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const errorMessage =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      "Internal Server Error";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}