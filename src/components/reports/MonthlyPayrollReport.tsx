"use client";

import React from "react";
import { ReportHandler } from "@/handlers/report.handler";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { formatMonthYear } from "@/lib/format-date";
import { CalendarRange } from "lucide-react";

export default function MonthlyPayrollReport() {
  const rows = ReportHandler.getMonthlyPayrollReport();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 ">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-emerald-600" />
          Historical Monthly Payroll Comparison
        </h3>
        <p className="text-xs text-slate-500">
          Historical overview of generated monthly payroll runs, worker counts, and total payouts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 ">
            <tr>
              <th className="px-4 py-3">Payroll Month</th>
              <th className="px-4 py-3 text-right">Workers Included</th>
              <th className="px-4 py-3 text-right">Total Production (Pcs)</th>
              <th className="px-4 py-3 text-right">Total Payout</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {rows.map((r) => (
              <tr
                key={r.month}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 py-3 font-bold text-slate-900 ">
                  {formatMonthYear(r.month)}
                </td>
                <td className="px-4 py-3 text-right font-mono">{r.totalWorkers}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 ">
                  {formatQuantity(r.totalProduction)}
                </td>
                <td className="px-4 py-3 text-right font-black text-emerald-600 ">
                  {formatCurrency(r.totalPayout)}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px]">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
