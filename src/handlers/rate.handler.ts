import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError, extractErrorMessage } from "@/lib/errorHandler";
import {
  PieceRate,
  RateQueryParams,
  EffectiveRateParams,
  CreateRatePayload,
  UpdateRatePayload,
} from "@/types/rate";

export async function getRates(params?: RateQueryParams) {
  try {
    const response = await axios.get("/api/admin/rates", { params });

    const payload = response.data?.data ?? response.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      success: true,
      items: items as PieceRate[],
      total: Number(payload.total ?? items.length),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? 20),
    };
  } catch (error: unknown) {
    return {
      success: false,
      items: [] as PieceRate[],
      total: 0,
      page: 1,
      limit: 20,
      message: extractErrorMessage(error, "Failed to fetch rates."),
    };
  }
}

export async function getRateHistory(params?: Omit<RateQueryParams, "status">) {
  try {
    const response = await axios.get("/api/admin/rates/history", { params });

    const payload = response.data?.data ?? response.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      success: true,
      items: items as PieceRate[],
      total: Number(payload.total ?? items.length),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? 20),
    };
  } catch (error: unknown) {
    return {
      success: false,
      items: [] as PieceRate[],
      total: 0,
      page: 1,
      limit: 20,
      message: extractErrorMessage(error, "Failed to fetch rate history."),
    };
  }
}

export async function getRateById(rateId: string) {
  try {
    const response = await axios.get(`/api/admin/rates/${rateId}`);

    const resData = response.data?.data ?? response.data;
    return {
      success: true,
      data: resData as PieceRate,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: extractErrorMessage(error, "Failed to fetch rate details."),
    };
  }
}

export async function getEffectiveRate(params: EffectiveRateParams) {
  try {
    const response = await axios.get("/api/admin/rates/effective", { params });

    const resData = response.data?.data ?? response.data;
    return {
      success: true,
      data: resData as PieceRate,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: extractErrorMessage(error, "Failed to get effective rate."),
    };
  }
}

export async function createRate(payload: CreateRatePayload) {
  try {
    const response = await axios.post("/api/admin/rates", payload);

    const resData = response.data?.data ?? response.data;
    return {
      success: true,
      data: resData as PieceRate,
      message: "Rate created successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: extractErrorMessage(error, "Failed to create rate."),
    };
  }
}

export async function updateRate(rateId: string, payload: UpdateRatePayload) {
  try {
    const response = await axios.put(`/api/admin/rates/${rateId}`, payload);

    const resData = response.data?.data ?? response.data;
    return {
      success: true,
      data: resData as PieceRate,
      message: "Rate updated successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: extractErrorMessage(error, "Failed to update rate."),
    };
  }
}

export async function deleteRate(rateId: string) {
  try {
    await axios.delete(`/api/admin/rates/${rateId}`);

    return {
      success: true,
      message: "Rate deleted successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: extractErrorMessage(error, "Failed to delete rate."),
    };
  }
}