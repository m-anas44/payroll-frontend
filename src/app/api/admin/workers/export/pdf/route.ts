import { apiClient } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

function getAuthHeaders(request: NextRequest) {
  const token = request.cookies.get("__payrollAccessToken__")?.value;

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function GET(request: NextRequest) {
  const headers = getAuthHeaders(request);

  if (!headers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const policeVerification = searchParams.get("policeVerification");
    const search = searchParams.get("search");

    if (status) params.set("status", status);
    if (departmentId) params.set("departmentId", departmentId);
    if (policeVerification) params.set("policeVerification", policeVerification);
    if (search) params.set("search", search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`/admin/workers/export/pdf${queryString}`, {
      headers,
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to export workers PDF.";

    return NextResponse.json({ error: message }, { status });
  }
}
