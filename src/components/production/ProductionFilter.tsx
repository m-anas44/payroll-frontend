"use client";

import CustomSelect, { SelectOption } from "@/components/common/CustomSelect";
import { Search, RotateCcw, Calendar } from "lucide-react";
import { Worker } from "@/types/worker";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";

interface ProductionFilterProps {
  filters: {
    searchQuery: string;
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
  const workerOptions: SelectOption[] = [
    { label: "All Workers", value: "ALL" },
    ...workers.map((worker) => ({
      label: worker.name,
      value: worker._id,
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
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            placeholder="Search production by worker, article, operation, or remarks..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
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
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
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