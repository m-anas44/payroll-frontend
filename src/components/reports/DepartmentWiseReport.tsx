"use client";

import React, { useState, useEffect } from "react";
import { ReportHandler } from "@/handlers/report.handler";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { getCurrentMonthStr } from "@/lib/format-date";
import { Building2, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DepartmentWiseRow {
  departmentName: string;
  totalWorkers: number;
  totalProduction: number;
  totalAmount: number;
  totalNetAmount: number;
}

export default function DepartmentWiseReport() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [rows, setRows] = useState<DepartmentWiseRow[]>([]);
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
      const data = await ReportHandler.getDepartmentWiseReportFromBackend(selectedMonth);
      setRows(data || []);
    } catch (err: any) {
      console.error("Failed to fetch department-wise report:", err);
      setError("Failed to load department-wise report. Please try again.");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await ReportHandler.downloadDepartmentWiseReportPDF(selectedMonth);
      toast.success("Report PDF downloaded successfully!");
    } catch (err: any) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download report PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const totalProduction = rows.reduce((s, r) => s + (r.totalProduction || 0), 0);
  const totalAmount = rows.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalNetAmount = rows.reduce((s, r) => s + (r.totalNetAmount || 0), 0);
  const totalWorkers = rows.reduce((s, r) => s + (r.totalWorkers || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 ">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            Department-Wise Production & Payment Summary
          </h3>
          <p className="text-xs text-slate-500">
            Production and wage distribution by department for the selected month.
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
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition-colors disabled:opacity-50"
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
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 ">
              <tr>
                <th className="px-4 py-3">Department Name</th>
                <th className="px-4 py-3 text-right">Total Workers</th>
                <th className="px-4 py-3 text-right">Total Pieces</th>
                <th className="px-4 py-3 text-right">Total Paid</th>
                <th className="px-4 py-3 text-right">Avg per Worker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-400 font-medium"
                  >
                    No department data recorded for selected month.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const avgPerWorker = r.totalWorkers > 0 ? r.totalAmount / r.totalWorkers : 0;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 ">
                        {r.departmentName}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        {r.totalWorkers}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 ">
                        {formatQuantity(r.totalProduction)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 ">
                        {formatCurrency(r.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 ">
                        {formatCurrency(avgPerWorker)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300 ">
                <tr>
                  <td className="px-4 py-3 text-right text-xs uppercase">
                    Factory Total:
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono">
                    {totalWorkers}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-black">
                    {formatQuantity(totalProduction)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-emerald-600 ">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-slate-600 ">
                    {formatCurrency(totalWorkers > 0 ? totalAmount / totalWorkers : 0)}
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
