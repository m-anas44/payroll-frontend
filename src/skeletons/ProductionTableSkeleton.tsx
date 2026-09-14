import React from "react";

export default function ProductionTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* Table header skeleton */}
      <div className="h-11 border-b border-slate-200 bg-slate-50 flex items-center px-4 justify-between gap-3">
        <div className="h-3.5 w-20 rounded bg-slate-200" />
        <div className="h-3.5 w-28 rounded bg-slate-200" />
        <div className="h-3.5 w-24 rounded bg-slate-200" />
        <div className="h-3.5 w-20 rounded bg-slate-200" />
        <div className="h-3.5 w-24 rounded bg-slate-200" />
        <div className="h-3.5 w-16 rounded bg-slate-200" />
        <div className="h-3.5 w-16 rounded bg-slate-200" />
        <div className="h-3.5 w-20 rounded bg-slate-200" />
        <div className="h-3.5 w-16 rounded bg-slate-200" />
        <div className="h-3.5 w-14 rounded bg-slate-200" />
      </div>

      {/* Table rows skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 px-4 py-3.5 animate-pulse"
          >
            {/* Date */}
            <div className="h-4 w-20 rounded bg-slate-200" />

            {/* Worker Name & Avatar */}
            <div className="flex items-center gap-2 w-28">
              <div className="h-6 w-6 rounded-full bg-slate-200 shrink-0" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>

            {/* Department */}
            <div className="h-4 w-24 rounded bg-slate-100" />

            {/* Article */}
            <div className="h-4 w-20 rounded bg-slate-200" />

            {/* Operation */}
            <div className="h-4 w-24 rounded bg-slate-100" />

            {/* Quantity */}
            <div className="h-4 w-16 rounded bg-slate-200" />

            {/* Rate */}
            <div className="h-4 w-16 rounded bg-slate-100" />

            {/* Total Amount */}
            <div className="h-4 w-20 rounded bg-slate-200 font-bold" />

            {/* Status Badge */}
            <div className="h-5 w-16 rounded-full bg-slate-200" />

            {/* Actions */}
            <div className="flex items-center gap-1.5 w-14 justify-end">
              <div className="h-6 w-6 rounded bg-slate-100" />
              <div className="h-6 w-6 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
