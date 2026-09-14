"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Operator } from "@/types/operator";
import { Department } from "@/types/department";
import UserModal from "@/components/auth/UserModal";
import Heading from "@/components/common/Heading";
import Pagination from "@/components/common/Pagination";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { deleteOperator, getOperators } from "@/handlers/operator.handler";
import { getDepartments } from "@/handlers/department.handler";
import { UserCog, Plus, ShieldCheck, Edit2, Trash2, CheckCircle2, XCircle, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TableRowSkeleton } from "@/skeletons";

export default function UsersPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";

  const [operators, setOperators] = useState<Operator[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [operatorToEdit, setOperatorToEdit] = useState<Operator | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [operatorToDelete, setOperatorToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const [ops, depts] = await Promise.all([
        getOperators(),
        getDepartments(),
      ]);
      setOperators(ops);
      setDepartments(depts);
    } catch (err: any) {
      setError(err.message || "Failed to load operators.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmDelete = async () => {
    if (!operatorToDelete) return;
    try {
      setIsDeleting(true);
      await deleteOperator(operatorToDelete.id);
      toast.success(`Operator ${operatorToDelete.name} deleted.`);
      setOperatorToDelete(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Unable to delete operator.");
    } finally {
      setIsDeleting(false);
    }
  };

  const paginatedOperators = operators.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <Heading
        title="Operator Accounts & Access Control"
        subtitle="Manage operator credentials, assign department entry privileges, and toggle access statuses."
        actions={
          isAdmin ? (
            <button
              onClick={() => {
                setOperatorToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Operator Account</span>
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Operator Name</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Assigned Department(s)</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Account Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {isLoading ? (
              <TableRowSkeleton columns={6} rows={6} />
            ) : operators.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No operator accounts registered yet. Click &quot;Add Operator Account&quot; to create one.
                </td>
              </tr>
            ) : (
              paginatedOperators.map((op) => {
                const assignedDeptNames = op.departmentNames && op.departmentNames.length > 0
                  ? op.departmentNames.join(", ")
                  : departments
                      .filter((d) => (op.departmentIds || []).includes(d._id || (d as any).id))
                      .map((d) => d.name)
                      .join(", ") || "All / None Assigned";

                const isOpActive = op.status === "active";

                return (
                  <tr key={op.id || op._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-blue-600" />
                      <span>{op.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {op.email}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{assignedDeptNames}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 capitalize">
                        <ShieldCheck className="h-3 w-3" />
                        {op.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isOpActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isOpActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> Disabled
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setOperatorToEdit(op);
                              setIsModalOpen(true);
                            }}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
                            title="Edit Operator"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setOperatorToDelete({ id: op.id || op._id, name: op.name })}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                            title="Delete Operator"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {operators.length > 0 && (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={operators.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="operators"
          />
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOperatorToEdit(null);
        }}
        onSuccess={loadData}
        departments={departments}
        userToEdit={operatorToEdit}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(operatorToDelete)}
        itemName={operatorToDelete?.name}
        isLoading={isDeleting}
        onClose={() => setOperatorToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
