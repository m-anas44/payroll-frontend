"use client";

import React, { useEffect, useState } from "react";
import { getPayrolls } from "@/handlers/payroll.handler";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { formatMonthYear } from "@/lib/format-date";
import { CalendarRange, Loader2, AlertCircle } from "lucide-react";
import { MonthlyPayrollRecord } from "@/types/payroll";

export default function MonthlyPayrollReport() {
  const [records, setRecords] = useState<MonthlyPayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayrollHistory();
  }, []);

  const fetchPayrollHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPayrolls({ limit: 50 });
      const items = response?.items || (Array.isArray(response) ? response : []);
      setRecords(items);
    } catch (err: any) {
      console.error("Failed to fetch monthly payroll history:", err);
      setError("Failed to load monthly payroll history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-emerald-600" />
          Historical Monthly Payroll Comparison
        </h3>
        <p className="text-xs text-slate-500">
          Historical overview of generated monthly payroll runs, worker counts, and total payouts.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Payroll Month</th>
                <th className="px-4 py-3 text-right">Workers Included</th>
                <th className="px-4 py-3 text-right">Total Production (Pcs)</th>
                <th className="px-4 py-3 text-right">Total Payout</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                    No monthly payroll records generated yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const totalPayout = r.totalNetPayable ?? (r as any).totalPayout ?? 0;
                  const totalProd = r.totalQuantity ?? (r as any).totalProduction ?? 0;
                  return (
                    <tr key={r.id || r.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {formatMonthYear(r.month)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{r.totalWorkers ?? 0}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatQuantity(totalProd)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600">
                        {formatCurrency(totalPayout)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] capitalize">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
