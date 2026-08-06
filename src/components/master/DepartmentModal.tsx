"use client";

import React, { useState } from "react";
import { Department } from "@/types/department";
import { DepartmentHandler } from "@/handlers/department.handler";
import { X, Building2 } from "lucide-react";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptToEdit?: Department | null;
}

export default function DepartmentModal({
  isOpen,
  onClose,
  deptToEdit,
}: DepartmentModalProps) {
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    status: "Active" | "Inactive";
  }>({
    code: "",
    name: "",
    description: "",
    status: "Active",
  });

  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = deptToEdit ? deptToEdit.id : "new";

  if (currentId !== prevId) {
    setPrevId(currentId);
    if (deptToEdit) {
      setFormData({
        code: deptToEdit.code,
        name: deptToEdit.name,
        description: deptToEdit.description || "",
        status: deptToEdit.status,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        status: "Active",
      });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deptToEdit) {
      DepartmentHandler.updateDepartment(deptToEdit.id, formData);
    } else {
      DepartmentHandler.addDepartment(formData);
    }
    onClose();
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
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
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Save Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
