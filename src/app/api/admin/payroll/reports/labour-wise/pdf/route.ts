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
    const month = searchParams.get("month");

    const params = new URLSearchParams();
    if (month) params.set("month", month);

    const response = await apiClient.get(
      `/admin/payroll/reports/labour-wise/pdf${params.toString() ? `?${params.toString()}` : ""}`,
      {
        headers,
        responseType: "arraybuffer",
      }
    );

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          response.headers["content-disposition"] ||
          `attachment; filename=labour_wise_report_${month || "download"}.pdf`,
      },
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Unable to download labour-wise report PDF.";

    return NextResponse.json({ error: message }, { status });
  }
}
