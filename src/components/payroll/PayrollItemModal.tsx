"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { updatePayrollItem } from "@/handlers/payroll.handler";
import { toast } from "sonner";

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
  workerId,
  onClose,
  onSave,
}: PayrollItemModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PayrollItemData | null>(null);

  // Load payroll item data when modal opens
  useEffect(() => {
    if (isOpen && itemId) {
      loadPayrollItem();
    }
  }, [isOpen, itemId]);

  const loadPayrollItem = async () => {
    if (!itemId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/payroll/items/${itemId}`);
      if (!response.ok) {
        throw new Error("Failed to load payroll item");
      }
      const data = await response.json();
      setFormData(data);
    } catch (err: any) {
      console.error("Failed to load payroll item:", err);
      setError("Failed to load payroll item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: number) => {
    if (formData) {
      const updated = { ...formData, [field]: value };
      
      // Recalculate totals
      if (["workingDays", "sundayDays"].includes(field)) {
        updated.totalDays = updated.workingDays + updated.sundayDays;
      }
      
      // Recalculate gross if earnings fields change
      if ([
        "productionAmount",
        "otherEarnings",
        "allowanceAmount",
        "minimumWageAdjustment",
      ].includes(field)) {
        updated.grossAmount =
          updated.productionAmount +
          updated.otherEarnings +
          updated.allowanceAmount +
          updated.minimumWageAdjustment;
      }
      
      // Recalculate deduction if deduction fields change
      if (["advanceAmount", "eobiAmount", "otherDeductions"].includes(field)) {
        updated.deductionAmount =
          updated.advanceAmount + updated.eobiAmount + updated.otherDeductions;
      }
      
      // Recalculate net
      if ([
        "grossAmount",
        "deductionAmount",
      ].includes(field)) {
        updated.netAmount = Math.max(updated.grossAmount - updated.deductionAmount, 0);
      }

      // Recalculate net if any amount field changes
      if ([
        "productionAmount",
        "otherEarnings",
        "allowanceAmount",
        "minimumWageAdjustment",
        "advanceAmount",
        "eobiAmount",
        "otherDeductions",
      ].includes(field)) {
        const gross =
          updated.productionAmount +
          updated.otherEarnings +
          updated.allowanceAmount +
          updated.minimumWageAdjustment;
        const deduction =
          updated.advanceAmount + updated.eobiAmount + updated.otherDeductions;
        updated.netAmount = Math.max(gross - deduction, 0);
      }

      setFormData(updated);
    }
  };

  const handleSave = async () => {
    if (!formData || !payrollId) return;

    setIsSaving(true);
    setError(null);
    try {
      await updatePayrollItem({
        payrollId,
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
      toast.success("Payroll item updated successfully!");
      onSave?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to save payroll item:", err);
      setError("Failed to save payroll item. Please try again.");
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-linear-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div>
            <h2 className="text-xl font-bold">
              Payroll Details
            </h2>
            {formData && (
              <p className="text-sm text-purple-100">
                {formData.workerName} ({formData.workerCode})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-white hover:bg-purple-500 rounded-lg p-1 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : formData ? (
            <>
              {/* Worker Info (Read-Only) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Worker Name
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {formData.workerName}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Worker Code
                  </label>
                  <p className="text-sm font-mono text-slate-900">
                    {formData.workerCode}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Department
                  </label>
                  <p className="text-sm text-slate-900">
                    {formData.departmentName}
                  </p>
                </div>
              </div>

              {/* Attendance Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Attendance & Days
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Working Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.workingDays}
                      onChange={(e) =>
                        handleInputChange("workingDays", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Sunday Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.sundayDays}
                      onChange={(e) =>
                        handleInputChange("sundayDays", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Total Days (Auto)
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.totalDays}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Production Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Production
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Production Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.productionAmount}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Calculated from production records
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Other Earnings
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.otherEarnings}
                      onChange={(e) =>
                        handleInputChange("otherEarnings", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Allowances & Adjustments Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Allowances & Adjustments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Allowance Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.allowanceAmount}
                      onChange={(e) =>
                        handleInputChange("allowanceAmount", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Minimum Wage Adjustment
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumWageAdjustment}
                      onChange={(e) =>
                        handleInputChange("minimumWageAdjustment", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Gross Amount (Auto)
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.grossAmount}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Deductions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Advance Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.advanceAmount}
                      onChange={(e) =>
                        handleInputChange("advanceAmount", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      EOBI Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.eobiAmount}
                      onChange={(e) =>
                        handleInputChange("eobiAmount", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Other Deductions
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.otherDeductions}
                      onChange={(e) =>
                        handleInputChange("otherDeductions", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Total Deductions (Auto)
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.deductionAmount}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-linear-to-r from-emerald-50 to-emerald-50/50 p-4 rounded-lg border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    Gross Amount:
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatCurrency(formData.grossAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    Total Deductions:
                  </span>
                  <span className="text-lg font-black text-amber-700">
                    {formatCurrency(formData.deductionAmount)}
                  </span>
                </div>
                <div className="border-t border-emerald-200 pt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    Net Amount:
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    {formatCurrency(formData.netAmount)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!isLoading && !error && formData && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 border-t">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
