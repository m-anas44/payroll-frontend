"use client";

import React, { useState } from "react";
import { ReportHandler } from "@/handlers/report.handler";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { getCurrentMonthStr } from "@/lib/format-date";
import { UserCheck, Layers } from "lucide-react";

export default function LabourWiseReport() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const rows = ReportHandler.getLabourWiseReport(selectedMonth);

  const totalPiecesSum = rows.reduce((s, r) => s + r.totalPieces, 0);
  const totalEarnedSum = rows.reduce((s, r) => s + r.totalEarned, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 ">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            Labour Wise Production & Earnings Summary
          </h3>
          <p className="text-xs text-slate-500">
            Per-worker production quantity breakdown by operation and total piece earnings.
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
              <th className="px-4 py-3">Worker</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Operations Completed</th>
              <th className="px-4 py-3 text-right">Total Pieces</th>
              <th className="px-4 py-3 text-right">Total Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400 font-medium"
                >
                  No production data recorded for selected month.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.workerId}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 ">
                      {row.workerName}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {row.workerCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 ">
                    {row.departmentName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {row.operationsBreakdown.map((op, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 "
                        >
                          <span className="text-slate-700 font-semibold flex items-center gap-1">
                            <Layers className="h-3 w-3 text-slate-400" />
                            {op.operationName}
                          </span>
                          <span className="font-mono text-slate-500">
                            {formatQuantity(op.quantity)} pcs ({formatCurrency(op.earned)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 ">
                    {formatQuantity(row.totalPieces)}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-emerald-600 ">
                    {formatCurrency(row.totalEarned)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300 ">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase">
                Overall Month Total:
              </td>
              <td className="px-4 py-3 text-right text-xs font-black">
                {formatQuantity(totalPiecesSum)} Pcs
              </td>
              <td className="px-4 py-3 text-right text-sm font-black text-emerald-600 ">
                {formatCurrency(totalEarnedSum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
