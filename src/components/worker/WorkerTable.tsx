"use client";

import React, { useState } from "react";
import { Worker } from "@/types/worker";
import { useWorkerStore } from "@/store/worker.store";
import { useAuthStore } from "@/store/auth.store";
import { WorkerHandler } from "@/handlers/worker.handler";
import { formatDate } from "@/lib/format-date";
import WorkerModal from "./WorkerModal";
import {
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Phone,
  Building,
} from "lucide-react";

export default function WorkerTable() {
  const { workers, searchQuery, departmentFilter, statusFilter } =
    useWorkerStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser.role === "Admin";

  const [workerToEdit, setWorkerToEdit] = useState<Worker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.workerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.cnic.includes(searchQuery) ||
      w.skill.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "ALL" || w.departmentId === departmentFilter;

    const matchesStatus =
      statusFilter === "ALL" || w.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalItems = filteredWorkers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  
  // Safe clamped page to handle deletions or updates gracefully
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const paginatedWorkers = filteredWorkers.slice(startIndex, startIndex + pageSize);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove worker "${name}"?`)) {
      WorkerHandler.deleteWorker(id);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 ">
            <tr>
              <th className="px-4 py-3">Code / Name</th>
              <th className="px-4 py-3">CNIC</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Skill</th>
              <th className="px-4 py-3">DOJ</th>
              <th className="px-4 py-3">Police Verification</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedWorkers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-slate-400 font-medium"
                >
                  No worker records found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedWorkers.map((w) => (
                <tr
                  key={w.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        {w.workerCode}
                      </span>
                      <span className="font-bold text-slate-900 ">
                        {w.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 ">
                    {w.cnic}
                  </td>
                  <td className="px-4 py-3 text-slate-700 ">
                    <div className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{w.departmentName || "General"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 ">
                    {w.skill}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(w.doj)}
                  </td>
                  <td className="px-4 py-3">
                    {w.policeVerification === "Verified" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                    {w.policeVerification === "Pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {w.policeVerification === "Not Verified" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 ">
                        <ShieldAlert className="h-3 w-3" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 ">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{w.contact || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setWorkerToEdit(w);
                            setIsModalOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 "
                          title="Edit Worker"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.name)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600 "
                          title="Delete Worker"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        View Only
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900 ">
              {totalItems === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 ">
              {Math.min(startIndex + pageSize, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 ">
              {totalItems}
            </span>{" "}
            workers
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs "
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Previous
              </button>
              <span className="px-2 font-semibold">
                {activePage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage === totalPages || totalItems === 0}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <WorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workerToEdit={workerToEdit}
      />
    </>
  );
}
