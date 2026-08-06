"use client";

import React, { useState } from "react";
import WorkerFilter from "@/components/worker/WorkerFilter";
import WorkerTable from "@/components/worker/WorkerTable";
import WorkerModal from "@/components/worker/WorkerModal";
import ImportModal from "@/components/excel/ImportModal";
import ExportButton from "@/components/excel/ExportButton";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { UserPlus, FileUp } from "lucide-react";

export default function WorkersPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser.role === "Admin";
  const { searchQuery, departmentFilter, statusFilter } = useWorkerStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Worker Registration & CNIC Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain unique worker codes, verified CNICs, assigned departments, and police verification statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton type="workers" label="Export Directory" />

          {isAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <FileUp className="h-3.5 w-3.5 text-blue-600" />
                <span>Import Batch</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register Worker</span>
              </button>
            </>
          )}
        </div>
      </div>

      <WorkerFilter />
      <WorkerTable key={`${searchQuery}-${departmentFilter}-${statusFilter}`} />

      <WorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
