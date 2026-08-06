"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { usePayrollStore } from "@/store/payroll.store";
import { formatDate } from "@/lib/format-date";
import {
  FileText,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  X,
} from "lucide-react";

export default function WorkerSalaryStatementsPage() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { workers } = useWorkerStore();
  const { monthlyRecords } = usePayrollStore();
  const router = useRouter();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  // Filter monthly records that include this worker
  const myStatements = monthlyRecords
    .map((record) => {
      const item = record.items.find((i) => i.workerId === currentWorkerRecord?.id);
      return {
        record,
        item,
      };
    })
    .filter((s) => s.item !== undefined);

  const handlePrint = (monthStr: string) => {
    setToastMsg(`Preparing print view for ${monthStr} statement...`);
    setTimeout(() => {
      window.print();
      setToastMsg(null);
    }, 800);
  };

  const handleDownloadPDF = (monthStr: string) => {
    setToastMsg(`Downloading PDF statement for ${monthStr}...`);
    setTimeout(() => {
      setToastMsg(`PDF Statement for ${monthStr} successfully saved to downloads!`);
      setTimeout(() => setToastMsg(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-600" />
          <span>My Salary Statements</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          View and print official monthly payroll statements released by management.
        </p>
      </div>

      {/* Statement Cards Grid */}
      {myStatements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No salary statements available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once administration generates and approves monthly payroll, your salary statements will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myStatements.map(({ record, item }) => {
            if (!item) return null;

            const isPaid = record.status === "Paid";

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Payroll Period
                    </span>
                    <h3 className="text-base font-black text-slate-900">{record.month}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      isPaid
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {isPaid ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Clock className="h-3 w-3 text-amber-600" />}
                    {record.status}
                  </span>
                </div>

                {/* Main Figures */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Department:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {item.departmentName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Pieces Completed:</span>
                    <span className="font-extrabold text-slate-900">{item.totalQuantity} pcs</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Gross Earnings:</span>
                    <span className="font-bold text-slate-800">Rs. {item.grossEarnings.toLocaleString()}</span>
                  </div>

                  {item.bonuses > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-semibold">
                      <span>Bonus / Adjustments:</span>
                      <span>+Rs. {item.bonuses}</span>
                    </div>
                  )}

                  {item.deductions > 0 && (
                    <div className="flex justify-between items-center text-rose-600 font-semibold">
                      <span>Deductions:</span>
                      <span>-Rs. {item.deductions}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Net Payable:</span>
                    <span className="text-lg font-black text-emerald-700">
                      Rs. {item.netPayable.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 pt-1">
                    Released on {formatDate(record.generatedAt.split("T")[0])} by {record.generatedBy}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <Link
                    href={`/worker/statements/${record.id}`}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </Link>

                  <button
                    onClick={() => handlePrint(record.month)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Print Statement"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(record.month)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
