"use client";

import React, { useState } from "react";
import { ReportHandler } from "@/handlers/report.handler";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { getCurrentMonthStr } from "@/lib/format-date";
import { Building2 } from "lucide-react";

export default function DepartmentWiseReport() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const rows = ReportHandler.getDepartmentWiseReport(selectedMonth);

  const totalPayout = rows.reduce((s, r) => s + r.totalPayout, 0);
  const totalPieces = rows.reduce((s, r) => s + r.totalPieces, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 ">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            Departmental Production & Wage Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Total piece output and wage budget distribution grouped by production department.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 ">
            Select Month:
          </span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900 focus:outline-none font-bold"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 ">
            <tr>
              <th className="px-4 py-3">Department Name</th>
              <th className="px-4 py-3 text-right">Active Workers</th>
              <th className="px-4 py-3 text-right">Total Production (Pcs)</th>
              <th className="px-4 py-3 text-right">Total Payout</th>
              <th className="px-4 py-3 text-right">Average / Worker</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {rows.map((r) => (
              <tr
                key={r.departmentId}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 py-3 font-bold text-slate-900 ">
                  {r.departmentName}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {r.activeWorkersCount}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 ">
                  {formatQuantity(r.totalPieces)}
                </td>
                <td className="px-4 py-3 text-right font-black text-emerald-600 ">
                  {formatCurrency(r.totalPayout)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600 ">
                  {formatCurrency(r.averageEarnedPerWorker)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300 ">
            <tr>
              <td colSpan={2} className="px-4 py-3 text-right text-xs uppercase">
                Factory Total:
              </td>
              <td className="px-4 py-3 text-right text-xs font-black">
                {formatQuantity(totalPieces)} Pcs
              </td>
              <td className="px-4 py-3 text-right text-sm font-black text-emerald-600 ">
                {formatCurrency(totalPayout)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
