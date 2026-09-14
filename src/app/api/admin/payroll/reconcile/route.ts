import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

function getAuthHeaders(request: NextRequest) {
  const token = request.cookies.get("__payrollAccessToken__")?.value;
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function POST(request: NextRequest) {
  const headers = getAuthHeaders(request);

  if (!headers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let month = searchParams.get("month");

    if (!month) {
      try {
        const body = await request.json();
        month = body.month;
      } catch {
        // Body was empty or not JSON
      }
    }

    if (!month) {
      return NextResponse.json({ error: "Month parameter is required (YYYY-MM)." }, { status: 400 });
    }

    const response = await apiClient.post(`/admin/payroll/reconcile?month=${encodeURIComponent(month)}`, {}, { headers });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to reconcile payroll.";

    return NextResponse.json({ error: message }, { status });
  }
}
