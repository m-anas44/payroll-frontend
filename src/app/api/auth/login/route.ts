import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await apiClient.post("/auth/login", body);

    const resData = response.data;
    const token = resData?.accessToken || resData?.access_token || resData?.token;
    const refreshToken = resData?.refreshToken || resData?.refresh_token;
    const user = resData?.user;

    const rawUserRole = user?.role ? String(user.role).toLowerCase() : "";
    const normalizedUserRole =
      rawUserRole === "operator"
        ? "worker"
        : rawUserRole === "admin"
        ? "admin"
        : rawUserRole;

    const normalizedUser = user && typeof user === "object"
      ? {
          ...user,
          role:
            normalizedUserRole === "worker"
              ? "Worker"
              : normalizedUserRole === "admin"
              ? "Admin"
              : user.role,
        }
      : user;

    const responseBody = {
      ...resData,
      token,
      user: normalizedUser,
    };

    const responseObj = NextResponse.json(responseBody, { status: 200 });

    if (token) {
      // 1. Set HTTP-Only access token cookie (15 minutes)
      responseObj.cookies.set("__payrollAccessToken__", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60,
      });

      // 2. Set userRole cookie for Next.js route guarding (not httpOnly — read by middleware)
      if (normalizedUserRole) {
        responseObj.cookies.set("userRole", normalizedUserRole, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    if (refreshToken) {
      // 3. Set HTTP-Only refresh token cookie (7 days)
      responseObj.cookies.set("__payrollRefreshToken__", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
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