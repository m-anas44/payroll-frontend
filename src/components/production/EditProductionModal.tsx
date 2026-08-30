"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Save, AlertCircle, Loader2, Calendar, Users, User } from "lucide-react";
import CustomSelect, { SelectOption } from "@/components/common/CustomSelect";
import { updateProductionEntry } from "@/handlers/production.handler";
import { ProductionEntry } from "@/types/production";
import { Worker } from "@/types/worker";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";

interface EditProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  entry: ProductionEntry | null;
  workers: Worker[];
  departments: Department[];
  articles: Article[];
  operations: Operation[];
}

// Safely formats ISO string (e.g., "2026-08-29T00:00:00") into "2026-08-29" for HTML input
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return new Date().toISOString().split("T")[0];
  return dateString.split("T")[0];
};

// Helper to extract ID string whether field is an object or string
const extractId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

export default function EditProductionModal({
  isOpen,
  onClose,
  onSuccess,
  entry,
  workers,
  departments,
  articles,
  operations,
}: EditProductionModalProps) {
  const [productionDate, setProductionDate] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [articleId, setArticleId] = useState("");
  const [operationId, setOperationId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  // Group task states
  const [isGroupTask, setIsGroupTask] = useState(false);
  const [totalGroupQty, setTotalGroupQty] = useState<number | "">("");
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [workerAllocations, setWorkerAllocations] = useState<{ workerId: string; workerName?: string; quantity: number }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync state whenever the modal opens or a new entry is provided
  useEffect(() => {
    if (!isOpen || !entry) return;

    setProductionDate(formatDateForInput(entry.productionDate || undefined));
    setWorkerId(extractId(entry.workerId || null));
    setDepartmentId(extractId(entry.departmentId || null));
    setArticleId(extractId(entry.articleId || null));
    setOperationId(extractId(entry.operationId || null));
    setQuantity(Number(entry.quantity) || "");
    setNotes(entry.notes || "");
    setIsGroupTask(Boolean(entry.isGroupTask || (entry.workers && entry.workers.length > 1)));
    setTotalGroupQty(entry.totalGroupQuantity || Number(entry.quantity) || "");

    if (entry.workers && entry.workers.length > 0) {
      setWorkerAllocations(
        entry.workers.map((w) => ({
          workerId: String(w.workerId),
          workerName: w.workerName,
          quantity: Number(w.quantity) || 0,
        }))
      );
    } else if (entry.workerId) {
      setWorkerAllocations([
        {
          workerId: String(entry.workerId),
          workerName: entry.workerName,
          quantity: Number(entry.quantity) || 0,
        },
      ]);
    } else {
      setWorkerAllocations([]);
    }

    setErrorMessage("");
  }, [isOpen, entry]);

  const workerOptions: SelectOption[] = useMemo(
    () => workers.map((worker) => ({ value: worker._id, label: worker.name })),
    [workers]
  );
  const departmentOptions: SelectOption[] = useMemo(
    () => departments.map((dept) => ({ value: dept._id, label: dept.name, sublabel: dept.code })),
    [departments]
  );
  const articleOptions: SelectOption[] = useMemo(
    () => articles.map((article) => ({ value: article._id, label: article.name, sublabel: article.articleNumber })),
    [articles]
  );
  const operationOptions: SelectOption[] = useMemo(
    () => operations.map((operation) => ({ value: operation._id, label: operation.name, sublabel: operation.code })),
    [operations]
  );

  const handleWorkerQtyChange = (wId: string, val: number) => {
    setWorkerAllocations((prev) =>
      prev.map((item) => (item.workerId === wId ? { ...item, quantity: val } : item))
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (!entry) return;
    if (!productionDate || !departmentId || !articleId || !operationId) {
      setErrorMessage("All required fields must be filled.");
      return;
    }

    const productionId = entry._id || (entry as any).id;
    setIsSubmitting(true);

    try {
      if (isGroupTask) {
        const tQty = Number(totalGroupQty || quantity || 0);
        if (tQty <= 0) {
          setErrorMessage("Total group quantity must be greater than zero.");
          setIsSubmitting(false);
          return;
        }

        let updatedWorkers = workerAllocations;
        if (splitMode === "equal" && workerAllocations.length > 0) {
          const perWorker = Number((tQty / workerAllocations.length).toFixed(4));
          updatedWorkers = workerAllocations.map((w) => ({ ...w, quantity: perWorker }));
        } else if (splitMode === "custom") {
          const customSum = workerAllocations.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0);
          if (Math.abs(customSum - tQty) > 0.01) {
            setErrorMessage(`Custom worker quantities sum (${customSum}) does not match total group quantity (${tQty}).`);
            setIsSubmitting(false);
            return;
          }
        }

        await updateProductionEntry(productionId, {
          productionDate,
          articleId,
          operationId,
          notes: notes || undefined,
          isGroupTask: true,
          totalGroupQuantity: tQty,
          quantity: tQty,
          splitMode,
          workers: updatedWorkers.map((w) => ({
            workerId: w.workerId,
            quantity: w.quantity,
          })),
        });
      } else {
        if (!quantity || Number(quantity) <= 0) {
          setErrorMessage("Quantity must be greater than zero.");
          setIsSubmitting(false);
          return;
        }

        await updateProductionEntry(productionId, {
          productionDate,
          quantity: Number(quantity),
          notes: notes || undefined,
          articleId,
          operationId,
        });
      }

      await onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to update production record."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {isGroupTask ? <Users className="h-5 w-5 text-blue-600" /> : <User className="h-5 w-5 text-blue-600" />}
              Edit Production Record {isGroupTask && "(Team Task)"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">Update pieces, notes, article, operation, or worker allocations.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">Production Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={productionDate}
                  onChange={(event) => setProductionDate(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <CustomSelect
              label="Department (Locked)"
              required
              options={departmentOptions}
              value={departmentId}
              onChange={() => {}}
              placeholder="Select department"
              disabled={true}
            />

            <CustomSelect
              label="Article *"
              required
              options={articleOptions}
              value={articleId}
              onChange={(value: any) => setArticleId(String(value))}
              placeholder="Select article"
              disabled={isSubmitting}
            />

            <CustomSelect
              label="Operation *"
              required
              options={operationOptions}
              value={operationId}
              onChange={(value: any) => setOperationId(String(value))}
              placeholder="Select operation"
              disabled={isSubmitting}
            />

            {!isGroupTask ? (
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">Completed Pieces (Q) *</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value === "" ? "" : Number(event.target.value))}
                  disabled={isSubmitting}
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">Total Group Pieces (Q) *</label>
                <input
                  type="number"
                  min="1"
                  value={totalGroupQty}
                  onChange={(event) => setTotalGroupQty(event.target.value === "" ? "" : Number(event.target.value))}
                  disabled={isSubmitting}
                  placeholder="Enter total group quantity"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}

            {isGroupTask && (
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">Split Mode</label>
                <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs h-[38px] items-center">
                  <button
                    type="button"
                    onClick={() => setSplitMode("equal")}
                    className={`flex-1 rounded-md py-1 text-center font-bold transition-colors ${
                      splitMode === "equal" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Equal Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode("custom")}
                    className={`flex-1 rounded-md py-1 text-center font-bold transition-colors ${
                      splitMode === "custom" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Custom Allocation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group Workers Allocations Table */}
          {isGroupTask && workerAllocations.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>Assigned Team Members ({workerAllocations.length})</span>
                {splitMode === "equal" && totalGroupQty !== "" && (
                  <span className="text-blue-600 font-semibold">
                    {(Number(totalGroupQty) / workerAllocations.length).toFixed(2)} pcs / worker
                  </span>
                )}
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {workerAllocations.map((w, idx) => (
                  <div key={w.workerId || idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800">{w.workerName || `Worker ${w.workerId}`}</span>
                    {splitMode === "equal" ? (
                      <span className="font-bold text-slate-600">
                        {totalGroupQty !== "" ? (Number(totalGroupQty) / workerAllocations.length).toFixed(2) : 0} pcs
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={w.quantity}
                        onChange={(e) => handleWorkerQtyChange(w.workerId, Number(e.target.value))}
                        className="w-24 rounded border border-slate-300 px-2 py-0.5 text-right font-bold text-xs focus:border-blue-600 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
              placeholder="Optional notes"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSubmitting ? "Updating..." : "Update Production"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}