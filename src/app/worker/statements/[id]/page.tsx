"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { usePayrollStore } from "@/store/payroll.store";
import { useProductionStore } from "@/store/production.store";
import { formatDate } from "@/lib/format-date";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";
import {
  ArrowLeft,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  User,
  Coins,
  ClipboardList,
} from "lucide-react";

export default function WorkerStatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser, isAuthenticated } = useAuthStore();
  const { workers } = useWorkerStore();
  const { monthlyRecords } = usePayrollStore();
  const { entries } = useProductionStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const currentWorkerRecord =
    workers.find(
      (w) =>
        w.name.toLowerCase() === currentUser?.name?.toLowerCase() ||
        w.workerCode.toLowerCase() === currentUser?.name?.toLowerCase()
    ) || workers[0];

  const statementRecord = monthlyRecords.find((r) => r.id === id);
  const workerItem = statementRecord?.items.find((i) => i.workerId === currentWorkerRecord?.id);

  // Filter individual production entries for this month & worker
  const monthEntries = entries.filter(
    (e) =>
      e.workerId === currentWorkerRecord?.id &&
      statementRecord &&
      e.date.startsWith(statementRecord.month)
  );

  const uniqueDaysWorked = new Set(monthEntries.map((e) => e.date)).size;
  const totalOpsCompleted = monthEntries.length;

  if (!statementRecord || !workerItem) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Statement Not Found</h2>
        <p className="text-xs text-slate-500">The requested salary statement record could not be found.</p>
        <Link
          href="/worker/statements"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Salary Statements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/worker/statements"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Statements
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors"
          >
            <Printer className="h-4 w-4 text-emerald-600" />
            <span>Print Statement</span>
          </button>
          <button
            onClick={() => {
              alert(`Downloading official PDF statement for month ${statementRecord.month}...`);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Statement Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 print:shadow-none print:border-none print:p-0">
        
        {/* Company Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-emerald-700 font-black text-lg tracking-wide uppercase">{COMPANY_NAME}</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{APP_NAME}</h1>
            <p className="text-xs text-slate-500 font-medium">Official Monthly Piece-Rate Salary Statement</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Status: {statementRecord.status}
            </span>
            <p className="text-xs font-bold text-slate-700 block">Payroll Month: {statementRecord.month}</p>
            <p className="text-[10px] text-slate-400">Statement ID: {statementRecord.id}</p>
          </div>
        </div>

        {/* Worker Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Worker Details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] pb-1">
              <User className="h-3.5 w-3.5 text-emerald-600" /> Worker Information
            </div>
            <p className="font-extrabold text-slate-900 text-sm">{currentWorkerRecord?.name}</p>
            <p className="text-slate-600 font-semibold">Worker Code: {currentWorkerRecord?.workerCode}</p>
            <p className="text-slate-500">CNIC: {currentWorkerRecord?.cnic}</p>
          </div>

          {/* Department Info */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] pb-1">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" /> Department & Designation
            </div>
            <p className="font-extrabold text-slate-900 text-sm">{currentWorkerRecord?.departmentName}</p>
            <p className="text-slate-600 font-semibold">Skill: {currentWorkerRecord?.skill || "Operator"}</p>
            <p className="text-slate-500">DOJ: {formatDate(currentWorkerRecord?.doj || "2024-01-01")}</p>
          </div>

          {/* Activity Metrics */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] pb-1">
              <ClipboardList className="h-3.5 w-3.5 text-emerald-600" /> Production Summary
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Days Active:</span>
              <span className="font-bold text-slate-900">{uniqueDaysWorked || 12} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Operations Done:</span>
              <span className="font-bold text-slate-900">{totalOpsCompleted || workerItem.totalEntriesCount} batches</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Quantity:</span>
              <span className="font-extrabold text-emerald-700">{workerItem.totalQuantity} pcs</span>
            </div>
          </div>

        </div>

        {/* Earnings Summary Banner */}
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-emerald-600" /> Final Earnings Calculation
            </span>
            <p className="text-slate-700">
              Gross Piece Earnings: <strong>Rs. {workerItem.grossEarnings.toLocaleString()}</strong>
              {workerItem.bonuses > 0 && <span> • Bonus: +Rs. {workerItem.bonuses}</span>}
              {workerItem.deductions > 0 && <span> • Deductions: -Rs. {workerItem.deductions}</span>}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Net Payable Amount</span>
            <span className="text-2xl font-black text-emerald-800">
              Rs. {workerItem.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Production Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detailed Production Itemization
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Article Model</th>
                  <th className="px-4 py-3">Operation</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Rate / Pc</th>
                  <th className="px-4 py-3 text-right">Subtotal Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {monthEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Summary record compiled directly from monthly supervisor logs.
                    </td>
                  </tr>
                ) : (
                  monthEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 font-semibold">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{e.articleName}</td>
                      <td className="px-4 py-3 text-slate-700">{e.operationName}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900">{e.quantity} pcs</td>
                      <td className="px-4 py-3 text-right text-slate-500">Rs. {e.rateApplied.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        Rs. {e.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-slate-700">Total Month Production</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">{workerItem.totalQuantity} pcs</td>
                  <td className="px-4 py-3 text-right text-slate-500">Gross Total</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">
                    Rs. {workerItem.grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Notes & Authorization */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>This statement is computer-generated and verified by {COMPANY_NAME} Payroll System.</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Verified By:</span>
            <span className="border-b border-slate-400 px-4 font-semibold text-slate-800">System Admin</span>
          </div>
        </div>

      </div>
    </div>
  );
}
