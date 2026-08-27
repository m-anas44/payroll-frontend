"use client";

import React, { useMemo, useRef, useState } from "react";
import { createProductionBatch } from "@/handlers/production.handler";
import CustomSelect, { SelectOption } from "@/components/common/CustomSelect";
import { X, Layers, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";
import { Worker } from "@/types/worker";

interface BatchProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  workers: Worker[];
  departments: Department[];
  articles: Article[];
  operations: Operation[];
  isLoadingData?: boolean;
}

interface WorkerRowData {
  articleId?: string;
  operationId?: string;
  quantity: number | "";
  notes: string;
}

export default function BatchProductionModal({
  isOpen,
  onClose,
  onSuccess,
  workers = [],
  departments = [],
  articles = [],
  operations = [],
  isLoadingData = false,
}: BatchProductionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split("T")[0]);
  const [commonDeptId, setCommonDeptId] = useState("");
  const [commonArticleId, setCommonArticleId] = useState("");
  const [commonOperationId, setCommonOperationId] = useState("");

  // Simple state dictionary keyed by workerId
  const [rowState, setRowState] = useState<Record<string, WorkerRowData>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Direct Options Arrays
  const departmentOptions = useMemo<SelectOption[]>(
    () => departments.map((d) => ({ value: d._id, label: d.name, sublabel: d.code })),
    [departments]
  );

  const articleOptions = useMemo<SelectOption[]>(
    () => articles.map((a) => ({ value: a._id, label: a.name, sublabel: a.articleNumber })),
    [articles]
  );

  const operationOptions = useMemo<SelectOption[]>(
    () => operations.map((o) => ({ value: o._id, label: o.name, sublabel: o.code })),
    [operations]
  );

  // Filter active department workers directly during render (No useEffect needed)
  const activeWorkers = useMemo(() => {
    if (!commonDeptId) return [];
    return workers.filter((w) => String(w.departmentId) === String(commonDeptId));
  }, [commonDeptId, workers]);

  const handleRowChange = (
    workerId: string,
    field: keyof WorkerRowData,
    value: any
  ) => {
    setRowState((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        quantity: prev[workerId]?.quantity ?? "",
        notes: prev[workerId]?.notes ?? "",
        [field]: value,
      },
    }));
  };

  const applyHeaderToAllRows = () => {
    setRowState((prev) => {
      const updated = { ...prev };
      activeWorkers.forEach((w) => {
        updated[w._id] = {
          ...updated[w._id],
          quantity: updated[w._id]?.quantity ?? "",
          notes: updated[w._id]?.notes ?? "",
          articleId: commonArticleId || updated[w._id]?.articleId,
          operationId: commonOperationId || updated[w._id]?.operationId,
        };
      });
      return updated;
    });
  };

  const handleSubmitBatch = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessCount(null);

    if (!commonDeptId) {
      setErrorMessage("Please select a department.");
      return;
    }

    const payloadItems = activeWorkers
      .map((w) => {
        const row = rowState[w._id];
        const qty = Number(row?.quantity || 0);
        return {
          workerId: w._id,
          departmentId: commonDeptId,
          articleId: row?.articleId || commonArticleId,
          operationId: row?.operationId || commonOperationId,
          quantity: qty,
          notes: row?.notes || undefined,
        };
      })
      .filter((item) => item.quantity > 0);

    if (payloadItems.length === 0) {
      setErrorMessage("Please enter quantity for at least one worker.");
      return;
    }

    const invalidItem = payloadItems.find((item) => !item.articleId || !item.operationId);
    if (invalidItem) {
      setErrorMessage("Every row with completed pcs must have an Article and Operation selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createProductionBatch({
        productionDate: commonDate,
        items: payloadItems,
      });

      const successfulCount = Number(response?.totalSuccessful) || payloadItems.length;
      setSuccessCount(successfulCount);
      onSuccess?.();
      setTimeout(() => onClose(), 1200);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to save production records."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Layers className="h-5 w-5 text-blue-600" />
              Rapid Department Production Entry
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Record production for multiple workers in one batch.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoadingData ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Production Date *
                </label>
                <input
                  type="date"
                  value={commonDate}
                  onChange={(e) => setCommonDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <CustomSelect
                  label="Select Department"
                  required
                  value={commonDeptId}
                  onChange={(val) => {
                    setCommonDeptId(String(val));
                    setRowState({}); // Reset rows clean on dept change
                  }}
                  options={departmentOptions}
                  placeholder="Select Department"
                  searchPlaceholder="Search departments..."
                />
              </div>

              <div>
                <CustomSelect
                  label="Default Article"
                  value={commonArticleId}
                  onChange={(val) => setCommonArticleId(String(val))}
                  options={articleOptions}
                  placeholder="Select Shared Article"
                  searchPlaceholder="Search articles..."
                />
              </div>

              <div>
                <div className="flex items-end gap-1.5">
                  <div className="flex-1">
                    <CustomSelect
                      label="Default Operation"
                      value={commonOperationId}
                      onChange={(val) => setCommonOperationId(String(val))}
                      options={operationOptions}
                      placeholder="Select Shared Operation"
                      searchPlaceholder="Search operations..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyHeaderToAllRows}
                    className="h-[38px] whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-100"
                  >
                    Apply All
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successCount !== null && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Successfully logged {successCount} production entries.</span>
              </div>
            )}

            <form onSubmit={handleSubmitBatch} className="mt-4 flex flex-1 flex-col overflow-y-auto">
              {!commonDeptId ? (
                <div className="py-20 text-center text-xs font-medium text-slate-400">
                  Select a department to load its workers.
                </div>
              ) : activeWorkers.length === 0 ? (
                <div className="py-20 text-center text-xs font-medium text-slate-400">
                  No workers found in this department.
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Worker</th>
                      <th className="p-2.5">Article</th>
                      <th className="p-2.5">Operation</th>
                      <th className="p-2.5 text-right">Completed Pcs</th>
                      <th className="p-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeWorkers.map((worker, index) => {
                      const currentRow = rowState[worker._id] || {};
                      const selectedArticle = currentRow.articleId ?? commonArticleId;
                      const selectedOperation = currentRow.operationId ?? commonOperationId;

                      return (
                        <tr key={worker._id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400">{index + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800">{worker.name}</td>
                          <td className="p-2.5 min-w-[180px]">
                            <CustomSelect
                              value={selectedArticle}
                              onChange={(val) => handleRowChange(worker._id, "articleId", String(val))}
                              options={articleOptions}
                              placeholder="Select Article"
                              searchPlaceholder="Search articles..."
                            />
                          </td>
                          <td className="p-2.5 min-w-[180px]">
                            <CustomSelect
                              value={selectedOperation}
                              onChange={(val) => handleRowChange(worker._id, "operationId", String(val))}
                              options={operationOptions}
                              placeholder="Select Operation"
                              searchPlaceholder="Search operations..."
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              ref={(el) => { inputRefs.current[index] = el; }}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={currentRow.quantity ?? ""}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  inputRefs.current[index + 1]?.focus();
                                }
                              }}
                              onChange={(e) =>
                                handleRowChange(
                                  worker._id,
                                  "quantity",
                                  e.target.value === "" ? "" : Number(e.target.value)
                                )
                              }
                              className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs font-bold focus:border-blue-600 focus:outline-none"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={currentRow.notes ?? ""}
                              placeholder="Optional"
                              onChange={(e) => handleRowChange(worker._id, "notes", e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-[11px]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              <div className="sticky bottom-0 mt-4 flex items-center justify-between border-t border-slate-100 bg-white pt-4">
                <div className="text-xs text-slate-500">
                  Entering production for{" "}
                  <span className="font-bold text-slate-900">
                    {Object.values(rowState).filter((r) => Number(r.quantity) > 0).length}
                  </span>{" "}
                  workers.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={activeWorkers.length === 0 || isSubmitting}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? "Saving..." : "Save All Batch Records"}</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}