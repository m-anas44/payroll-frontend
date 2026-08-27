"use client";

import { Worker } from "@/types/worker";
import { formatDate } from "@/lib/format-date";
import WorkerTableSkeleton from "@/skeletons/WorkerTableSkeleton";
import {
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from "lucide-react";
import Pagination from "../common/Pagination";
import { WORKER_STATUS_MAP } from "@/lib/constants";

interface WorkerTableProps {
  workers: Worker[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete: (id: string, name: string) => Promise<void> | void;
  onEdit: (worker: Worker) => void;
  isAdmin: boolean;
  isLoading: boolean;
  error?: string;
}

export default function WorkerTable({
  workers,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onEdit,
  isAdmin,
  isLoading,
  error,
}: WorkerTableProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = total === 0 ? 0 : (activePage - 1) * pageSize + 1;

  return (
    <>
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <WorkerTableSkeleton />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            {workers.length === 0 ? (
              <div className="text-sm p-14 text-center text-gray-600">
                No worker records found matching your filters.
              </div>
            ) : (
              <table className="min-w-325 w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Father/Husband</th>
                    <th className="px-3 py-3">CNIC</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Skill</th>
                    <th className="px-3 py-3">Gender</th>
                    <th className="px-3 py-3">DOJ</th>
                    <th className="px-3 py-3">DOB</th>
                    <th className="px-3 py-3">Contact</th>
                    <th className="px-3 py-3">Address</th>
                    <th className="px-3 py-3">Police Verification</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {
                    workers.map((w) => (
                      <tr key={w._id} className="transition-colors hover:bg-slate-50/80 align-top">
                        <td className="px-3 py-3 font-bold text-slate-900">{w.name}</td>
                        <td className="px-3 py-3 text-slate-700">{w.fatherHusbandName || "-"}</td>
                        <td className="px-3 py-3 font-mono text-slate-600">{w.cnic}</td>
                        <td className="px-3 py-3 text-slate-700">
                          <div className="flex items-center gap-1">
                            <span>{w.departmentName || "General"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-700">{w.skill || "-"}</td>
                        <td className="px-3 py-3 text-slate-700">{w.gender || "Other"}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-500">{formatDate(w.doj)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-500">{formatDate(w.dob)}</td>
                        <td className="px-3 py-3 text-slate-600">
                          <div className="flex items-center gap-1">
                            <span>{w.contact || "-"}</span>
                          </div>
                        </td>
                        <td className="max-w-45 px-3 py-3 text-slate-700">
                          <span className="line-clamp-2">{w.address || "-"}</span>
                        </td>
                        <td className="px-3 py-3">
                          {w.policeVerification === "Verified" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              <ShieldCheck className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                          {w.policeVerification === "Pending" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                          {w.policeVerification === "Not Verified" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              <ShieldAlert className="h-3 w-3" />
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-700 capitalize">{WORKER_STATUS_MAP[w.status]}</td>
                        <td className="px-3 py-3 text-right">
                          {isAdmin ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEdit(w)}
                                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                                title="Edit Worker"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => onDelete(w._id, w.name)}
                                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                                title="Delete Worker"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] italic text-slate-400">View Only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemLabel="workers"
          />
        </>
      )}
    </>
  );
}
