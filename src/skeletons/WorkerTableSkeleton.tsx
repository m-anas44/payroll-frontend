export default function WorkerTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="h-11 border-b border-slate-200 bg-slate-50" />
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3 animate-pulse">
            <div className="h-8 w-28 rounded bg-slate-200" />
            <div className="h-8 w-24 rounded bg-slate-200" />
            <div className="h-8 w-28 rounded bg-slate-200" />
            <div className="h-8 w-16 rounded bg-slate-200" />
            <div className="h-8 w-20 rounded bg-slate-200" />
            <div className="h-8 w-24 rounded bg-slate-200" />
            <div className="h-8 w-20 rounded bg-slate-200" />
            <div className="h-8 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
