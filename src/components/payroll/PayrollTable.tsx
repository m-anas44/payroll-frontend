"use client";

import React, { useState } from "react";
import { MonthlyPayrollRecord, WorkerPayrollSummary } from "@/types/payroll";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { updatePayrollAdjustment } from "@/handlers/payroll.handler";
import { ReportHandler } from "@/handlers/report.handler";
import { Edit3, Check, X, Download } from "lucide-react";
import PayrollItemModal from "./PayrollItemModal";
import { toast } from "sonner";

interface PayrollTableProps {
  record: MonthlyPayrollRecord;
  onRefresh?: () => void;
}

export default function PayrollTable({ record, onRefresh }: PayrollTableProps) {
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [bonusesInput, setBonusesInput] = useState(0);
  const [deductionsInput, setDeductionsInput] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const startEdit = (item: WorkerPayrollSummary) => {
    setEditingWorkerId(item.workerId);
    setBonusesInput(item.bonuses || 0);
    setDeductionsInput(item.deductions || 0);
  };

  const saveEdit = async (workerId: string) => {
    try {
      await updatePayrollAdjustment({
        payrollId: record.id,
        workerId: workerId,
        allowanceAmount: bonusesInput,
        advanceAmount: deductionsInput,
      });
      onRefresh?.();
      setEditingWorkerId(null);
    } catch (err) {
      console.error("Failed to update adjustment:", err);
    }
  };

  const openModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    onRefresh?.();
    setIsModalOpen(false);
  };

  const downloadPayrollPDF = async (workerId: string) => {
    try {
      // Find the payroll item for this worker
      const workerItem = record.items.find((item) => item.workerId === workerId);
      if (!workerItem) {
        toast.error("Worker payroll item not found");
        return;
      }
      
      // Download the PDF using the handler
      await ReportHandler.downloadPayrollPDF(workerItem.id, workerItem.workerCode);
      toast.success("Payroll PDF downloaded successfully!");
    } catch (err: any) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download payroll PDF");
    }
  };

  return (
    <>
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
              <th className="px-4 py-3 text-right">Actions</th>
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
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openModal(item.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                              title="View/Edit Full Details"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => downloadPayrollPDF(item.workerId)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                              title="Download Payroll PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Payroll Item Modal */}
      <PayrollItemModal
        isOpen={isModalOpen}
        itemId={selectedItemId || undefined}
        payrollId={record.id}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
}
