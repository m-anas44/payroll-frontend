"use client";

import React, { useState } from "react";
import { usePayrollStore } from "@/store/payroll.store";
import { getCurrentMonthStr, formatMonthYear } from "@/lib/format-date";
import PayrollSummary from "@/components/payroll/PayrollSummary";
import PayrollTable from "@/components/payroll/PayrollTable";
import GeneratePayrollModal from "@/components/payroll/GeneratePayrollModal";
import ExportButton from "@/components/excel/ExportButton";
import { Calculator, Calendar, FileText } from "lucide-react";

export default function PayrollPage() {
  const { monthlyRecords } = usePayrollStore();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeRecord = monthlyRecords.find((p) => p.month === selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly Piece-Rate Payroll Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregate piece-rate production logs, apply bonuses/deductions, and process monthly wage disbursement statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton type="payroll" month={selectedMonth} label="Export Payroll CSV" />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition-colors"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Run Monthly Payroll</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-700">
            Selected Month:
          </span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 ml-auto flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span>
            {monthlyRecords.length} Historical Payroll Runs Available
          </span>
        </div>
      </div>

      {activeRecord ? (
        <div className="space-y-6">
          <PayrollSummary record={activeRecord} />
          <PayrollTable record={activeRecord} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Calculator className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No Payroll Record for {formatMonthYear(selectedMonth)}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Click &quot;Run Monthly Payroll&quot; to aggregate daily production logs and calculate worker net payables for this month.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition-colors"
          >
            Calculate Payroll for {formatMonthYear(selectedMonth)}
          </button>
        </div>
      )}

      <GeneratePayrollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
