import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";
import {
  ProductionBatchPayload,
  ProductionEntry,
  ProductionListResponse,
  ProductionQueryParams,
  ProductionStatusUpdatePayload,
  ProductionUpdatePayload,
} from "@/types/production";

export async function createProductionBatch(payload: ProductionBatchPayload) {
  try {
    const response = await axios.post("/api/admin/production", payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to create batch production entries.");
  }
}

export async function getProductionEntries(
  params?: ProductionQueryParams
): Promise<ProductionListResponse> {
  try {
    const response = await axios.get("/api/admin/production", { params });

    const payload = response.data?.data ?? response.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      items,
      total: Number(payload.total ?? items.length),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? 20),
    };
  } catch (error) {
    return handleApiError(error, "Failed to fetch production entries.");
  }
}

export async function getProductionEntryById(
  entryId: string
): Promise<ProductionEntry> {
  try {
    const response = await axios.get(`/api/admin/production/${entryId}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch production entry details.");
  }
}

export async function updateProductionEntry(
  entryId: string,
  payload: ProductionUpdatePayload
) {
  try {
    const response = await axios.put(`/api/admin/production/${entryId}`, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update production entry.");
  }
}

export async function updateProductionStatus(
  payload: ProductionStatusUpdatePayload
) {
  try {
    const response = await axios.patch("/api/admin/production/status", payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update production status.");
  }
}

export async function deleteProductionEntry(entryId: string) {
  try {
    const response = await axios.delete(`/api/admin/production/${entryId}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to delete production entry.");
  }
}