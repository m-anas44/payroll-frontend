"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getCurrentMonthStr, formatMonthYear } from "@/lib/format-date";
import PayrollSummary from "@/components/payroll/PayrollSummary";
import PayrollTable from "@/components/payroll/PayrollTable";
import ExportButton from "@/components/excel/ExportButton";
import { getPayrollByMonth, reconcilePayroll } from "@/handlers/payroll.handler";
import { Calculator, Calendar, Loader2, AlertCircle, RefreshCw, Lock } from "lucide-react";
import { toast } from "sonner";

import Heading from "@/components/common/Heading";
import { PayrollSkeleton } from "@/skeletons";

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayrollData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPayrollByMonth(selectedMonth);
      const isLocked = data.status === "approved" || data.status === "paid";

      const mappedRecord = {
        id: data._id || data.id,
        month: data.monthString || selectedMonth,
        status: data.status,
        isLocked,
        totalWorkers: data.totalWorkers || 0,
        totalQuantity: data.totalProductionQuantity || 0,
        totalGrossEarnings: data.totalGrossAmount || data.totalProduction || 0,
        totalDeductions: data.totalDeduction || 0,
        totalNetPayable: data.totalNetAmount || 0,
        items: (data.items || []).map((item: any) => ({
          id: item._id || item.id, // Fixed: preserve ID for edit modal
          payrollId: item.payrollId || data._id || data.id,
          workerId: item.workerId,
          workerCode: item.workerCode || item.cnic || "W-000",
          workerName: item.workerName || "Worker",
          cnic: item.cnic || "-",
          departmentId: item.departmentId,
          departmentName: item.departmentName || "-",
          workingDays: Number(item.workingDays || 0),
          sundayDays: Number(item.sundayDays || 0),
          totalDays: Number(item.totalDays || 0),
          totalQuantity: Number(item.productionQuantity || 0),
          productionAmount: Number(item.productionAmount || 0),
          otherEarnings: Number(item.otherEarnings || 0),
          allowanceAmount: Number(item.allowanceAmount || 0),
          minimumWageAdjustment: Number(item.minimumWageAdjustment || 0),
          bonuses:
            Number(item.allowanceAmount || 0) +
            Number(item.otherEarnings || 0) +
            Number(item.minimumWageAdjustment || 0),
          grossEarnings: Number(item.grossAmount || item.productionAmount || 0),
          advanceAmount: Number(item.advanceAmount || 0),
          eobiAmount: Number(item.eobiAmount || 0),
          otherDeductions: Number(item.otherDeductions || 0),
          deductions: Number(item.deductionAmount || 0),
          netPayable: Number(item.netAmount || 0),
          status: item.status,
        })),
      };
      setActiveRecord(mappedRecord);
    } catch (err: any) {
      console.error("Failed to load payroll data:", err);
      setError("Failed to load payroll records for " + formatMonthYear(selectedMonth));
      setActiveRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const handleRefresh = async () => {
    setIsReconciling(true);
    try {
      await reconcilePayroll(selectedMonth);
      await fetchPayrollData();
      toast.success("Payroll reconciled successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.response?.data?.error || "Failed to reconcile payroll.");
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Heading
        title="Monthly Piece-Rate Payroll Engine"
        subtitle="Aggregate piece-rate production logs, apply allowances/deductions, and process monthly wage disbursement statements."
        actions={
          <div className="flex items-center gap-2">
            <ExportButton type="payroll" month={selectedMonth} label="Export Payroll CSV" />

            <button
              onClick={handleRefresh}
              disabled={isReconciling || activeRecord?.isLocked}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isReconciling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>Reconcile Payroll</span>
            </button>
          </div>
        }
      />

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-700">Selected Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {activeRecord?.isLocked && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200">
            <Lock className="h-3.5 w-3.5" />
            <span>Payroll Locked ({activeRecord.status.toUpperCase()})</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <PayrollSkeleton />
      ) : activeRecord ? (
        <div className="space-y-6">
          <PayrollSummary record={activeRecord} />
          <PayrollTable record={activeRecord} onRefresh={fetchPayrollData} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Calculator className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No Production Records for {formatMonthYear(selectedMonth)}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Daily piece-rate production logs will automatically generate worker payroll summaries here once logged.
          </p>
        </div>
      )}
    </div>
  );
}