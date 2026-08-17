import axios from "axios";
import { Operation } from "@/types/operation";

export async function getOperations(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await axios.get("/api/admin/operations", { params });
  const payload = response.data ?? {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    items: items,
    total: Number(payload.total ?? items.length ?? 0),
    page: Number(payload.page ?? 1),
    limit: Number(payload.limit ?? items.length ?? 20),
  };
}

export async function createOperation(
  data: Partial<Operation> & { name: string; articleId: string; departmentId: string }
) {
  if (!data.name?.trim()) {
    throw new Error("Operation name is required.");
  }
  if (!data.articleId) {
    throw new Error("Article is required.");
  }
  if (!data.departmentId) {
    throw new Error("Department is required.");
  }

  const payload = {
    name: data.name.trim(),
    articleId: data.articleId,
    departmentId: data.departmentId,
    status: data.status === "Inactive" ? "inactive" : "active",
  };

  const response = await axios.post("/api/admin/operations", payload);
  return response.data;
}

export async function updateOperation(id: string, updates: Partial<Operation>) {
  const payload: Record<string, string | undefined> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name?.trim() || undefined;
  }
  if (updates.code !== undefined) {
    payload.code = updates.code?.trim() || undefined;
  }
  if (updates.articleId) {
    payload.articleId = updates.articleId;
  }
  if (updates.departmentId) {
    payload.departmentId = updates.departmentId;
  }
  if (updates.status) {
    payload.status = updates.status === "Inactive" ? "inactive" : "active";
  }

  const response = await axios.put(`/api/admin/operations/${id}`, payload);
  return response.data;
}

export async function deleteOperation(id: string) {
  await axios.delete(`/api/admin/operations/${id}`);
  return true;
}