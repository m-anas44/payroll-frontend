"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { createOperation, deleteOperation, getOperations, updateOperation } from "@/handlers/operation.handler";
import { getDepartments } from "@/handlers/department.handler";
import OperationModal from "@/components/master/OperationModal";
import Pagination from "@/components/common/Pagination";
import { Department } from "@/types/department";
import { Operation } from "@/types/operation";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
} from "lucide-react";

export default function OperationsPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "Admin";

  const [operations, setOperations] = useState<Operation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [opToEdit, setOpToEdit] = useState<Operation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOperations = useCallback(
    async (nextPage = 1, customSearch?: string, customLimit?: number) => {
      try {
        setIsLoading(true);
        setError("");

        const effectiveLimit = customLimit ?? limit;
        const result = await getOperations({
          search: customSearch !== undefined ? customSearch.trim() : submittedSearch.trim(),
          page: nextPage,
          limit: effectiveLimit,
        });

        setOperations(result.items);
        setTotal(result.total);
        setPage(result.page || nextPage);
      } catch (err: any) {
        setError(err.message || "Unable to load operations.");
        setOperations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, submittedSearch]
  );

  const loadReferenceData = useCallback(async () => {
    const departmentsResult = await getDepartments()

    if (departmentsResult) {
      setDepartments(departmentsResult);
    } else {
      console.error("Failed to load departments:", departmentsResult);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
    loadOperations(1);
  }, [loadOperations, loadReferenceData]);

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    setSubmittedSearch(trimmed);
    loadOperations(1, trimmed);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSubmittedSearch("");
    setPage(1);
    loadOperations(1, "");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadOperations(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    loadOperations(1, undefined, newLimit);
  };

  const handleDelete = async (operation: Operation) => {
    if (!confirm(`Are you sure you want to delete operation "${operation.name}"?`)) {
      return;
    }

    try {
      await deleteOperation(operation._id);
      await loadOperations(page, submittedSearch);
    } catch (err: any) {
      setError(err.message || "Unable to delete operation.");
    }
  };

  const handleSave = async (payload: {
    name: string;
    departmentId: string;
  }) => {
    try {
      if (opToEdit) {
        await updateOperation(opToEdit._id, payload);
      } else {
        await createOperation(payload);
      }

      setIsModalOpen(false);
      setOpToEdit(null);
      await loadOperations(page, submittedSearch);
    } catch (err: any) {
      setError(err.message || "Unable to save operation.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operation Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Map operations to departments.</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setOpToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Operation</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search operation name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-700"
        >
          <Search className="h-3.5 w-3.5" />
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
  <table className="w-full text-left text-xs">
    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
      <tr>
        <th className="px-4 py-3">Operation Name</th>
        <th className="px-4 py-3">Department Name</th>
        <th className="px-4 py-3 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 font-medium">
      {isLoading ? (
        <tr>
          <td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-medium">
            Loading operations...
          </td>
        </tr>
      ) : operations.length === 0 ? (
        <tr>
          <td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-medium">
            No operations found.
          </td>
        </tr>
      ) : (
        operations.map((operation) => (
          <tr key={operation._id} className="hover:bg-slate-50/80 transition-colors">
            {/* Cell 1: Operation Name */}
            <td className="px-4 py-3 font-bold text-slate-900">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-slate-400" />
                <span className="capitalize">{operation.name}</span>
              </div>
            </td>

            {/* Cell 2: Department Name */}
            <td className="px-4 py-3 text-slate-700">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-purple-500" />
                <span className="capitalize">{operation.departmentName || "-"}</span>
              </div>
            </td>

            {/* Cell 3: Actions */}
            <td className="px-4 py-3 text-right">
              {isAdmin && (
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpToEdit(operation);
                      setIsModalOpen(true);
                    }}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                    title="Edit Operation"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(operation)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                    title="Delete Operation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      {/* Shared Pagination Component */}
      <Pagination
        currentPage={page}
        pageSize={limit}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handleLimitChange}
        itemLabel="operations"
      />

      <OperationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOpToEdit(null);
        }}
        operationToEdit={opToEdit}
        departments={departments}
        onSubmit={handleSave}
      />
    </div>
  );
}