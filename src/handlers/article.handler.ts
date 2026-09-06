import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";
import { Article, GetArticlesParams, GetArticlesResponse } from "@/types/article";

export async function getArticles(
  params?: GetArticlesParams
): Promise<GetArticlesResponse> {
  try {
    const response = await axios.get("/api/admin/articles", { params });
    const payload = response.data?.data ?? response.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    return {
      items,
      total: Number(payload.total ?? items.length ?? 0),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? items.length ?? 20),
    };
  } catch (error) {
    return handleApiError(error, "Failed to fetch articles.");
  }
}

export async function createArticle(
  data: Partial<Article> & { articleNumber?: string }
) {
  if (!data.articleNumber?.trim()) {
    throw new Error("Article number is required.");
  }

  const payload = {
    articleNumber: data.articleNumber.trim(),
    name: data.name?.trim() || undefined,
    description: data.description?.trim() || undefined,
    status: data.status === "Inactive" ? "inactive" : "active",
  };

  try {
    const response = await axios.post("/api/admin/articles", payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to create article.");
  }
}

export async function updateArticle(id: string, updates: Partial<Article>) {
  if (!id) {
    throw new Error("Article ID is required for update.");
  }

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

  try {
    const response = await axios.put(`/api/admin/articles/${id}`, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update article.");
  }
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!id) {
    throw new Error("Article ID is required for deletion.");
  }

  try {
    await axios.delete(`/api/admin/articles/${id}`);
    return true;
  } catch (error) {
    return handleApiError(error, "Failed to delete article.");
  }
}