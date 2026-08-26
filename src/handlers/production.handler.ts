import axios from "axios";

export interface ProductionQueryParams {
  startDate?: string;
  endDate?: string;
  workerId?: string;
  departmentId?: string;
  articleId?: string;
  operationId?: string;
  status?: string;
  enteredBy?: string;
  page?: number;
  limit?: number;
}

export interface ProductionUpdatePayload {
  quantity?: number;
  productionDate?: string;
  notes?: string;
  status?: string;
}

export interface ProductionStatusUpdatePayload {
  status: string;
  entryIds: string[];
}

export interface ProductionEntry {
  _id: string;
  workerId: string;
  departmentId: string;
  articleId: string;
  operationId: string;
  productionDate: string;
  quantity: number;
  rateId: string;
  appliedRate: number;
  totalAmount: number;
  status: string;
  enteredBy: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionListResponse {
  items: ProductionEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductionBatchItemPayload {
  workerId: string;
  departmentId: string;
  articleId: string;
  operationId: string;
  quantity: number;
  notes?: string;
}

export interface ProductionBatchPayload {
  productionDate: string;
  items: ProductionBatchItemPayload[];
}

export async function createProductionBatch(
  payload: ProductionBatchPayload
) {
  const response = await axios.post(
    "/api/admin/production/batch",
    payload
  );

  return response.data;
}

export async function getProductionEntries(
  params?: ProductionQueryParams
): Promise<ProductionListResponse> {
  const response = await axios.get(
    "/api/admin/production",
    { params }
  );

  const payload = response.data ?? {};
  const items = Array.isArray(payload.items)
    ? payload.items
    : [];

  return {
    items,
    total: Number(payload.total ?? items.length),
    page: Number(payload.page ?? 1),
    limit: Number(payload.limit ?? 20),
  };
}

export async function getProductionEntryById(
  entryId: string
): Promise<ProductionEntry> {
  const response = await axios.get(
    `/api/admin/production/${entryId}`
  );

  return response.data;
}

export async function updateProductionEntry(
  entryId: string,
  payload: ProductionUpdatePayload
) {
  const response = await axios.put(
    `/api/admin/production/${entryId}`,
    payload
  );

  return response.data;
}

export async function updateProductionStatus(
  payload: ProductionStatusUpdatePayload
) {
  const response = await axios.patch(
    "/api/admin/production/status",
    payload
  );

  return response.data;
}

export async function deleteProductionEntry(
  entryId: string
) {
  const response = await axios.delete(
    `/api/admin/production/${entryId}`
  );

  return response.data;
}