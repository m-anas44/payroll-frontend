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
    const body = await request.json();
    
    // Determine whether your FastAPI backend expects `/admin/production` or `/admin/production/batch`
    const endpoint = body.items ? "/admin/production/batch" : "/admin/production";

    const response = await apiClient.post(endpoint, body, { headers });
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to create production record(s).";

    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  const headers = getAuthHeaders(request);

  if (!headers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    const allowedParams = [
      "startDate",
      "endDate",
      "workerId",
      "departmentId",
      "articleId",
      "operationId",
      "status",
      "enteredBy",
      "page",
      "limit",
    ];

    allowedParams.forEach((key) => {
      const val = searchParams.get(key);
      if (val && val !== "ALL") {
        params.set(key, val);
      }
    });

    const queryString = params.toString();
    const endpoint = `/admin/production${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(endpoint, { headers });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to fetch production entries.";

    return NextResponse.json({ error: message }, { status });
  }
}