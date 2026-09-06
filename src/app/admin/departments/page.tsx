"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getDepartments, deleteDepartment } from "@/handlers/department.handler";
import DepartmentModal from "@/components/master/DepartmentModal";
import DepartmentCardSkeleton from "@/skeletons/DepartmentCardSkeleton";
import Heading from "@/components/common/Heading";
import Pagination from "@/components/common/Pagination";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { Department } from "@/types/department";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin"
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deptToDelete, setDeptToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getDepartments();
      setDepartments(response);
    } catch (err: any) {
      setError(err.message || "Unable to load departments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDepartment(deptToDelete.id);
      toast.success(`Department "${deptToDelete.name}" deleted.`);
      setDeptToDelete(null);
      await loadDepartments();
    } catch (err: any) {
      toast.error(err.message || "Unable to delete department.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    await loadDepartments();
    setIsModalOpen(false);
  };

  const paginatedDepts = departments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <Heading
        title="Department Management"
        subtitle="Configure factory operational units (Cutting, Stitching, Lasting, Packing, Quality Control)."
        icon={Building2}
        actions={
          isAdmin ? (
            <button
              onClick={() => {
                setDeptToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <DepartmentCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No departments available yet.
              </div>
            ) : (
              paginatedDepts.map((dept) => {
                const safeCode = dept.code?.trim() || "NO-CODE";

                return (
                  <div
                    key={dept._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {safeCode}
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
                          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeptToDelete({ id: dept._id, name: dept.name })}
                          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-600 ml-2 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {departments.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                total={departments.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[6, 12, 24, 48]}
                itemLabel="departments"
              />
            </div>
          )}
        </>
      )}

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deptToEdit={deptToEdit}
        onSaved={handleSave}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deptToDelete)}
        itemName={deptToDelete?.name}
        isLoading={isDeleting}
        onClose={() => setDeptToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
