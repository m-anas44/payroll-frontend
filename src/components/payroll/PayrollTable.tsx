"use client";

import React, { useState } from "react";
import { MonthlyPayrollRecord, WorkerPayrollSummary } from "@/types/payroll";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { PayrollHandler } from "@/handlers/payroll.handler";
import { Edit3, Check, X } from "lucide-react";

interface PayrollTableProps {
  record: MonthlyPayrollRecord;
}

export default function PayrollTable({ record }: PayrollTableProps) {
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [bonusesInput, setBonusesInput] = useState(0);
  const [deductionsInput, setDeductionsInput] = useState(0);

  const startEdit = (item: WorkerPayrollSummary) => {
    setEditingWorkerId(item.workerId);
    setBonusesInput(item.bonuses);
    setDeductionsInput(item.deductions);
  };

  const saveEdit = (workerId: string) => {
    PayrollHandler.updateAdjustment(
      record.month,
      workerId,
      bonusesInput,
      deductionsInput
    );
    setEditingWorkerId(null);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 ">
          <tr>
            <th className="px-4 py-3">Worker Code / Name</th>
            <th className="px-4 py-3">CNIC</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3 text-right">Production (Pcs)</th>
            <th className="px-4 py-3 text-right">Gross Earnings</th>
            <th className="px-4 py-3 text-right">Bonuses</th>
            <th className="px-4 py-3 text-right">Deductions</th>
            <th className="px-4 py-3 text-right">Net Payable</th>
            <th className="px-4 py-3 text-right">Adjust</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {record.items.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-8 text-center text-slate-400 font-medium"
              >
                No production records logged for this month.
              </td>
            </tr>
          ) : (
            record.items.map((item) => {
              const isEditing = editingWorkerId === item.workerId;
              return (
                <tr
                  key={item.workerId}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                        {item.workerCode}
                      </span>
                      <span className="font-bold text-slate-900 ">
                        {item.workerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 ">
                    {item.cnic}
                  </td>
                  <td className="px-4 py-3 text-slate-700 ">
                    {item.departmentName}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 ">
                    {formatQuantity(item.totalQuantity)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 ">
                    {formatCurrency(item.grossEarnings)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-600">
                    {isEditing ? (
                      <input
                        type="number"
                        value={bonusesInput}
                        onChange={(e) =>
                          setBonusesInput(parseFloat(e.target.value) || 0)
                        }
                        className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-right font-bold focus:outline-none "
                      />
                    ) : (
                      formatCurrency(item.bonuses)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-600">
                    {isEditing ? (
                      <input
                        type="number"
                        value={deductionsInput}
                        onChange={(e) =>
                          setDeductionsInput(parseFloat(e.target.value) || 0)
                        }
                        className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-right font-bold focus:outline-none "
                      />
                    ) : (
                      formatCurrency(item.deductions)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700 ">
                    {formatCurrency(item.netPayable)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => saveEdit(item.workerId)}
                          className="rounded bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                          title="Save Adjustments"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingWorkerId(null)}
                          className="rounded bg-slate-200 p-1 text-slate-700 hover:bg-slate-300 "
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 "
                        title="Adjust Bonus/Deduction"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
