"use client";

import React, { useState } from "react";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { ReportHandler } from "@/handlers/report.handler";
import { Edit3, Check, X, Download, Lock } from "lucide-react";
import PayrollItemModal from "./PayrollItemModal";
import { toast } from "sonner";

import Pagination from "@/components/common/Pagination";
import { updatePayrollItem } from "@/handlers/payroll.handler";

interface PayrollTableProps {
  record: any;
  onRefresh?: () => void;
}

export default function PayrollTable({ record, onRefresh }: PayrollTableProps) {
  const isLocked = Boolean(record.isLocked);

  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [allowanceInput, setAllowanceInput] = useState<number>(0);
  const [advanceInput, setAdvanceInput] = useState<number>(0);
  const [isSavingInline, setIsSavingInline] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const startEdit = (item: any) => {
    if (isLocked) {
      toast.error("Cannot modify an approved or paid payroll.");
      return;
    }
    setEditingWorkerId(item.workerId);
    setAllowanceInput(item.allowanceAmount || 0);
    setAdvanceInput(item.advanceAmount || 0);
  };

  const saveEdit = async (item: any) => {
    try {
      setIsSavingInline(true);
      await updatePayrollItem({
        itemId: item.id || item._id,
        payrollId: record.id || record._id,
        workerId: item.workerId,
        allowanceAmount: allowanceInput,
        advanceAmount: advanceInput,
      });
      toast.success(`Adjustments updated for ${item.workerName}`);
      onRefresh?.();
      setEditingWorkerId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update adjustment.");
    } finally {
      setIsSavingInline(false);
    }
  };

  const openModal = (itemId: string) => {
    if (!itemId) {
      toast.error("Payroll item identifier missing.");
      return;
    }
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    onRefresh?.();
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  const downloadPayrollPDF = async (item: any) => {
    try {
      await ReportHandler.downloadPayrollPDF(item.id || item._id, item.workerCode);
      toast.success("Payroll PDF downloaded successfully!");
    } catch {
      toast.error("Failed to download payroll PDF");
    }
  };

  const paginatedItems = (record.items || []).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Worker Name</th>
              <th className="px-4 py-3">CNIC</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3 text-right">Production (Pcs)</th>
              <th className="px-4 py-3 text-right">Gross Earnings</th>
              <th className="px-4 py-3 text-right">Allowances</th>
              <th className="px-4 py-3 text-right">Deductions (Adv/EOBI/Other)</th>
              <th className="px-4 py-3 text-right">Net Payable</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {record.items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No production records logged for this month.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item: any) => {
                const isEditing = editingWorkerId === item.workerId;
                return (
                  <tr key={item.workerId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.workerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{item.cnic}</td>
                    <td className="px-4 py-3 text-slate-700">{item.departmentName}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                      {formatQuantity(item.totalQuantity)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(item.grossEarnings)}
                    </td>

                    {/* Allowance / Bonus Column */}
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={allowanceInput}
                          onChange={(e) => setAllowanceInput(parseFloat(e.target.value) || 0)}
                          className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-right font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      ) : (
                        formatCurrency(item.allowanceAmount)
                      )}
                    </td>

                    {/* Deductions Column */}
                    <td className="px-4 py-3 text-right font-mono text-amber-600">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[10px] text-slate-400">Adv:</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={advanceInput}
                            onChange={(e) => setAdvanceInput(parseFloat(e.target.value) || 0)}
                            className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-right font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span>{formatCurrency(item.deductions)}</span>
                          {(item.eobiAmount > 0 || item.otherDeductions > 0) && (
                            <span className="text-[10px] text-slate-400">
                              (EOBI: {item.eobiAmount}, Other: {item.otherDeductions})
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-black text-emerald-700">
                      {formatCurrency(item.netPayable)}
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(item)}
                              disabled={isSavingInline}
                              className="rounded bg-emerald-600 p-1 text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                              title="Save Inline Adjustments"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingWorkerId(null)}
                              disabled={isSavingInline}
                              className="rounded bg-slate-200 p-1 text-slate-700 hover:bg-slate-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            {isLocked ? (
                              <span title="Payroll locked against adjustments">
                                <Lock className="h-3.5 w-3.5 text-slate-300 mx-1" />
                              </span>
                            ) : (
                              <button
                                onClick={() => openModal(item.id || item._id)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
                                title="Edit Full Deductions & Allowances"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => downloadPayrollPDF(item)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 cursor-pointer"
                              title="Download Worker Payslip PDF"
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

        {record.items.length > 0 && (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={record.items.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="workers"
          />
        )}
      </div>

      <PayrollItemModal
        isOpen={isModalOpen}
        itemId={selectedItemId || undefined}
        payrollId={record.id}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItemId(null);
        }}
        onSave={handleModalSave}
      />
    </>
  );
}