"use client";

import React from "react";
import { useWorkerStore } from "@/store/worker.store";
import { Search, RotateCcw } from "lucide-react";
import { Department } from "@/types/department";
import { WORKER_STATUS_OPTIONS } from "@/lib/constants";
import CustomSelect from "@/components/common/CustomSelect";

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

  const deptOptions = [
    { label: "All Departments", value: "ALL" },
    ...departments.map((d) => ({
      label: d.name,
      value: d._id || (d as any).id || "",
    })),
  ];

  const statusOptions = WORKER_STATUS_OPTIONS.map((opt: any) => ({
    label: opt.label,
    value: opt.value,
  }));

  return (
    <div className="mb-4 flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row">
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
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <div className="w-44">
          <CustomSelect
            options={deptOptions}
            value={departmentFilter}
            onChange={(val) => setDepartmentFilter(String(val))}
            placeholder="All Departments"
          />
        </div>

        <div className="w-36">
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(String(val))}
            placeholder="Status"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer shrink-0"
          title="Reset Filters"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
