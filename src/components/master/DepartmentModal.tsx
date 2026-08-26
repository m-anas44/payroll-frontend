"use client";

import React, { useState } from "react";
import { Department } from "@/types/department";
import { createDepartment, updateDepartment } from "@/handlers/department.handler";
import { X, Building2 } from "lucide-react";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptToEdit?: Department | null;
  onSaved?: () => void;
}

export default function DepartmentModal({
  isOpen,
  onClose,
  deptToEdit,
  onSaved,
}: DepartmentModalProps) {
  const [formData, setFormData] = useState<{
    _id: string;
    code: string;
    name: string;
    description: string;
    status: "Active" | "Inactive";
  }>({
    _id: "",
    code: "",
    name: "",
    description: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = deptToEdit ? deptToEdit._id : "new";

  if (currentId !== prevId) {
    setPrevId(currentId);
    if (deptToEdit) {
      setFormData({
        _id: deptToEdit._id,
        code: deptToEdit.code,
        name: deptToEdit.name,
        description: deptToEdit.description || "",
        status: deptToEdit.status,
      });
    } else {
      setFormData({
        _id: "",
        code: "",
        name: "",
        description: "",
        status: "Active",
      });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Department name is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (deptToEdit) {
        await updateDepartment(deptToEdit._id, formData);
      } else {
        await createDepartment(formData);
      }

      onSaved?.();
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {deptToEdit ? "Edit Department" : "Add Department"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CUT-01"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Cutting Department"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of department scope..."
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
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
