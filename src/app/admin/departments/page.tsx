"use client";

import React, { useState } from "react";
import { useMasterDataStore } from "@/store/masterData.store";
import { useAuthStore } from "@/store/auth.store";
import { DepartmentHandler } from "@/handlers/department.handler";
import DepartmentModal from "@/components/master/DepartmentModal";
import { Department } from "@/types/department";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";

export default function DepartmentsPage() {
  const { departments } = useMasterDataStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser.role === "Admin";

  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete department "${name}"?`)) {
      DepartmentHandler.deleteDepartment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Department Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure factory operational units (Cutting, Stitching, Lasting, Packing, Quality Control).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setDeptToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {dept.code}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  {dept.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                {dept.name}
              </h3>

              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {dept.description || "Operational unit for piece rate manufacturing."}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setDeptToEdit(dept);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dept.id, dept.name)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-600 ml-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deptToEdit={deptToEdit}
      />
    </div>
  );
}
