import React from "react";

export default function ModalFormSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6 py-4 animate-pulse">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-9 w-full rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-9 w-full rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="h-9 w-full rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <div className="h-9 w-20 rounded-lg bg-slate-200" />
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
