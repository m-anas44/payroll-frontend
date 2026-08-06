"use client";

import React, { useState } from "react";
import { Operation } from "@/types/operation";
import { OperationHandler } from "@/handlers/operation.handler";
import { useMasterDataStore } from "@/store/masterData.store";
import { X, Layers } from "lucide-react";

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationToEdit?: Operation | null;
}

export default function OperationModal({
  isOpen,
  onClose,
  operationToEdit,
}: OperationModalProps) {
  const { articles, departments } = useMasterDataStore();

  const [formData, setFormData] = useState<{
    operationCode: string;
    name: string;
    articleId: string;
    departmentId: string;
    description: string;
    status: "Active" | "Inactive";
  }>({
    operationCode: "",
    name: "",
    articleId: "",
    departmentId: "",
    description: "",
    status: "Active",
  });

  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = operationToEdit ? operationToEdit.id : "new";

  if (currentId !== prevId) {
    setPrevId(currentId);
    if (operationToEdit) {
      setFormData({
        operationCode: operationToEdit.operationCode,
        name: operationToEdit.name,
        articleId: operationToEdit.articleId,
        departmentId: operationToEdit.departmentId,
        description: operationToEdit.description || "",
        status: operationToEdit.status,
      });
    } else {
      setFormData({
        operationCode: "",
        name: "",
        articleId: articles[0]?.id || "",
        departmentId: departments[0]?.id || "",
        description: "",
        status: "Active",
      });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const article = articles.find((a) => a.id === formData.articleId);
    const department = departments.find((d) => d.id === formData.departmentId);

    const payload = {
      ...formData,
      articleCode: article?.articleCode || "",
      articleName: article?.name || "",
      departmentName: department?.name || "",
    };

    if (operationToEdit) {
      OperationHandler.updateOperation(operationToEdit.id, payload);
    } else {
      OperationHandler.addOperation(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            {operationToEdit ? "Edit Operation" : "Add Operation"}
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
              Operation Code *
            </label>
            <input
              type="text"
              required
              value={formData.operationCode}
              onChange={(e) => setFormData({ ...formData, operationCode: e.target.value })}
              placeholder="e.g. OP-101"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Operation Name *
            </label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Associated Article *
              </label>
              <select
                required
                value={formData.articleId}
                onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.articleCode} - {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department *
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Operation Instructions / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical procedure notes..."
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
              Save Operation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
