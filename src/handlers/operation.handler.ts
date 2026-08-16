import axios from "axios";
import { Operation } from "@/types/operation";

const normalizeOperation = (item: any): Operation => ({
  id: item?._id || item?.id || "",
  code: item?.code || "",
  name: item?.name || "",
  articleId: item?.articleId || item?.article_id || "",
  departmentId: item?.departmentId || item?.department_id || "",
  status: item?.status === "inactive" ? "Inactive" : "Active",
  createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
  updatedAt: item?.updatedAt || item?.updated_at,
});

export const OperationHandler = {
  async getOperations(params?: { search?: string; page?: number; limit?: number }) {
    const response = await axios.get("/api/admin/operations", { params });
    const payload = response.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      items: items.map(normalizeOperation),
      total: Number(payload.total ?? items.length ?? 0),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? items.length ?? 20),
    };
  },

  async createOperation(data: Partial<Operation> & { name: string; articleId: string; departmentId: string }) {
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
    return normalizeOperation(response.data);
  },

  async updateOperation(id: string, updates: Partial<Operation>) {
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
    return normalizeOperation(response.data);
  },

  async deleteOperation(id: string) {
    await axios.delete(`/api/admin/operations/${id}`);
    return true;
  },
};
