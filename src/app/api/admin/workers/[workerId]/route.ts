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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const headers = getAuthHeaders(request);

  if (!headers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId } = await params;
    const response = await apiClient.get(`/admin/workers/${workerId}`, { headers });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to fetch worker.";

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const headers = getAuthHeaders(request);

  if (!headers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId } = await params;
    const body = await request.json();
    const response = await apiClient.put(`/admin/workers/${workerId}`, body, { headers });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to update worker.";

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const headers = getAuthHeaders(request);

  if (!headers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId } = await params;
    const response = await apiClient.delete(`/admin/workers/${workerId}`, { headers });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to delete worker.";

    return NextResponse.json({ error: message }, { status });
  }
}
