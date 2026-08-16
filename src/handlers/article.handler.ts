import axios from "axios";
import { Article } from "@/types/article";

const normalizeArticle = (item: any): Article => ({
  id: item?._id || item?.id || "",
  articleNumber: item?.articleNumber || item?.article_number || "",
  name: item?.name || "",
  description: item?.description || "",
  status: item?.status === "inactive" ? "Inactive" : "Active",
  createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
  updatedAt: item?.updatedAt || item?.updated_at,
});

export const ArticleHandler = {
  async getArticles(params?: { search?: string; page?: number; limit?: number }) {
    const response = await axios.get("/api/admin/articles", { params });
    const payload = response.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      items: items.map(normalizeArticle),
      total: Number(payload.total ?? items.length ?? 0),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? items.length ?? 20),
    };
  },

  async createArticle(data: Partial<Article> & { articleNumber?: string }) {
    if (!data.articleNumber?.trim()) {
      throw new Error("Article number is required.");
    }

    const payload = {
      articleNumber: data.articleNumber.trim(),
      name: data.name?.trim() || undefined,
      description: data.description?.trim() || undefined,
      status: data.status === "Inactive" ? "inactive" : "active",
    };

    const response = await axios.post("/api/admin/articles", payload);
    return normalizeArticle(response.data);
  },

  async updateArticle(id: string, updates: Partial<Article>) {
    const payload: Record<string, string | undefined> = {};

    if (updates.articleNumber) {
      payload.articleNumber = updates.articleNumber.trim();
    }
    if (updates.name !== undefined) {
      payload.name = updates.name?.trim() || undefined;
    }
    if (updates.description !== undefined) {
      payload.description = updates.description?.trim() || undefined;
    }
    if (updates.status) {
      payload.status = updates.status === "Inactive" ? "inactive" : "active";
    }

    const response = await axios.put(`/api/admin/articles/${id}`, payload);
    return normalizeArticle(response.data);
  },

  async deleteArticle(id: string) {
    await axios.delete(`/api/admin/articles/${id}`);
    return true;
  },
};
