"use client";

import React, { useCallback, useEffect, useState } from "react";
import WorkerFilter from "@/components/worker/WorkerFilter";
import WorkerTable from "@/components/worker/WorkerTable";
import WorkerModal from "@/components/worker/WorkerModal";
import ImportModal from "@/components/excel/ImportModal";
import ExportButton from "@/components/excel/ExportButton";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { UserPlus, FileDown } from "lucide-react";
import { deleteWorker, getWorkers } from "@/handlers/worker.handler";
import { getDepartments } from "@/handlers/department.handler";
import { Worker } from "@/types/worker";
import { Department } from "@/types/department";

export default function WorkersPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "Admin";
  const {
    searchQuery,
    departmentFilter,
    statusFilter,
    setSearchQuery,
    setDepartmentFilter,
    setStatusFilter,
  } = useWorkerStore();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Delete modal state
  const [workerToDelete, setWorkerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDepartments = useCallback(async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      console.error("Unable to load departments", err);
    }
  }, []);

  const loadWorkers = useCallback(
    async (nextPage = 1, customSearch?: string) => {
      try {
        setIsLoading(true);
        setError("");

        const params = {
          status:
            statusFilter !== "ALL" ? statusFilter.toLowerCase() : undefined,
          departmentId:
            departmentFilter !== "ALL" ? departmentFilter : undefined,
          search: customSearch?.trim() || submittedSearch.trim() || undefined,
          page: nextPage,
          limit: pageSize,
        };

        const result = await getWorkers(params);
        setWorkers(result.items);
        setTotal(result.total);
        setPage(result.page || nextPage);
      } catch (err: any) {
        setError(err.message || "Unable to load workers.");
      } finally {
        setIsLoading(false);
      }
    },
    [departmentFilter, pageSize, statusFilter, submittedSearch]
  );

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    loadWorkers(1);
  }, [departmentFilter, statusFilter, pageSize, loadWorkers]);

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    setSubmittedSearch(trimmed);
    loadWorkers(1, trimmed);
  };

  const handleReset = () => {
    setSearchQuery("");
    setDepartmentFilter("ALL");
    setStatusFilter("ALL");
    setSubmittedSearch("");
    setPage(1);
    loadWorkers(1, "");
  };

  const handleConfirmDelete = async () => {
    if (!workerToDelete) return;

    try {
      setIsDeleting(true);
      await deleteWorker(workerToDelete.id);
      setWorkerToDelete(null);
      await loadWorkers(page, submittedSearch);
    } catch (err: any) {
      setError(err.message || "Unable to delete worker.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (nextPage: number) => {
    loadWorkers(nextPage, submittedSearch);
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
    loadWorkers(1, submittedSearch);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Worker Registration & CNIC Directory
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Maintain unique worker codes, verified CNICs, assigned departments,
            and police verification statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton type="workers" label="Export" />

          {isAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
              >
                <FileDown className="h-3.5 w-3.5 text-blue-600" />
                <span>Import</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Worker</span>
              </button>
            </>
          )}
        </div>
      </div>

      <WorkerFilter
        departments={departments}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <WorkerTable
        workers={workers}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onDelete={(id, name) => setWorkerToDelete({ id, name })}
        onEdit={(worker) => {
          setSelectedWorker(worker);
          setIsAddModalOpen(true);
        }}
        isAdmin={isAdmin}
        isLoading={isLoading}
        error={error}
      />

      <WorkerModal
        isOpen={isAddModalOpen}
        departments={departments}
        workerToEdit={selectedWorker}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedWorker(null);
        }}
        onSuccess={() => {
          setSelectedWorker(null);
          loadWorkers(page, submittedSearch);
        }}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(workerToDelete)}
        itemName={workerToDelete?.name}
        isLoading={isDeleting}
        onClose={() => setWorkerToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}