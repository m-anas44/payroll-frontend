"use client";

import React, { useState, useEffect } from "react";
import { ReportHandler } from "@/handlers/report.handler";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { getCurrentMonthStr } from "@/lib/format-date";
import { UserCheck, Layers, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface LabourWiseRow {
  workerCode: string;
  workerName: string;
  departmentName: string;
  productionAmount: number;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
}

export default function LabourWiseReport() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [rows, setRows] = useState<LabourWiseRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth]);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReportHandler.getLabourWiseReportFromBackend(selectedMonth);
      setRows(data || []);
    } catch (err: any) {
      console.error("Failed to fetch labour-wise report:", err);
      setError("Failed to load labour-wise report. Please try again.");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await ReportHandler.downloadLabourWiseReportPDF(selectedMonth);
      toast.success("Report PDF downloaded successfully!");
    } catch (err: any) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download report PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const totalProductionSum = rows.reduce((s, r) => s + (r.productionAmount || 0), 0);
  const totalGrossSum = rows.reduce((s, r) => s + (r.grossAmount || 0), 0);
  const totalDeductionSum = rows.reduce((s, r) => s + (r.deductionAmount || 0), 0);
  const totalNetSum = rows.reduce((s, r) => s + (r.netAmount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 ">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            Labour Wise Production & Earnings Summary
          </h3>
          <p className="text-xs text-slate-500">
            Per-worker production and earnings for the selected month from payroll records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 ">
              Select Month:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={isLoading}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none font-bold disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || rows.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 ">
              <tr>
                <th className="px-4 py-3">Worker Code</th>
                <th className="px-4 py-3">Worker Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Production Amount</th>
                <th className="px-4 py-3 text-right">Gross Amount</th>
                <th className="px-4 py-3 text-right">Deductions</th>
                <th className="px-4 py-3 text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400 font-medium"
                  >
                    No production data recorded for selected month.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        {row.workerCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 ">
                      {row.workerName}
                    </td>
                    <td className="px-4 py-3 text-slate-700 ">
                      {row.departmentName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800 ">
                      {formatCurrency(row.productionAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 ">
                      {formatCurrency(row.grossAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-600">
                      {formatCurrency(row.deductionAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600 ">
                      {formatCurrency(row.netAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300 ">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase">
                    Month Total ({rows.length} workers):
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono">
                    {formatCurrency(totalProductionSum)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black">
                    {formatCurrency(totalGrossSum)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-amber-600">
                    {formatCurrency(totalDeductionSum)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-emerald-700 ">
                    {formatCurrency(totalNetSum)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
