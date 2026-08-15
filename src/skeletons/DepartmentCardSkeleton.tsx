export default function DepartmentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-20 rounded-md bg-slate-200" />
        <div className="h-6 w-16 rounded-full bg-slate-200" />
      </div>

      <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-full rounded bg-slate-100" />
      <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />

      <div className="mt-5 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <div className="h-5 w-12 rounded bg-slate-200" />
        <div className="h-5 w-12 rounded bg-slate-200" />
      </div>
    </div>
  );
}
