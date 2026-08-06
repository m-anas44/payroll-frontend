"use client";

import React from "react";
import { MonthlyPayrollRecord } from "@/types/payroll";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { formatMonthYear, formatDate } from "@/lib/format-date";
import { PayrollHandler } from "@/handlers/payroll.handler";
import {
  Users,
  Layers,
  Coins,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface PayrollSummaryProps {
  record: MonthlyPayrollRecord;
}

export default function PayrollSummary({ record }: PayrollSummaryProps) {
  const handleStatusChange = (status: "Draft" | "Approved" | "Paid") => {
    PayrollHandler.updateStatus(record.id, status);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 ">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Monthly Payroll Statement
          </span>
          <h2 className="text-xl font-black text-slate-900 ">
            {formatMonthYear(record.month)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated on {formatDate(record.generatedAt)} by{" "}
            <span className="font-bold text-slate-700 ">
              {record.generatedBy}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {record.status === "Draft" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200 ">
              <Clock className="h-3.5 w-3.5" />
              Draft Status
            </span>
          )}
          {record.status === "Approved" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 ">
              <ShieldCheck className="h-3.5 w-3.5" />
              Approved Payroll
            </span>
          )}
          {record.status === "Paid" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 ">
              <CheckCircle className="h-3.5 w-3.5" />
              Disbursed / Paid
            </span>
          )}

          <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
            {record.status === "Draft" && (
              <button
                onClick={() => handleStatusChange("Approved")}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Approve Payroll
              </button>
            )}
            {record.status === "Approved" && (
              <button
                onClick={() => handleStatusChange("Paid")}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 ">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold">Total Workers</span>
          </div>
          <span className="text-lg font-bold text-slate-900 ">
            {record.totalWorkers}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 ">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Layers className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold">Total Production</span>
          </div>
          <span className="text-lg font-bold text-slate-900 ">
            {formatQuantity(record.totalQuantity)} Pcs
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 ">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold">Gross Earnings</span>
          </div>
          <span className="text-lg font-bold text-slate-900 ">
            {formatCurrency(record.totalGrossEarnings)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 ">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <Coins className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold">Total Net Payable</span>
          </div>
          <span className="text-lg font-black text-emerald-700 ">
            {formatCurrency(record.totalNetPayable)}
          </span>
        </div>
      </div>
    </div>
  );
}
