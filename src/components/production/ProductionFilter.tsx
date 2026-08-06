"use client";

import React from "react";
import { useProductionStore } from "@/store/production.store";
import { useWorkerStore } from "@/store/worker.store";
import { useMasterDataStore } from "@/store/masterData.store";
import { Search, RotateCcw, Calendar } from "lucide-react";

export default function ProductionFilter() {
  const { filters, setFilters, resetFilters } = useProductionStore();
  const { workers } = useWorkerStore();
  const { departments, articles, operations } = useMasterDataStore();

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery || ""}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            placeholder="Search production by worker, article, operation, or remarks..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 ">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => setFilters({ startDate: e.target.value })}
              className="text-xs bg-transparent text-slate-900 focus:outline-none"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => setFilters({ endDate: e.target.value })}
              className="text-xs bg-transparent text-slate-900 focus:outline-none"
            />
          </div>

          <button
            onClick={resetFilters}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 ">
        <select
          value={filters.workerId || "ALL"}
          onChange={(e) => setFilters({ workerId: e.target.value })}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none"
        >
          <option value="ALL">All Workers</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.workerCode} - {w.name}
            </option>
          ))}
        </select>

        <select
          value={filters.departmentId || "ALL"}
          onChange={(e) => setFilters({ departmentId: e.target.value })}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filters.articleId || "ALL"}
          onChange={(e) => setFilters({ articleId: e.target.value })}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none"
        >
          <option value="ALL">All Articles</option>
          {articles.map((a) => (
            <option key={a.id} value={a.id}>
              {a.articleCode} - {a.name}
            </option>
          ))}
        </select>

        <select
          value={filters.operationId || "ALL"}
          onChange={(e) => setFilters({ operationId: e.target.value })}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none"
        >
          <option value="ALL">All Operations</option>
          {operations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.operationCode} - {o.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
