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

        const search = searchParams.get("search");
        const page = searchParams.get("page");
        const limit = searchParams.get("limit");
        const status = searchParams.get("status");

        if (search) params.set("search", search);
        if (page) params.set("page", page);
        if (limit) params.set("limit", limit);
        if (status) params.set("status", status);

        const response = await apiClient.get(`/admin/articles${params.toString() ? `?${params.toString()}` : ""}`, {
            headers,
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        const status = error.response?.status || 500;
        const message =
            error.response?.data?.detail ||
            error.response?.data?.error ||
            "Unable to fetch articles.";

        return NextResponse.json({ error: message }, { status });
    }
}

export async function POST(request: NextRequest) {
    const headers = getAuthHeaders(request);

    if (!headers) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await apiClient.post("/admin/articles", body, { headers });

        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        const status = error.response?.status || 500;
        const message =
            error.response?.data?.detail ||
            error.response?.data?.error ||
            "Unable to create article.";

        return NextResponse.json({ error: message }, { status });
    }
}
