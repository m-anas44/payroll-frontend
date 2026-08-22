"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWorkerStore } from "@/store/worker.store";
import { useMasterDataStore } from "@/store/masterData.store";
import { useAuthStore } from "@/store/auth.store";
import { ProductionHandler } from "@/handlers/production.handler";
import { formatCurrency } from "@/lib/currency";
import { X, Layers, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface BatchProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BatchRow {
  workerId: string;
  articleId: string;
  operationId: string;
  quantity: number | "";
  remarks: string;
}

export default function BatchProductionModal({ isOpen, onClose }: BatchProductionModalProps) {
  const { workers } = useWorkerStore();
  const { articles, operations, departments, getApplicableRate } = useMasterDataStore();
  const { currentUser } = useAuthStore();

  // Common Header Context
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split("T")[0]);
  const [commonDeptId, setCommonDeptId] = useState("");
  const [commonArticleId, setCommonArticleId] = useState("");
  const [commonOperationId, setCommonOperationId] = useState("");

  const [rows, setRows] = useState<BatchRow[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Filter operations for header article selection
  const availableHeaderOps = operations.filter(
    (op) => !commonArticleId || op.articleId === commonArticleId
  );

  // When Department changes, load all workers in that department into the batch grid
  useEffect(() => {
    if (!commonDeptId) {
      setRows([]);
      return;
    }

    const deptWorkers = workers.filter((w) => w.departmentId === commonDeptId);
    setRows(
      deptWorkers.map((w) => ({
        workerId: w.id,
        articleId: commonArticleId,
        operationId: commonOperationId,
        quantity: "",
        remarks: "",
      }))
    );
  }, [commonDeptId, workers]);

  // Bulk update rows when shared Article or Operation context changes
  const applyHeaderToAllRows = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        articleId: commonArticleId || r.articleId,
        operationId: commonOperationId || r.operationId,
      }))
    );
  };

  if (!isOpen) return null;

  const handleRowChange = <K extends keyof BatchRow>(index: number, key: K, value: BatchRow[K]) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };

      // Auto-set operation if article changes on row level
      if (key === "articleId") {
        const matchingOps = operations.filter((op) => op.articleId === value);
        updated[index].operationId = matchingOps[0]?._id || "";
      }
      return updated;
    });
  };

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessCount(null);

    // Filter out rows without quantity filled
    const validRows = rows.filter((r) => Number(r.quantity) > 0);

    if (validRows.length === 0) {
      setErrorMessage("Please enter quantity for at least one worker.");
      return;
    }

    let saved = 0;
    const errors: string[] = [];

    validRows.forEach((row) => {
      const worker = workers.find((w) => w.id === row.workerId);
      const department = departments.find((d) => d._id === commonDeptId);
      const article = articles.find((a) => a._id === row.articleId);
      const operation = operations.find((o) => o._id === row.operationId);
      const rateApplied = getApplicableRate(row.operationId, commonDate);

      const payload = {
        date: commonDate,
        workerId: row.workerId,
        workerName: worker?.name || "",
        departmentId: commonDeptId,
        departmentName: department?.name || "",
        articleId: row.articleId,
        articleName: article?.name || "",
        // articleCode: article?.articleCode || "",
        operationId: row.operationId,
        operationName: operation?.name || "",
        // operationCode: operation?.operationCode || "",
        quantity: Number(row.quantity),
        rateApplied,
        remarks: row.remarks,
        createdBy: currentUser?.name ?? "default",
      };

      const res = ProductionHandler.addEntry(payload);
      if (res.success) saved++;
      else errors.push(`${worker?.name}: ${res.message}`);
    });

    if (errors.length > 0) {
      setErrorMessage(`Saved ${saved} entries with errors: ${errors.join(", ")}`);
    } else {
      setSuccessCount(saved);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Rapid Department Production Entry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set common work context once, then rapidly tab through worker quantities.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Context Selector */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Production Date *</label>
            <input
              type="date"
              value={commonDate}
              onChange={(e) => setCommonDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Department *</label>
            <select
              value={commonDeptId}
              onChange={(e) => setCommonDeptId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-blue-600 focus:outline-none"
            >
              <option value="">-- Choose Dept --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Default Article</label>
            <select
              value={commonArticleId}
              onChange={(e) => setCommonArticleId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="">-- Select Shared Article --</option>
              {articles.map((a) => (
                <option key={a._id} value={a._id}>{a.articleNumber} - {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Default Operation</label>
            <div className="flex gap-1.5">
              <select
                value={commonOperationId}
                onChange={(e) => setCommonOperationId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">-- Select Shared Operation --</option>
                {availableHeaderOps.map((op) => (
                  <option key={op._id} value={op._id}>{op.code} - {op.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyHeaderToAllRows}
                title="Apply default Article & Operation to all worker rows below"
                className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold rounded-lg hover:bg-blue-100 whitespace-nowrap"
              >
                Apply All
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successCount !== null && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Successfully logged {successCount} production entries!</span>
          </div>
        )}

        {/* Batch Worker Grid */}
        <form onSubmit={handleSubmitBatch} className="mt-4 flex-1 overflow-y-auto min-h-75">
          {!commonDeptId ? (
            <div className="py-20 text-center text-slate-400 text-xs font-medium">
              Please select a department above to load worker list for daily logging.
            </div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs font-medium">
              No workers found in this department.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 sticky top-0 font-bold uppercase text-[10px] text-slate-600 z-10">
                <tr>
                  <th className="p-2.5 border-b border-slate-200">#</th>
                  <th className="p-2.5 border-b border-slate-200">Worker</th>
                  <th className="p-2.5 border-b border-slate-200 w-44">Article</th>
                  <th className="p-2.5 border-b border-slate-200 w-44">Operation</th>
                  <th className="p-2.5 border-b border-slate-200 w-28 text-right">Completed Pcs</th>
                  <th className="p-2.5 border-b border-slate-200 w-24 text-right">Rate</th>
                  <th className="p-2.5 border-b border-slate-200 w-28 text-right">Total Payout</th>
                  <th className="p-2.5 border-b border-slate-200 w-36">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => {
                  const worker = workers.find((w) => w.id === row.workerId);
                  const rate = row.operationId ? getApplicableRate(row.operationId, commonDate) : 0;
                  const total = Number(row.quantity || 0) * rate;

                  return (
                    <tr key={row.workerId} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{worker?.name}</div>
                      </td>

                      <td className="p-2.5">
                        <select
                          value={row.articleId}
                          onChange={(e) => handleRowChange(idx, "articleId", e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-1 text-xs"
                        >
                          <option value="">Select Article</option>
                          {articles.map((a) => (
                            <option key={a._id} value={a._id}>{a.articleNumber}</option>
                          ))}
                        </select>
                      </td>

                      <td className="p-2.5">
                        <select
                          value={row.operationId}
                          onChange={(e) => handleRowChange(idx, "operationId", e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white p-1 text-xs"
                        >
                          <option value="">Select Operation</option>
                          {operations
                            .filter((op) => !row.articleId || op.articleId === row.articleId)
                            .map((op) => (
                              <option key={op._id} value={op._id}>{op.code} - {op.name}</option>
                            ))}
                        </select>
                      </td>

                      <td className="p-2.5 text-right">
                        <input
                          // ref={(el) => (inputRefs.current[idx] = el)}
                          type="number"
                          min="0"
                          placeholder="0"
                          value={row.quantity}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              inputRefs.current[idx + 1]?.focus();
                            }
                          }}
                          onChange={(e) =>
                            handleRowChange(idx, "quantity", e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="w-full text-right font-extrabold rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:bg-blue-50/50 focus:outline-none"
                        />
                      </td>

                      <td className="p-2.5 text-right font-mono text-slate-500">
                        {formatCurrency(rate)}
                      </td>

                      <td className="p-2.5 text-right font-extrabold text-emerald-600">
                        {formatCurrency(total)}
                      </td>

                      <td className="p-2.5">
                        <input
                          type="text"
                          placeholder="Optional"
                          value={row.remarks}
                          onChange={(e) => handleRowChange(idx, "remarks", e.target.value)}
                          className="w-full rounded border border-slate-200 px-2 py-1 text-[11px]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Action Bar */}
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 bg-white sticky bottom-0">
            <div className="text-xs text-slate-500">
              Entering production for{" "}
              <span className="font-bold text-slate-900">
                {rows.filter((r) => Number(r.quantity) > 0).length}
              </span>{" "}
              workers.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rows.length === 0}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Save All Batch Records</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}