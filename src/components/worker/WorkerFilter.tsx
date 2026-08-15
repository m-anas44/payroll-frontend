"use client";

import React from "react";
import { useWorkerStore } from "@/store/worker.store";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Department } from "@/types/department";
import { WORKER_STATUS_OPTIONS } from "@/lib/constants";

interface WorkerFilterProps {
  departments: Department[];
  onSearch: () => void;
  onReset: () => void;
}

export default function WorkerFilter({ departments, onSearch, onReset }: WorkerFilterProps) {
  const {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
  } = useWorkerStore();

  return (
    <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row">
      <div className="flex gap-2 w-full flex-1 shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by worker name, code, CNIC, or skill..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={onSearch}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700"
        >
          <Search className="h-4 w-4 " />
          Search
        </button>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-900 focus:outline-none"
        >
          {WORKER_STATUS_OPTIONS.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Reset Filters"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
