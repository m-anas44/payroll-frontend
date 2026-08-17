"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { ArticleHandler } from "@/handlers/article.handler";
import { createOperation, deleteOperation, getOperations, updateOperation } from "@/handlers/operation.handler";
import { getDepartments } from "@/handlers/department.handler";
import OperationModal from "@/components/master/OperationModal";
import { Article } from "@/types/article";
import { Department } from "@/types/department";
import { Operation } from "@/types/operation";
import { Layers, Plus, Edit2, Trash2, Search, Building2 } from "lucide-react";

export default function OperationsPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "Admin";

  const [operations, setOperations] = useState<Operation[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
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
    async (nextPage = 1, customSearch?: string) => {
      try {
        setIsLoading(true);
        setError("");

        const result = await getOperations({
          search: customSearch?.trim() || submittedSearch.trim() || undefined,
          page: nextPage,
          limit,
        });
        console.log(result)

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
    try {
      const [articlesResponse, departmentsResponse] = await Promise.all([
        ArticleHandler.getArticles({ limit: 200 }),
        getDepartments(),
      ]);

      setArticles(articlesResponse.items);
      setDepartments(departmentsResponse);
    } catch (err: any) {
      console.error("Unable to load references", err);
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

  const handleDelete = async (operation: Operation) => {
    if (!confirm(`Are you sure you want to delete operation "${operation.name}"?`)) {
      return;
    }

    try {
      await deleteOperation(operation.id);
      await loadOperations(page, submittedSearch);
    } catch (err: any) {
      setError(err.message || "Unable to delete operation.");
    }
  };

  const handleSave = async (payload: {
    name: string;
    articleId: string;
    departmentId: string;
    status?: "Active" | "Inactive";
  }) => {
    try {
      if (opToEdit) {
        await updateOperation(opToEdit.id, payload);
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
          <p className="text-xs text-slate-500 mt-1">Map operations to articles and departments.</p>
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">Loading operations...</td>
              </tr>
            ) : operations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">No operations found.</td>
              </tr>
            ) : (
              operations.map((operation) => {
                const article = articles.find((item) => item.id === operation.articleId);
                const department = departments.find((item) => item.id === operation.departmentId);

                return (
                  <tr key={operation.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-slate-400" />
                      <span>{operation.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{operation.articleName || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-purple-500" />
                      <span>{operation.departmentName || "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${operation.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                        {operation.status}
                      </span>
                    </td>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Total: {total}</span>
        <span>Page: {page}</span>
      </div>

      <OperationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOpToEdit(null);
        }}
        operationToEdit={opToEdit}
        articles={articles}
        departments={departments}
        onSubmit={handleSave}
      />
    </div>
  );
}
