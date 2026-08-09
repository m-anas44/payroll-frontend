import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await apiClient.post("/auth/register", body);
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const errorMessage = error?.response?.data?.detail || "Internal Server Error";
    console.error("Register Proxy Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
