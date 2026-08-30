"use client";

import React from "react";
import CustomSelect, { SelectOption } from "@/components/common/CustomSelect";
import { RotateCcw, Calendar, Filter } from "lucide-react";
import { Worker } from "@/types/worker";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";

interface ProductionFilterProps {
  filters: {
    startDate: string;
    endDate: string;
    departmentId: string;
    workerId: string;
    articleId: string;
    operationId: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  workers: Worker[];
  departments: Department[];
  articles: Article[];
  operations: Operation[];
}

export default function ProductionFilter({
  filters,
  onFilterChange,
  onResetFilters,
  workers,
  departments,
  articles,
  operations,
}: ProductionFilterProps) {
  console.log("worjers i am : ", workers)
  const workerOptions: SelectOption[] = [
    { label: "All Workers", value: "ALL" },
    ...workers.map((worker) => ({
      label: worker.name,
      value: worker._id,
      sublabel: worker.cnic,
    })),
  ];

  const departmentOptions: SelectOption[] = [
    { label: "All Departments", value: "ALL" },
    ...departments.map((department) => ({
      label: department.name,
      value: department._id,
      sublabel: department.code,
    })),
  ];

  const articleOptions: SelectOption[] = [
    { label: "All Articles", value: "ALL" },
    ...articles.map((article) => ({
      label: article.name,
      value: article._id,
      sublabel: article.articleNumber,
    })),
  ];

  const operationOptions: SelectOption[] = [
    { label: "All Operations", value: "ALL" },
    ...operations.map((operation) => ({
      label: operation.name,
      value: operation._id,
      sublabel: operation.code,
    })),
  ];

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
      {/* Control Header: Date Range & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <Filter className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filter Production Entries
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 w-full sm:w-auto justify-between sm:justify-start">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange("startDate", e.target.value)}
              className="text-xs bg-transparent text-slate-900 focus:outline-none"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange("endDate", e.target.value)}
              className="text-xs bg-transparent text-slate-900 focus:outline-none"
            />
          </div>

          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Relational Entity Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <CustomSelect
          options={workerOptions}
          value={filters.workerId || "ALL"}
          onChange={(value: any) =>
            onFilterChange("workerId", value === "ALL" ? "" : String(value))
          }
          placeholder="All Workers"
          searchPlaceholder="Search workers..."
        />

        <CustomSelect
          options={departmentOptions}
          value={filters.departmentId || "ALL"}
          onChange={(value: any) =>
            onFilterChange("departmentId", value === "ALL" ? "" : String(value))
          }
          placeholder="All Departments"
          searchPlaceholder="Search departments..."
        />

        <CustomSelect
          options={articleOptions}
          value={filters.articleId || "ALL"}
          onChange={(value: any) =>
            onFilterChange("articleId", value === "ALL" ? "" : String(value))
          }
          placeholder="All Articles"
          searchPlaceholder="Search articles..."
        />

        <CustomSelect
          options={operationOptions}
          value={filters.operationId || "ALL"}
          onChange={(value: any) =>
            onFilterChange("operationId", value === "ALL" ? "" : String(value))
          }
          placeholder="All Operations"
          searchPlaceholder="Search operations..."
        />
      </div>
    </div>
  );
}