import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";

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

    const departmentId = searchParams.get("departmentId");
    const articleId = searchParams.get("articleId");
    const operationId = searchParams.get("operationId");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (departmentId) params.set("departmentId", departmentId);
    if (articleId) params.set("articleId", articleId);
    if (operationId) params.set("operationId", operationId);
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`/admin/rates/history${queryString}`, { headers });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to fetch rate history.";

    return NextResponse.json({ error: message }, { status });
  }
}