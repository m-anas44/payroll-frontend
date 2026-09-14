import React from "react";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}

export default function TableSkeleton({
  columns = 5,
  rows = 5,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      {showHeader && (
        <div className="h-11 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-4">
          {Array.from({ length: columns }).map((_, idx) => (
            <div
              key={idx}
              className="h-3.5 rounded bg-slate-200 animate-pulse"
              style={{ width: `${Math.max(60, 100 / columns)}%` }}
            />
          ))}
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-center gap-4 px-4 py-3.5 animate-pulse"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-4 rounded bg-slate-100"
                style={{
                  width:
                    colIdx === 0
                      ? "25%"
                      : colIdx === columns - 1
                      ? "15%"
                      : `${Math.floor(60 / (columns - 2))}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * For use directly inside a <tbody> tag where the <table> headers are already rendered.
 */
export function TableRowSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-3.5">
              <div
                className={`h-4 rounded bg-slate-200 ${
                  colIdx === columns - 1 ? "ml-auto w-16" : "w-full max-w-[140px]"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
