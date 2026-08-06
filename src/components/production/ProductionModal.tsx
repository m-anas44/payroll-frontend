"use client";

import React, { useState } from "react";
import { ProductionEntry } from "@/types/production";
import { ProductionHandler } from "@/handlers/production.handler";
import { useWorkerStore } from "@/store/worker.store";
import { useMasterDataStore } from "@/store/masterData.store";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency } from "@/lib/currency";
import { X, ClipboardPlus, AlertCircle, Calculator } from "lucide-react";

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: ProductionEntry | null;
}

export default function ProductionModal({
  isOpen,
  onClose,
  entryToEdit,
}: ProductionModalProps) {
  const { workers } = useWorkerStore();
  const { articles, operations, departments, getApplicableRate } =
    useMasterDataStore();
  const { currentUser } = useAuthStore();

  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    workerId: "",
    departmentId: "",
    articleId: "",
    operationId: "",
    quantity: 100,
    remarks: "",
  });

  // Derive resolved rate dynamically whenever operation or date changes
  const resolvedRate =
    formData.operationId && formData.date
      ? getApplicableRate(formData.operationId, formData.date)
      : 0;

  // Filter available operations when selected article changes
  const availableOperations = operations.filter(
    (op) => !formData.articleId || op.articleId === formData.articleId
  );

  if (!isOpen) return null;

  const handleWorkerChange = (wId: string) => {
    const selectedWorker = workers.find((w) => w.id === wId);
    setFormData((prev) => ({
      ...prev,
      workerId: wId,
      departmentId: selectedWorker?.departmentId || prev.departmentId,
    }));
  };

  const handleArticleChange = (artId: string) => {
    const matchingOps = operations.filter((op) => op.articleId === artId);
    setFormData((prev) => ({
      ...prev,
      articleId: artId,
      operationId: matchingOps[0]?.id || "",
    }));
  };

  const calculatedTotal = formData.quantity * resolvedRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const worker = workers.find((w) => w.id === formData.workerId);
    const department = departments.find((d) => d.id === formData.departmentId);
    const article = articles.find((a) => a.id === formData.articleId);
    const operation = operations.find((o) => o.id === formData.operationId);

    const payload = {
      ...formData,
      workerName: worker?.name || "",
      workerCode: worker?.workerCode || "",
      departmentName: department?.name || "",
      articleName: article?.name || "",
      articleCode: article?.articleCode || "",
      operationName: operation?.name || "",
      operationCode: operation?.operationCode || "",
      rateApplied: resolvedRate,
      createdBy: currentUser.name,
    };

    if (entryToEdit) {
      const res = ProductionHandler.updateEntry(entryToEdit.id, payload);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
    } else {
      const res = ProductionHandler.addEntry(payload);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardPlus className="h-5 w-5 text-blue-600" />
            {entryToEdit ? "Edit Daily Production Record" : "Record Daily Production"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 ">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Production Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Worker *
              </label>
              <select
                required
                value={formData.workerId}
                onChange={(e) => handleWorkerChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.workerCode} - {w.name} ({w.departmentName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Article *
              </label>
              <select
                required
                value={formData.articleId}
                onChange={(e) => handleArticleChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.articleCode} - {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Operation *
              </label>
              <select
                required
                value={formData.operationId}
                onChange={(e) => setFormData({ ...formData, operationId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none "
              >
                {availableOperations.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.operationCode} - {op.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Completed Quantity (Pieces) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none font-bold"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="rounded-lg bg-slate-100 p-2.5 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    Applicable Rate
                  </span>
                  <span className="text-xs font-extrabold text-blue-600 ">
                    {formatCurrency(resolvedRate)} / pc
                  </span>
                </div>
                <Calculator className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/80 p-3.5 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-900 ">
                Calculated Total Payout:
              </span>
              <p className="text-[11px] text-blue-700 ">
                {formData.quantity} pcs × {formatCurrency(resolvedRate)}
              </p>
            </div>
            <span className="text-lg font-black text-blue-700 ">
              {formatCurrency(calculatedTotal)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks / Shift Notes
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Morning shift, Batch A1"
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
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Save Production Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
