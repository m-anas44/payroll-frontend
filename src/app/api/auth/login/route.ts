import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await apiClient.post("/auth/login", body);

    // FastAPI returns wrapped response in create_response envelope: { success, status_code, message, data: { accessToken, ... } }
    const resEnvelope = response.data || {};
    const resData = resEnvelope.data || resEnvelope;

    const token =
      resData?.accessToken ||
      resData?.access_token ||
      resData?.token ||
      resEnvelope?.token;

    const refreshToken =
      resData?.refreshToken ||
      resData?.refresh_token ||
      resEnvelope?.refreshToken;

    const user = resData?.user || resEnvelope?.user;

    const rawUserRole = user?.role ? String(user.role).toLowerCase() : "";
    const normalizedUserRole =
      rawUserRole === "operator"
        ? "operator"
        : rawUserRole === "admin"
        ? "admin"
        : rawUserRole;

    const normalizedUser =
      user && typeof user === "object"
        ? {
            ...user,
            role:
              normalizedUserRole === "operator"
                ? "Operator"
                : normalizedUserRole === "admin"
                ? "Admin"
                : user.role,
          }
        : user;

    const responseBody = {
      ...resEnvelope,
      token,
      accessToken: token,
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