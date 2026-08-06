"use client";

import React, { useState } from "react";
import { useMasterDataStore } from "@/store/masterData.store";
import { useAuthStore } from "@/store/auth.store";
import { ArticleHandler } from "@/handlers/article.handler";
import ArticleModal from "@/components/master/ArticleModal";
import { Article } from "@/types/article";
import { Package, Plus, Edit2, Trash2, Search } from "lucide-react";

export default function ArticlesPage() {
  const { articles } = useMasterDataStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser.role === "Admin";

  const [search, setSearch] = useState("");
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredArticles = articles.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.articleCode.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete article "${name}"?`)) {
      ArticleHandler.deleteArticle(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Article / Style Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage manufactured footwear articles, styles, categories, and production seasons.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setArticleToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Article</span>
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles by code, name, or category..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Article Code</th>
              <th className="px-4 py-3">Article Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Season</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No articles found.
                </td>
              </tr>
            ) : (
              filteredArticles.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {a.articleCode}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span>{a.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.category}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{a.season || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setArticleToEdit(a);
                            setIsModalOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                          title="Edit Article"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.name)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
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
      </div>

      <ArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        articleToEdit={articleToEdit}
      />
    </div>
  );
}
