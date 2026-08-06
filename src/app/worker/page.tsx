"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { useProductionStore } from "@/store/production.store";
import { usePayrollStore } from "@/store/payroll.store";
import { formatDate } from "@/lib/format-date";
import {
  PlusCircle,
  FileText,
  ClipboardList,
  Coins,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Receipt,
  User,
  Sparkles,
} from "lucide-react";

export default function WorkerDashboardPage() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { workers } = useWorkerStore();
  const { entries } = useProductionStore();
  const { monthlyRecords } = usePayrollStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Find worker record corresponding to currentUser
  const currentWorkerRecord =
    workers.find(
      (w) =>
        w.name.toLowerCase() === currentUser?.name?.toLowerCase() ||
        w.workerCode.toLowerCase() === currentUser?.name?.toLowerCase()
    ) || workers[0];

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Worker specific production entries
  const myEntries = entries.filter((e) => e.workerId === currentWorkerRecord?.id);

  // Today's entries
  const todayEntries = myEntries.filter((e) => e.date === todayStr);
  const todayQty = todayEntries.reduce((sum, e) => sum + e.quantity, 0);
  const todayEarnings = todayEntries.reduce((sum, e) => sum + e.totalPayment, 0);

  // This month's entries
  const monthEntries = myEntries.filter((e) => e.date.startsWith(currentMonthStr));
  const monthQty = monthEntries.reduce((sum, e) => sum + e.quantity, 0);
  const monthEarnings = monthEntries.reduce((sum, e) => sum + e.totalPayment, 0);

  // Salary Statements for this worker
  const myStatements = monthlyRecords.filter((record) =>
    record.items.some((item) => item.workerId === currentWorkerRecord?.id)
  );

  const latestStatement = myStatements[0];
  const latestWorkerItem = latestStatement?.items.find(
    (i) => i.workerId === currentWorkerRecord?.id
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome & Worker Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/60 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur-xs border border-emerald-400/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Welcome Back, {currentWorkerRecord?.name || currentUser?.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Worker Production Dashboard
            </h1>
            <p className="text-xs md:text-sm text-emerald-100 max-w-xl font-medium">
              Track your daily piece production, check live estimated earnings, and view shared monthly salary statements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/worker/production"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-900 px-4 py-2.5 text-xs font-bold shadow-md hover:bg-emerald-50 transition-all transform active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-emerald-600" />
              <span>+ Add Daily Production</span>
            </Link>
            <Link
              href="/worker/statements"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 text-white px-4 py-2.5 text-xs font-bold border border-emerald-400/30 backdrop-blur-xs transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Salary Statements</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 h-32 w-32 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />
      </div>

      {/* Profile Bar Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-base">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{currentWorkerRecord?.name}</h2>
              <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5">
                {currentWorkerRecord?.workerCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentWorkerRecord?.departmentName} • {currentWorkerRecord?.skill || "Operator"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Joining Date</span>
            <span className="font-semibold text-slate-700">{formatDate(currentWorkerRecord?.doj || todayStr)}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div className="text-right">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Verification</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* Overview Cards (4 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Production */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Today&apos;s Production
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{todayQty}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1">pieces</span>
          </div>
          <p className="text-xs font-bold text-emerald-600">
            Earnings: Rs. {todayEarnings.toLocaleString()}
          </p>
        </div>

        {/* Card 2: This Month's Total Production */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              This Month&apos;s Production
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{monthQty}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1">total pcs</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {monthEntries.length} production entries logged
          </p>
        </div>

        {/* Card 3: Estimated Earnings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Est. Month Earnings
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-700">
              Rs. {monthEarnings.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Subject to monthly verification</p>
        </div>

        {/* Card 4: Salary Statements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Salary Statements
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{myStatements.length}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1">statements</span>
          </div>
          <Link
            href="/worker/statements"
            className="text-xs font-bold text-purple-600 hover:underline inline-flex items-center gap-1"
          >
            View Statements <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Recent Production Entries Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Production Logs</h3>
              <p className="text-xs text-slate-500">Your latest submitted production entries</p>
            </div>
            <Link
              href="/worker/history"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Full History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {myEntries.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No production entries recorded yet.</p>
              <Link
                href="/worker/production"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
              >
                <PlusCircle className="h-4 w-4" /> Add Today&apos;s Production Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Date</th>
                    <th className="py-2.5 font-bold">Article</th>
                    <th className="py-2.5 font-bold">Operation</th>
                    <th className="py-2.5 font-bold text-right">Qty</th>
                    <th className="py-2.5 font-bold text-right">Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myEntries.slice(0, 5).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 text-slate-500 font-medium whitespace-nowrap">
                        {formatDate(e.date)}
                      </td>
                      <td className="py-3 font-bold text-slate-900">{e.articleName}</td>
                      <td className="py-3 text-slate-700">{e.operationName}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{e.quantity} pcs</td>
                      <td className="py-3 text-right font-bold text-emerald-600">
                        Rs. {e.totalPayment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Column: Shared Salary Statement Highlight & Quick Shortcuts */}
        <div className="space-y-6">
          
          {/* Latest Salary Statement Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Latest Salary Statement
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5">
                {latestStatement?.status || "Shared"}
              </span>
            </div>

            {latestStatement && latestWorkerItem ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Month:</span>
                  <span className="font-bold text-slate-900">{latestStatement.month}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total Production:</span>
                  <span className="font-bold text-slate-900">{latestWorkerItem.totalQuantity} pcs</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-700 font-bold">Net Payable:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    Rs. {latestWorkerItem.netPayable.toLocaleString()}
                  </span>
                </div>

                <Link
                  href={`/worker/statements/${latestStatement.id}`}
                  className="mt-3 block text-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 py-2 text-xs font-bold transition-colors"
                >
                  View Full Statement Details
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No statement released yet. Statements appear when Admin runs payroll.
              </p>
            )}
          </div>

          {/* Quick Action Shortcuts */}
          <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/80 p-5 space-y-3">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Quick Worker Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/worker/production"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200 text-emerald-950 font-bold text-xs shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-emerald-600" />
                  <span>Log Today&apos;s Work</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
              </Link>

              <Link
                href="/worker/history"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200 text-emerald-950 font-bold text-xs shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Review Production Logs</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
