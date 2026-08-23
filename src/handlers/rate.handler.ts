import axios from "axios";
import { PieceRate } from "@/types/rate";

export interface RateQueryParams {
  departmentId?: string;
  articleId?: string;
  operationId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface EffectiveRateParams {
  departmentId: string;
  articleId: string;
  operationId: string;
  date?: string;
}

// Fetch active / paginated rates
export async function getRates(params?: RateQueryParams) {
  try {
    const response = await axios.get("/api/admin/rates", { params });
    const payload = response.data ?? {};
    const items: PieceRate[] = Array.isArray(payload.items) ? payload.items : [];

    return {
      success: true,
      items,
      total: Number(payload.total ?? items.length ?? 0),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? items.length ?? 20),
    };
  } catch (error: any) {
    return {
      success: false,
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      message: error.response?.data?.error || "Failed to fetch rates.",
    };
  }
}

// Fetch rate revision history logs
export async function getRateHistory(params?: Omit<RateQueryParams, "status">) {
  try {
    const response = await axios.get("/api/admin/rates/history", { params });
    const payload = response.data ?? {};
    const items: PieceRate[] = Array.isArray(payload.items) ? payload.items : [];

    return {
      success: true,
      items,
      total: Number(payload.total ?? items.length ?? 0),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? items.length ?? 20),
    };
  } catch (error: any) {
    return {
      success: false,
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      message: error.response?.data?.error || "Failed to fetch rate history.",
    };
  }
}

// Lookup effective rate for an operation on a target date
export async function getEffectiveRate(params: EffectiveRateParams) {
  try {
    const response = await axios.get("/api/admin/rates/effective", { params });
    return {
      success: true,
      data: response.data as PieceRate,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Failed to get effective rate.",
    };
  }
}

// Create or revise rate for an operation
export async function addRate(data: Partial<PieceRate>, role?: string) {
  try {
    const response = await axios.post("/api/admin/rates", data);
    return {
      success: true,
      data: response.data as PieceRate,
      message: "Piece rate created successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Failed to create piece rate.",
    };
  }
}

// Update specific rate details by ID
export async function updateRate(
rateId: string, ratePerPiece: number, effectiveFrom: string, role?: string, notes?: string) {
  try {
    const response = await axios.put(`/api/admin/rates/${rateId}`, {
      ratePerPiece,
      effectiveFrom,
    });
    return {
      success: true,
      data: response.data as PieceRate,
      message: "Piece rate updated successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Failed to update piece rate.",
    };
  }
}

// Delete rate entry
export async function deleteRate(rateId: string) {
  try {
    await axios.delete(`/api/admin/rates/${rateId}`);
    return {
      success: true,
      message: "Piece rate deleted successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Failed to delete piece rate.",
    };
  }
}