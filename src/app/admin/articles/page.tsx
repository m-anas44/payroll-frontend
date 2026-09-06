"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} from "@/handlers/article.handler";
import ArticleModal from "@/components/master/ArticleModal";
import Heading from "@/components/common/Heading";
import Pagination from "@/components/common/Pagination";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { Article } from "@/types/article";
import { Package, Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function ArticlesPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin"

  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [articleToDelete, setArticleToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadArticles = useCallback(
    async (
      nextPage = 1,
      customSearch?: string,
      customLimit?: number
    ) => {
      try {
        setIsLoading(true);
        setError("");

        const activeLimit = customLimit ?? limit;
        const result = await getArticles({
          search: (customSearch?.trim() ?? submittedSearch.trim()) || undefined,
          page: nextPage,
          limit: activeLimit,
        });

        setArticles(result.items);
        setTotal(result.total);
        setPage(result.page || nextPage);
      } catch (err: any) {
        setError(err.message || "Unable to load articles.");
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, submittedSearch]
  );

  useEffect(() => {
    loadArticles(1);
  }, [loadArticles]);

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    setSubmittedSearch(trimmed);
    setPage(1);
    loadArticles(1, trimmed);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSubmittedSearch("");
    setPage(1);
    loadArticles(1, "");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadArticles(newPage, submittedSearch);
  };

  const handleLimitChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
    loadArticles(1, submittedSearch, newSize);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      setIsDeleting(true);
      await deleteArticle(articleToDelete.id);
      toast.success(`Article "${articleToDelete.name}" deleted.`);
      setArticleToDelete(null);
      await loadArticles(page, submittedSearch);
    } catch (err: any) {
      toast.error(err.message || "Unable to delete article.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (payload: {
    articleNumber: string;
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }) => {
    try {
      if (articleToEdit) {
        await updateArticle(articleToEdit._id, payload);
      } else {
        await createArticle(payload);
      }

      setIsModalOpen(false);
      setArticleToEdit(null);
      await loadArticles(page, submittedSearch);
    } catch (err: any) {
      setError(err.message || "Unable to save article.");
    }
  };

  return (
    <div className="space-y-6">
      <Heading
        title="Article Catalog"
        subtitle="Manage article numbers, names, and status."
        icon={Package}
        actions={
          isAdmin ? (
            <button
              type="button"
              onClick={() => {
                setArticleToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Article</span>
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search article number or name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Article Number</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400 font-medium"
                >
                  Loading articles...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400 font-medium"
                >
                  No articles found.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr
                  key={article._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {article.articleNumber}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span>{article.name || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {article.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${article.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setArticleToEdit(article);
                            setIsModalOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleToDelete({ id: article._id, name: article.name || article.articleNumber })}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={page}
          pageSize={limit}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handleLimitChange}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          itemLabel="articles"
        />
      </div>

      <ArticleModal
        key={isModalOpen ? (articleToEdit ? articleToEdit._id : "create-new") : "closed"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setArticleToEdit(null);
        }}
        articleToEdit={articleToEdit}
        onSubmit={handleSave}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(articleToDelete)}
        itemName={articleToDelete?.name}
        isLoading={isDeleting}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}