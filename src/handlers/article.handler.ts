import { Article } from "@/types/article";
import { useMasterDataStore } from "@/store/masterData.store";

export const ArticleHandler = {
  getArticles: () => useMasterDataStore.getState().articles,

  addArticle: (data: Omit<Article, "id" | "createdAt">) => {
    if (!data.articleCode || !data.name) {
      return { success: false, message: "Article Code and Name are required." };
    }
    useMasterDataStore.getState().addArticle(data);
    return { success: true, message: "Article created." };
  },

  updateArticle: (id: string, updates: Partial<Article>) => {
    useMasterDataStore.getState().updateArticle(id, updates);
    return { success: true, message: "Article updated." };
  },

  deleteArticle: (id: string) => {
    useMasterDataStore.getState().deleteArticle(id);
    return { success: true, message: "Article removed." };
  },
};
