import React from "react";

export default function PayrollSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statement summary header card skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="h-3 w-36 rounded bg-slate-200 mb-2" />
            <div className="h-6 w-48 rounded bg-slate-300 mb-2" />
            <div className="h-3 w-64 rounded bg-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-lg bg-slate-200" />
            <div className="h-8 w-28 rounded-lg bg-slate-200" />
          </div>
        </div>

        {/* 4 Stat metric boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70"
            >
              <div className="h-3 w-24 rounded bg-slate-200 mb-2" />
              <div className="h-6 w-32 rounded bg-slate-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Payroll items table skeleton */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="h-11 border-b border-slate-200 bg-slate-50 flex items-center px-4 justify-between gap-4">
          <div className="h-3.5 w-28 rounded bg-slate-200" />
          <div className="h-3.5 w-20 rounded bg-slate-200" />
          <div className="h-3.5 w-16 rounded bg-slate-200" />
          <div className="h-3.5 w-20 rounded bg-slate-200" />
          <div className="h-3.5 w-20 rounded bg-slate-200" />
          <div className="h-3.5 w-24 rounded bg-slate-200" />
          <div className="h-3.5 w-24 rounded bg-slate-200" />
          <div className="h-3.5 w-24 rounded bg-slate-200" />
          <div className="h-3.5 w-20 rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 px-4 py-3.5 animate-pulse"
            >
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="h-4 w-16 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-300 font-bold" />
              <div className="h-5 w-20 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
