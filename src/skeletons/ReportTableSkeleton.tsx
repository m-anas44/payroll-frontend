import React from "react";

export default function ReportTableSkeleton({
  columns = 7,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="h-11 border-b border-slate-200 bg-slate-50 flex items-center px-4 justify-between gap-3">
        {Array.from({ length: columns }).map((_, idx) => (
          <div
            key={idx}
            className="h-3.5 rounded bg-slate-200"
            style={{ width: `${Math.floor(85 / columns)}%` }}
          />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center justify-between gap-3 px-4 py-3.5 animate-pulse"
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={`h-4 rounded ${
                  cIdx === 0 ? "bg-slate-200" : "bg-slate-100"
                }`}
                style={{ width: `${Math.floor(85 / columns)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
