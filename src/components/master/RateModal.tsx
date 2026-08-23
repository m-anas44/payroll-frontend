"use client";

import React, { useState, useEffect } from "react";
import { PieceRate } from "@/types/rate";
import { useMasterDataStore } from "@/store/masterData.store";
import { X, Coins, AlertCircle, History } from "lucide-react";
import { addRate, updateRate } from "@/handlers/rate.handler";

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateToEdit?: PieceRate | null;
  onSuccess: () => Promise<void>;
}

const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function RateModal({
  isOpen,
  onClose,
  rateToEdit,
  onSuccess
}: RateModalProps) {
  const { operations } = useMasterDataStore();
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    operationId: "",
    ratePerPiece: 25.0,
    effectiveFrom: getTodayFormatted(),
    notes: "",
  });

  // Sync form state safely whenever modal opens or rateToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    const todayStr = getTodayFormatted();

    if (rateToEdit) {
      setFormData({
        operationId: rateToEdit.operationId,
        ratePerPiece: rateToEdit.ratePerPiece,
        effectiveFrom: todayStr,
        notes: `Revised piece rate effective ${todayStr}`,
      });
    } else {
      setFormData({
        operationId: operations[0]?._id || "",
        ratePerPiece: 25.0,
        effectiveFrom: todayStr,
        notes: "",
      });
    }
    setErrorMessage("");
  }, [isOpen, rateToEdit, operations]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const op = operations.find((o) => o._id === formData.operationId);

    if (rateToEdit) {
      const res = await updateRate(
        rateToEdit.id,
        formData.ratePerPiece,
        formData.effectiveFrom,
        "Admin",
        formData.notes
      );
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
    } else {
      const res = await addRate(
        {
          operationId: formData.operationId,
          operationCode: op?.code,
          operationName: op?.name,
          articleId: op?.articleId,
          articleName: op?.articleNumber,
          ratePerPiece: formData.ratePerPiece,
          effectiveFrom: formData.effectiveFrom,
          notes: formData.notes,
          status: "Active",
        },
        "Admin"
      );
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            {rateToEdit ? "Revise Approved Piece Rate" : "Define New Piece Rate"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {rateToEdit && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <History className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Historical Rate Preservation Rule:</p>
              <p className="text-[11px] mt-0.5">
                Updating this rate will archive the previous rate of{" "}
                <span className="font-extrabold">Rs. {rateToEdit.ratePerPiece}</span>.
                Existing production logs will permanently retain their original rates.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Operation *
            </label>
            <select
              disabled={!!rateToEdit}
              required
              value={formData.operationId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, operationId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
            >
              {operations.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.code} - {op.name} ({op.articleNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rate Per Piece (Rs.) *
              </label>
              <input
                type="number"
                step="0.25"
                min="0.1"
                required
                value={formData.ratePerPiece}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ratePerPiece: e.target.valueAsNumber || 0,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs focus:border-blue-600 focus:bg-white focus:outline-none font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                required
                value={formData.effectiveFrom}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, effectiveFrom: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Revision Approval Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="e.g. Approved rate increase by Management Board..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Save Piece Rate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}