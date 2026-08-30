import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

function getAuthHeaders(request: NextRequest) {
  const token = request.cookies.get("__payrollAccessToken__")?.value;
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { month: string } }
) {
  const headers = getAuthHeaders(request);

  if (!headers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { month } = params;
    const response = await apiClient.get(`/admin/payroll/${month}`, { headers });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to fetch payroll record for month.";

    return NextResponse.json({ error: message }, { status });
  }
}
