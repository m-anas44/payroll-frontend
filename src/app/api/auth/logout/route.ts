import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  // Clear both auth cookies on logout
  response.cookies.set("__payrollAccessToken__", "", { path: "/", maxAge: 0 });
  response.cookies.set("userRole", "", { path: "/", maxAge: 0 });

  return response;
}