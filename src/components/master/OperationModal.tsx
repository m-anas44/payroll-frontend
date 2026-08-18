"use client";

import React, { useEffect, useState } from "react";
import { Article } from "@/types/article";
import { Department } from "@/types/department";
import { Operation } from "@/types/operation";
import { X, Layers } from "lucide-react";
import CustomSelect from "../common/CustomSelect";

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
  const [formData, setFormData] = useState<{
    name: string;
    articleId: string;
    departmentId: string;
  }>({
    name: "",
    articleId: "",
    departmentId: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (operationToEdit) {
      const selectedArticleId =
        (operationToEdit as any).articleId ||
        "";
      const selectedDepartmentId =
        (operationToEdit as any).departmentId ||
        "";
        
      setFormData({
        name: operationToEdit.name || "",
        articleId: String(selectedArticleId),
        departmentId: String(selectedDepartmentId),
      });
    } else {
      const defaultArticleId = (articles[0] as any)?._id || "";
      const defaultDeptId = (departments[0] as any)?._id || "";

      setFormData({
        name: "",
        articleId: String(defaultArticleId),
        departmentId: String(defaultDeptId),
      });
    }
  }, [isOpen, operationToEdit, articles, departments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            {operationToEdit ? "Edit Operation" : "Add Operation"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Associated Article"
                required
                options={articles.map((a: any) => ({
                  label: a.name,
                  sublabel: a.articleNumber,
                  value: String(a.id || a._id),
                }))}
                value={formData.articleId}
                onChange={(val) => setFormData({ ...formData, articleId: String(val) })}
                placeholder="Select Article..."
                searchPlaceholder="Search by name or number..."
              />
            </div>

            <div>
              <CustomSelect
                label="Department"
                required
                options={departments.map((d: any) => ({
                  label: d.name,
                  value: String(d.id || d._id),
                }))}
                value={formData.departmentId}
                onChange={(val) => setFormData({ ...formData, departmentId: String(val) })}
                placeholder="Select Department..."
                searchPlaceholder="Search department..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
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