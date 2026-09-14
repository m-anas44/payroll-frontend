"use client";

import React, { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { exportToCSV } from "@/lib/excel";
import { exportWorkersPdf } from "@/handlers/worker.handler";
import { getPayrollByMonth } from "@/handlers/payroll.handler";
import { getProductionEntries } from "@/handlers/production.handler";
import { getCurrentMonthStr } from "@/lib/format-date";

interface ExportButtonProps {
  type: "workers" | "production" | "payroll";
  month?: string;
  label?: string;
  filters?: {
    status?: string;
    departmentId?: string;
    policeVerification?: string;
    search?: string;
  };
}

export default function ExportButton({ type, month, label, filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      if (type === "workers") {
        await exportWorkersPdf(filters);
      } else if (type === "payroll") {
        const targetMonth = month || getCurrentMonthStr();
        const payroll = await getPayrollByMonth(targetMonth);
        const rows = (payroll?.items || []).map((item: any) => ({
          Worker_Code: item.workerCode || item.cnic || "",
          Worker_Name: item.workerName || "",
          CNIC: item.cnic || "",
          Department: item.departmentName || "",
          Production_Quantity: item.productionQuantity || item.totalQuantity || 0,
          Production_Amount: item.productionAmount || item.grossEarnings || 0,
          Allowance_Amount: item.allowanceAmount || 0,
          Advance_Amount: item.advanceAmount || 0,
          EOBI_Amount: item.eobiAmount || 0,
          Other_Deductions: item.otherDeductions || 0,
          Net_Amount: item.netAmount || item.netPayable || 0,
        }));

        exportToCSV(`payroll_${targetMonth}_export`, rows);
      } else if (type === "production") {
        const data = await getProductionEntries({ limit: 1000 });
        const rows = (data.items || []).map((p) => ({
          Worker: p.workerName || "",
          Department: p.departmentName || "",
          Article: p.articleNumber || "",
          Operation: p.operationName || "",
          Date: p.productionDate || "",
          Quantity: p.quantity || 0,
          Rate: p.appliedRate || 0,
          Total_Amount: p.totalAmount || 0,
          Status: p.status || "",
        }));

        exportToCSV("production_export", rows);
      }
    } catch {
      // Handlers already show or log errors
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
      ) : (
        <FileDown className="h-3.5 w-3.5 text-emerald-600" />
      )}
      <span>{label || (type === "workers" ? "Export PDF" : "Export CSV")}</span>
    </button>
  );
}
