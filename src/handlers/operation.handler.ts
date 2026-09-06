import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";
import { Operation } from "@/types/operation";

export async function getOperations(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axios.get("/api/admin/operations", { params });
    const payload = response.data?.data ?? response.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      items: items,
      total: Number(payload.total ?? items.length ?? 0),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? items.length ?? 20),
    };
  } catch (error) {
    return handleApiError(error, "Failed to fetch operations.");
  }
}

export async function createOperation(
  data: Partial<Operation> & { name: string; departmentId: string }
) {
  if (!data.name?.trim()) {
    throw new Error("Operation name is required.");
  }
  if (!data.departmentId) {
    throw new Error("Department is required.");
  }

  const payload = {
    name: data.name.trim(),
    departmentId: data.departmentId,
    status: data.status === "Inactive" ? "inactive" : "active",
  };

  try {
    const response = await axios.post("/api/admin/operations", payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to create operation.");
  }
}

export async function updateOperation(id: string, updates: Partial<Operation>) {
  const payload: Record<string, string | undefined> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name?.trim() || undefined;
  }
  if (updates.code !== undefined) {
    payload.code = updates.code?.trim() || undefined;
  }
  if (updates.departmentId) {
    payload.departmentId = updates.departmentId;
  }
  if (updates.status) {
    payload.status = updates.status === "Inactive" ? "inactive" : "active";
  }

  try {
    const response = await axios.put(`/api/admin/operations/${id}`, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update operation.");
  }
}

export async function deleteOperation(id: string) {
  try {
    await axios.delete(`/api/admin/operations/${id}`);
    return true;
  } catch (error) {
    return handleApiError(error, "Failed to delete operation.");
  }
}