"use client";

import React, { useState } from "react";
import { PieceRate } from "@/types/rate";
import { RateHandler } from "@/handlers/rate.handler";
import { useMasterDataStore } from "@/store/masterData.store";
import { X, Coins, AlertCircle, History } from "lucide-react";

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateToEdit?: PieceRate | null;
}

export default function RateModal({
  isOpen,
  onClose,
  rateToEdit,
}: RateModalProps) {
  const { operations } = useMasterDataStore();
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    operationId: "",
    ratePerPiece: 25.0,
    effectiveFrom: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = rateToEdit ? rateToEdit.id : "new";

  if (currentId !== prevId) {
    setPrevId(currentId);
    if (rateToEdit) {
      setFormData({
        operationId: rateToEdit.operationId,
        ratePerPiece: rateToEdit.ratePerPiece,
        effectiveFrom: new Date().toISOString().split("T")[0],
        notes: `Revised piece rate effective ${new Date().toISOString().split("T")[0]}`,
      });
    } else {
      setFormData({
        operationId: operations[0]?.id || "",
        ratePerPiece: 25.0,
        effectiveFrom: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    setErrorMessage("");
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const op = operations.find((o) => o.id === formData.operationId);

    if (rateToEdit) {
      const res = RateHandler.updateRate(
        rateToEdit.id,
        formData.ratePerPiece,
        formData.effectiveFrom,
        "Admin"
      );
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
    } else {
      const res = RateHandler.addRate(
        {
          operationId: formData.operationId,
          operationCode: op?.operationCode,
          operationName: op?.name,
          articleId: op?.articleId,
          articleName: op?.articleName,
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            {rateToEdit ? "Revise Approved Piece Rate" : "Define New Piece Rate"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
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
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 ">
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
              onChange={(e) => setFormData({ ...formData, operationId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
            >
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.operationCode} - {op.name} ({op.articleName})
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
                  setFormData({ ...formData, ratePerPiece: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-bold text-emerald-700 "
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
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
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
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Approved rate increase by Management Board..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 ">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 "
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
