import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("body from login route: ", body)
    const response = await apiClient.post("/auth/login", body);

    const resData = response.data;
    const token = resData?.token;

    const responseObj = NextResponse.json(resData, { status: 200 });

    if (token) {
      responseObj.cookies.set("__payrollAccessToken__", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return responseObj;
  } catch (error: any) {
    console.log(`error`, error.response?.data);
    const status = error.response?.status || 500;
    const errorMessage =
      error?.response.data?.detail || "Internal Server Error";
    console.error("Signin Proxy Error:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status });
  }
}