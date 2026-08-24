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

export interface CreateRatePayload {
  departmentId: string;
  articleId: string;
  operationId: string;
  amount: number;
}

export interface UpdateRatePayload {
  amount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  status?: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const detail =
    error.response?.data?.detail ??
    error.response?.data?.error;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object" &&
          "msg" in item &&
          typeof item.msg === "string"
        ) {
          return item.msg;
        }

        return null;
      })
      .filter(Boolean);

    return messages.length > 0
      ? messages.join(", ")
      : fallback;
  }

  if (
    detail &&
    typeof detail === "object" &&
    "msg" in detail &&
    typeof detail.msg === "string"
  ) {
    return detail.msg;
  }

  return fallback;
}

export async function getRates(
  params?: RateQueryParams
) {
  try {
    const response = await axios.get(
      "/api/admin/rates",
      { params }
    );

    const payload = response.data ?? {};
    const items = Array.isArray(payload.items)
      ? payload.items
      : [];

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
      message: getErrorMessage(
        error,
        "Failed to fetch rates."
      ),
    };
  }
}

export async function getRateHistory(
  params?: Omit<RateQueryParams, "status">
) {
  try {
    const response = await axios.get(
      "/api/admin/rates/history",
      { params }
    );

    const payload = response.data ?? {};
    const items = Array.isArray(payload.items)
      ? payload.items
      : [];

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
      message: getErrorMessage(
        error,
        "Failed to fetch rate history."
      ),
    };
  }
}

export async function getRateById(rateId: string) {
  try {
    const response = await axios.get(
      `/api/admin/rates/${rateId}`
    );

    return {
      success: true,
      data: response.data as PieceRate,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "Failed to fetch rate details."
      ),
    };
  }
}

export async function getEffectiveRate(
  params: EffectiveRateParams
) {
  try {
    const response = await axios.get(
      "/api/admin/rates/effective",
      { params }
    );

    return {
      success: true,
      data: response.data as PieceRate,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "Failed to get effective rate."
      ),
    };
  }
}

export async function createRate(
  payload: CreateRatePayload
) {
  try {
    const response = await axios.post(
      "/api/admin/rates",
      payload
    );

    return {
      success: true,
      data: response.data as PieceRate,
      message: "Rate created successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "Failed to create rate."
      ),
    };
  }
}

export async function updateRate(
  rateId: string,
  payload: UpdateRatePayload
) {
  try {
    const response = await axios.put(
      `/api/admin/rates/${rateId}`,
      payload
    );

    return {
      success: true,
      data: response.data as PieceRate,
      message: "Rate updated successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "Failed to update rate."
      ),
    };
  }
}

export async function deleteRate(rateId: string) {
  try {
    await axios.delete(
      `/api/admin/rates/${rateId}`
    );

    return {
      success: true,
      message: "Rate deleted successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "Failed to delete rate."
      ),
    };
  }
}