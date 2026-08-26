"use client";

import React, { useEffect, useState } from "react";
import { PieceRate } from "@/types/rate";
import CustomSelect, { SelectOption } from "@/components/common/CustomSelect";
import { X, Coins, AlertCircle, Layers, Banknote } from "lucide-react";
import { createRate, updateRate } from "@/handlers/rate.handler";

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateToEdit?: PieceRate | null;
  operations: any[];
  onSuccess: () => Promise<void>;
}

export default function RateModal({
  isOpen,
  onClose,
  rateToEdit,
  operations,
  onSuccess,
}: RateModalProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    operationId: "",
    amount: "" as number | string,
  });

  const operationOptions: SelectOption[] = operations.map((op) => ({
    value: op._id,
    label: `${op.code} - ${op.name}`,
    sublabel: op.articleNumber ? `Article: ${op.articleNumber}` : undefined,
  }));

  useEffect(() => {
    if (!isOpen) return;

    if (rateToEdit) {
      setFormData({
        operationId: rateToEdit.operationId,
        amount: rateToEdit.amount ?? "",
      });
    } else {
      setFormData({
        operationId: operations[0]?._id || "",
        amount: "",
      });
    }

    setErrorMessage("");
  }, [isOpen, rateToEdit, operations]);

  if (!isOpen) return null;

  const selectedOpDetails = operations.find(
    (op) => String(op._id) === String(formData.operationId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const numericAmount = Number(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (rateToEdit) {
        const res = await updateRate(rateToEdit._id, {
          amount: numericAmount,
        });

        if (!res.success) {
          setErrorMessage(res.message || "Failed to revise piece rate.");
          return;
        }
      } else {
        const operation = operations.find(
          (item) => String(item._id) === String(formData.operationId)
        );

        if (!operation) {
          setErrorMessage("Please select a valid operation.");
          return;
        }

        const res = await createRate({
          departmentId: operation.departmentId,
          articleId: operation.articleId,
          operationId: operation._id,
          amount: numericAmount,
        });

        if (!res.success) {
          setErrorMessage(res.message || "Failed to create piece rate.");
          return;
        }
      }

      await onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {rateToEdit ? "Revise Piece Rate" : "Define Piece Rate"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {rateToEdit
                  ? "Revising will supersede the active rate automatically."
                  : "Set operation payment per completed unit."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200/60">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Operation Selector / Display */}
          {rateToEdit ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Operation
              </span>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  {selectedOpDetails
                    ? `${selectedOpDetails.code} - ${selectedOpDetails.name}`
                    : "Selected Operation"}
                </div>
                {selectedOpDetails?.articleNumber && (
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-200">
                    Art: {selectedOpDetails.articleNumber}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <CustomSelect
                label="Select Operation"
                required
                value={formData.operationId}
                options={operationOptions}
                placeholder="Choose an operation..."
                searchPlaceholder="Search operations by code or name..."
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    operationId: String(value),
                  }))
                }
              />
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Rate Amount Per Piece (PKR) <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Banknote className="h-4 w-4" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
            >
              {isSubmitting
                ? "Saving..."
                : rateToEdit
                ? "Confirm Revision"
                : "Save Rate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}