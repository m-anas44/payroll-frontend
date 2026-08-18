"use client";

import React, { useState } from "react";
import { Article } from "@/types/article";
import { X, Package } from "lucide-react";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
  onSubmit: (payload: {
    articleNumber: string;
    name?: string;
    description?: string;
    status?: "Active" | "Inactive";
  }) => Promise<void> | void;
}

export default function ArticleModal({
  isOpen,
  onClose,
  articleToEdit,
  onSubmit,
}: ArticleModalProps) {
  const [formData, setFormData] = useState<{
    articleNumber: string;
    name: string;
    description: string;
    status: "Active" | "Inactive";
  }>({
    articleNumber: "",
    name: "",
    description: "",
    status: "Active",
  });

  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = articleToEdit ? articleToEdit._id : "new";

  if (currentId !== prevId) {
    setPrevId(currentId);
    if (articleToEdit) {
      setFormData({
        articleNumber: articleToEdit.articleNumber,
        name: articleToEdit.name,
        description: articleToEdit.description || "",
        status: articleToEdit.status,
      });
    } else {
      setFormData({
        articleNumber: "",
        name: "",
        description: "",
        status: "Active",
      });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Article Number *</label>
            <input
              type="text"
              required
              value={formData.articleNumber}
              onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
              placeholder="e.g. ART-9001"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Article Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Classic Leather Loafer"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Article specifications..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 ">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 ">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">Save Article</button>
          </div>
        </form>
      </div>
    </div>
  );
}
