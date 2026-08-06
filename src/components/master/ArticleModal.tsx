"use client";

import React, { useState } from "react";
import { Article } from "@/types/article";
import { ArticleHandler } from "@/handlers/article.handler";
import { X, Package } from "lucide-react";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
}

export default function ArticleModal({
  isOpen,
  onClose,
  articleToEdit,
}: ArticleModalProps) {
  const [formData, setFormData] = useState<{
    articleCode: string;
    name: string;
    category: string;
    season: string;
    description: string;
    status: "Active" | "Inactive";
  }>({
    articleCode: "",
    name: "",
    category: "Formal Footwear",
    season: "Summer 2026",
    description: "",
    status: "Active",
  });

  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = articleToEdit ? articleToEdit.id : "new";

  if (currentId !== prevId) {
    setPrevId(currentId);
    if (articleToEdit) {
      setFormData({
        articleCode: articleToEdit.articleCode,
        name: articleToEdit.name,
        category: articleToEdit.category,
        season: articleToEdit.season || "Summer 2026",
        description: articleToEdit.description || "",
        status: articleToEdit.status,
      });
    } else {
      setFormData({
        articleCode: "",
        name: "",
        category: "Formal Footwear",
        season: "Summer 2026",
        description: "",
        status: "Active",
      });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (articleToEdit) {
      ArticleHandler.updateArticle(articleToEdit.id, formData);
    } else {
      ArticleHandler.addArticle(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {articleToEdit ? "Edit Article" : "Add Article"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Article Code *
            </label>
            <input
              type="text"
              required
              value={formData.articleCode}
              onChange={(e) => setFormData({ ...formData, articleCode: e.target.value })}
              placeholder="e.g. ART-9001"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Article Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Classic Leather Loafer"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Formal, Athletic"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Season
              </label>
              <input
                type="text"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                placeholder="e.g. Summer 2026"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Article specifications..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 ">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Save Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
