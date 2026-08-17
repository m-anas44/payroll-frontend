"use client";

import React, { useState } from "react";
import { Article } from "@/types/article";
import { Department } from "@/types/department";
import { Operation } from "@/types/operation";
import { X, Layers } from "lucide-react";

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationToEdit?: Operation | null;
  articles: Article[];
  departments: Department[];
  onSubmit: (payload: {
    name: string;
    articleId: string;
    departmentId: string;
    status?: "Active" | "Inactive";
  }) => Promise<void> | void;
}

export default function OperationModal({
  isOpen,
  onClose,
  operationToEdit,
  articles,
  departments,
  onSubmit,
}: OperationModalProps) {
  console.log(articles, departments)
  const [formData, setFormData] = useState<{
    name: string;
    articleId: string;
    departmentId: string;
    status: "Active" | "Inactive";
  }>({
    name: "",
    articleId: "",
    departmentId: "",
    status: "Active",
  });

  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = operationToEdit ? operationToEdit.id : "new";

  if (currentId !== prevId) {
    setPrevId(currentId);
    if (operationToEdit) {
      setFormData({
        name: operationToEdit.name,
        articleId: operationToEdit.articleId,
        departmentId: operationToEdit.departmentId,
        status: operationToEdit.status,
      });
    } else {
      setFormData({
        name: "",
        articleId: articles[0]?.id || "",
        departmentId: departments[0]?.id || "",
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
            <Layers className="h-5 w-5 text-blue-600" />
            {operationToEdit ? "Edit Operation" : "Add Operation"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 ">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Operation Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Machine Trimming Edges"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Associated Article *</label>
              <select
                required
                value={formData.articleId}
                onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>{a.articleNumber} - {a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
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
            <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">Save Operation</button>
          </div>
        </form>
      </div>
    </div>
  );
}
