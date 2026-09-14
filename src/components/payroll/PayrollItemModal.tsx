"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { ModalFormSkeleton } from "@/skeletons";
import { toast } from "sonner";
import { getPayrollItemById, updatePayrollItem } from "@/handlers/payroll.handler";

interface PayrollItemModalProps {
  isOpen: boolean;
  itemId?: string;
  payrollId?: string;
  onClose: () => void;
  onSave?: () => void;
}

interface PayrollItemData {
  _id: string;
  payrollId: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  cnic: string;
  departmentId: string;
  departmentName: string;
  workingDays: number;
  sundayDays: number;
  totalDays: number;
  productionQuantity: number;
  productionAmount: number;
  otherEarnings: number;
  allowanceAmount: number;
  minimumWageAdjustment: number;
  grossAmount: number;
  advanceAmount: number;
  eobiAmount: number;
  otherDeductions: number;
  deductionAmount: number;
  netAmount: number;
  status: string;
}

export default function PayrollItemModal({
  isOpen,
  itemId,
  payrollId,
  onClose,
  onSave,
}: PayrollItemModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PayrollItemData | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      loadPayrollItem();
    } else {
      setFormData(null);
      setError(null);
    }
  }, [isOpen, itemId]);

  const loadPayrollItem = async () => {
    if (!itemId) return;
    setIsLoading(true);
    setError(null);
    try {
      const item = await getPayrollItemById(itemId);
      setFormData({
        ...item,
        workingDays: Number(item.workingDays || 0),
        sundayDays: Number(item.sundayDays || 0),
        totalDays: Number(item.totalDays || 0),
        productionAmount: Number(item.productionAmount || 0),
        otherEarnings: Number(item.otherEarnings || 0),
        allowanceAmount: Number(item.allowanceAmount || 0),
        minimumWageAdjustment: Number(item.minimumWageAdjustment || 0),
        grossAmount: Number(item.grossAmount || 0),
        advanceAmount: Number(item.advanceAmount || 0),
        eobiAmount: Number(item.eobiAmount || 0),
        otherDeductions: Number(item.otherDeductions || 0),
        deductionAmount: Number(item.deductionAmount || 0),
        netAmount: Number(item.netAmount || 0),
      });
    } catch (err: any) {
      console.error("Failed to load payroll item:", err);
      setError(err?.response?.data?.detail || "Failed to load payroll item details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PayrollItemData, rawValue: number) => {
    if (!formData) return;

    const value = Math.max(0, isNaN(rawValue) ? 0 : rawValue);
    const updated = { ...formData, [field]: value };

    // 1. Recalculate attendance days
    updated.totalDays = Number((updated.workingDays + updated.sundayDays).toFixed(1));

    // 2. Recalculate gross earnings
    updated.grossAmount = Number(
      (
        updated.productionAmount +
        updated.otherEarnings +
        updated.allowanceAmount +
        updated.minimumWageAdjustment
      ).toFixed(2)
    );

    // 3. Recalculate all combined deductions
    updated.deductionAmount = Number(
      (
        updated.advanceAmount +
        updated.eobiAmount +
        updated.otherDeductions
      ).toFixed(2)
    );

    // 4. Recalculate net payable
    updated.netAmount = Math.max(
      0,
      Number((updated.grossAmount - updated.deductionAmount).toFixed(2))
    );

    setFormData(updated);
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    setError(null);
    try {
      await updatePayrollItem({
        payrollItemId: formData._id || itemId,
        payrollId: payrollId || formData.payrollId,
        workerId: formData.workerId,
        workingDays: formData.workingDays,
        sundayDays: formData.sundayDays,
        otherEarnings: formData.otherEarnings,
        allowanceAmount: formData.allowanceAmount,
        minimumWageAdjustment: formData.minimumWageAdjustment,
        advanceAmount: formData.advanceAmount,
        eobiAmount: formData.eobiAmount,
        otherDeductions: formData.otherDeductions,
      });

      toast.success("Payroll adjustments and deductions saved successfully!");
      onSave?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to save payroll item adjustments.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
          <div>
            <h2 className="text-sm font-bold">Worker Payroll Item Adjustment</h2>
            {formData && (
              <p className="text-xs text-slate-300 mt-0.5">
                {formData.workerName} &bull; Code: {formData.workerCode} &bull; Dept: {formData.departmentName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {isLoading ? (
            <ModalFormSkeleton rows={3} />
          ) : error ? (
            <div className="flex items-start gap-2.5 bg-rose-50 p-4 rounded-xl text-rose-700 border border-rose-200 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : formData ? (
            <>
              {/* Attendance Inputs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Attendance & Days
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Working Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.workingDays}
                      onChange={(e) => handleInputChange("workingDays", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Sunday Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.sundayDays}
                      onChange={(e) => handleInputChange("sundayDays", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Total Days
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.totalDays}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Earnings & Allowances */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Earnings & Allowances
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Production (Pcs)
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.productionAmount}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Other Earnings
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.otherEarnings}
                      onChange={(e) => handleInputChange("otherEarnings", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Allowance
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.allowanceAmount}
                      onChange={(e) => handleInputChange("allowanceAmount", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Min Wage Adj
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumWageAdjustment}
                      onChange={(e) => handleInputChange("minimumWageAdjustment", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Deductions Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Advance Salary
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.advanceAmount}
                      onChange={(e) => handleInputChange("advanceAmount", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      EOBI Contribution
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.eobiAmount}
                      onChange={(e) => handleInputChange("eobiAmount", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Other Deductions
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.otherDeductions}
                      onChange={(e) => handleInputChange("otherDeductions", parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Calculation Summary Card */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Gross Earnings
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {formatCurrency(formData.grossAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-600 block">
                    Total Deductions
                  </span>
                  <span className="text-sm font-black text-amber-700">
                    -{formatCurrency(formData.deductionAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">
                    Net Payout
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {formatCurrency(formData.netAmount)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!isLoading && !error && formData && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save & Recalculate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}