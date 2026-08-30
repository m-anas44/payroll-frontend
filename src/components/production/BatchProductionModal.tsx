"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { createProductionBatch } from "@/handlers/production.handler";
import CustomSelect, { SelectOption } from "@/components/common/CustomSelect";
import { X, Layers, Save, Loader2, Users, User, SlidersHorizontal, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";
import { Worker } from "@/types/worker";
import { getLocalDate } from "@/lib/format-date";

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

type EntryMode = "individual" | "joint";
type SplitMode = "equal" | "custom";

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
  const [entryMode, setEntryMode] = useState<EntryMode>("individual");

  // Common Header State
  const [commonDate, setCommonDate] = useState(getLocalDate());
  const [commonDeptId, setCommonDeptId] = useState("");
  const [commonArticleId, setCommonArticleId] = useState("");
  const [commonOperationId, setCommonOperationId] = useState("");

  // Individual Mode State
  const [rowState, setRowState] = useState<Record<string, WorkerRowData>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Joint / Team Task Multi-Worker State
  const [selectedTeamWorkerIds, setSelectedTeamWorkerIds] = useState<string[]>([]);
  const [totalGroupQty, setTotalGroupQty] = useState<number | "">("");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [customAllocations, setCustomAllocations] = useState<Record<string, number | "">>({});
  const [groupNotes, setGroupNotes] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCommonDate(getLocalDate());
      setCommonDeptId("");
      setCommonArticleId("");
      setCommonOperationId("");
      setRowState({});
      setEntryMode("individual");
      setSelectedTeamWorkerIds([]);
      setTotalGroupQty("");
      setSplitMode("equal");
      setCustomAllocations({});
      setGroupNotes("");
    }
  }, [isOpen]);

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

  const activeWorkers = useMemo(() => {
    if (!commonDeptId) return [];
    return workers.filter((w) => String(w.departmentId) === String(commonDeptId));
  }, [commonDeptId, workers]);

  // Individual Mode Handlers
  const handleRowChange = (workerId: string, field: keyof WorkerRowData, value: any) => {
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
    if (!commonArticleId && !commonOperationId) {
      toast.error("Please select a Default Article or Operation to apply.");
      return;
    }

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

    toast.success("Applied selections to all worker rows.");
  };

  // Joint Team Worker Selection Handlers
  const toggleTeamWorker = (workerId: string) => {
    setSelectedTeamWorkerIds((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    );
  };

  const toggleSelectAllTeamWorkers = () => {
    if (selectedTeamWorkerIds.length === activeWorkers.length) {
      setSelectedTeamWorkerIds([]);
    } else {
      setSelectedTeamWorkerIds(activeWorkers.map((w) => w._id));
    }
  };

  // Calculated per-worker quantities for Team Task preview
  const equalSplitQuantity = useMemo(() => {
    if (!totalGroupQty || selectedTeamWorkerIds.length === 0) return 0;
    return Number((Number(totalGroupQty) / selectedTeamWorkerIds.length).toFixed(2));
  }, [totalGroupQty, selectedTeamWorkerIds]);

  const customAllocationsTotal = useMemo(() => {
    return Object.values(customAllocations).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
  }, [customAllocations]);

  const handleSubmitBatch = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!commonDeptId) {
      toast.error("Please select a department.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (entryMode === "individual") {
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
          toast.error("Please enter quantity for at least one worker.");
          setIsSubmitting(false);
          return;
        }

        const invalidItem = payloadItems.find((item) => !item.articleId || !item.operationId);
        if (invalidItem) {
          toast.error("Every row with completed pcs must have an Article and Operation selected.");
          setIsSubmitting(false);
          return;
        }

        const response = await createProductionBatch({
          productionDate: commonDate,
          items: payloadItems,
        });

        const successfulCount = Number(response?.totalSuccessful) || payloadItems.length;
        toast.success(`Successfully logged ${successfulCount} individual production records!`);
      } else {
        // Joint Team Task Mode
        if (!commonArticleId || !commonOperationId) {
          toast.error("Please select an Article and Operation for the Joint Team Task.");
          setIsSubmitting(false);
          return;
        }

        if (selectedTeamWorkerIds.length === 0) {
          toast.error("Please select at least one worker for the joint task.");
          setIsSubmitting(false);
          return;
        }

        const totalQty = Number(totalGroupQty || 0);
        if (totalQty <= 0) {
          toast.error("Please enter a valid total group quantity.");
          setIsSubmitting(false);
          return;
        }

        let workerInputs: { workerId: string; quantity: number }[] = [];

        if (splitMode === "equal") {
          const splitQty = Number((totalQty / selectedTeamWorkerIds.length).toFixed(4));
          workerInputs = selectedTeamWorkerIds.map((id) => ({
            workerId: id,
            quantity: splitQty,
          }));
        } else {
          // Custom allocation
          if (Math.abs(customAllocationsTotal - totalQty) > 0.01) {
            toast.error(
              `Custom allocations sum (${customAllocationsTotal} pcs) does not match total group quantity (${totalQty} pcs).`
            );
            setIsSubmitting(false);
            return;
          }

          workerInputs = selectedTeamWorkerIds.map((id) => ({
            workerId: id,
            quantity: Number(customAllocations[id] || 0),
          }));

          const zeroWorker = workerInputs.find((w) => w.quantity <= 0);
          if (zeroWorker) {
            toast.error("Every selected worker in custom allocation must have a quantity > 0.");
            setIsSubmitting(false);
            return;
          }
        }

        const teamPayloadItem = {
          departmentId: commonDeptId,
          articleId: commonArticleId,
          operationId: commonOperationId,
          isGroupTask: true,
          totalGroupQuantity: totalQty,
          splitMode: splitMode,
          workers: workerInputs,
          notes: groupNotes || undefined,
        };

        const response = await createProductionBatch({
          productionDate: commonDate,
          items: [teamPayloadItem],
        });

        toast.success(`Successfully logged joint team task for ${selectedTeamWorkerIds.length} workers!`);
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to save production records.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
              <Layers className="h-5 w-5 text-blue-600 shrink-0" />
              Department Production Entry & Worker Assignment
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Log individual production or assign joint team tasks across multiple workers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEntryMode("individual")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
                  entryMode === "individual"
                    ? "bg-white font-bold text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Individual Entry
              </button>
              <button
                type="button"
                onClick={() => setEntryMode("joint")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
                  entryMode === "joint"
                    ? "bg-white font-bold text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Joint Team Task (Multi-Worker)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmitBatch} className="flex flex-1 flex-col overflow-hidden">
            {/* Common Department & Date Filters */}
            <div className="mt-3 grid grid-cols-1 gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">Production Date *</label>
                <input
                  type="date"
                  value={commonDate}
                  onChange={(e) => setCommonDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <CustomSelect
                  label="Select Department"
                  required
                  value={commonDeptId}
                  onChange={(val) => {
                    setCommonDeptId(String(val));
                    setRowState({});
                    setSelectedTeamWorkerIds([]);
                  }}
                  options={departmentOptions}
                  placeholder="Select Department"
                  searchPlaceholder="Search departments..."
                />
              </div>

              <div>
                <CustomSelect
                  label={entryMode === "joint" ? "Article *" : "Default Article"}
                  required={entryMode === "joint"}
                  value={commonArticleId}
                  onChange={(val) => setCommonArticleId(String(val))}
                  options={articleOptions}
                  placeholder="Select Article"
                  searchPlaceholder="Search articles..."
                />
              </div>

              <div>
                <div className="flex items-end gap-1.5">
                  <div className="flex-1 min-w-0">
                    <CustomSelect
                      label={entryMode === "joint" ? "Operation *" : "Default Operation"}
                      required={entryMode === "joint"}
                      value={commonOperationId}
                      onChange={(val) => setCommonOperationId(String(val))}
                      options={operationOptions}
                      placeholder="Select Operation"
                      searchPlaceholder="Search operations..."
                    />
                  </div>
                  {entryMode === "individual" && (
                    <button
                      type="button"
                      onClick={applyHeaderToAllRows}
                      disabled={activeWorkers.length === 0}
                      className="h-[34px] shrink-0 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-[11px] font-bold text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                    >
                      Apply All
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MODE 1: INDIVIDUAL WORKER ENTRY */}
            {entryMode === "individual" ? (
              <div className="mt-3 flex-1 min-h-[300px] overflow-auto rounded-xl border border-slate-200 bg-white">
                {!commonDeptId ? (
                  <div className="flex h-full items-center justify-center p-8 text-center text-xs font-medium text-slate-400">
                    Select a department to load its workers.
                  </div>
                ) : activeWorkers.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-8 text-center text-xs font-medium text-slate-400">
                    No workers found in this department.
                  </div>
                ) : (
                  <div className="overflow-x-auto min-h-full pb-36">
                    <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                      <thead className="sticky top-0 z-20 bg-slate-100 text-[10px] font-bold uppercase text-slate-600 shadow-2xs">
                        <tr>
                          <th className="px-3 py-2 w-12">#</th>
                          <th className="px-3 py-2 min-w-[150px]">Worker</th>
                          <th className="px-3 py-2 min-w-[180px]">Article</th>
                          <th className="px-3 py-2 min-w-[180px]">Operation</th>
                          <th className="px-3 py-2 w-28 text-right">Completed Pcs</th>
                          <th className="px-3 py-2 min-w-[160px]">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeWorkers.map((worker, index) => {
                          const currentRow = rowState[worker._id] || {};
                          const selectedArticle = currentRow.articleId ?? commonArticleId;
                          const selectedOperation = currentRow.operationId ?? commonOperationId;

                          return (
                            <tr
                              key={worker._id}
                              className="relative hover:bg-slate-50/80 transition-colors"
                              style={{ zIndex: activeWorkers.length - index }}
                            >
                              <td className="px-3 py-1.5 text-slate-400">{index + 1}</td>
                              <td className="px-3 py-1.5 font-bold text-slate-800">{worker.name}</td>
                              <td className="px-3 py-1.5">
                                <CustomSelect
                                  value={selectedArticle}
                                  onChange={(val) => handleRowChange(worker._id, "articleId", String(val))}
                                  options={articleOptions}
                                  placeholder="Select Article"
                                  searchPlaceholder="Search articles..."
                                />
                              </td>
                              <td className="px-3 py-1.5">
                                <CustomSelect
                                  value={selectedOperation}
                                  onChange={(val) => handleRowChange(worker._id, "operationId", String(val))}
                                  options={operationOptions}
                                  placeholder="Select Operation"
                                  searchPlaceholder="Search operations..."
                                />
                              </td>
                              <td className="px-3 py-1.5">
                                <input
                                  ref={(el) => {
                                    inputRefs.current[index] = el;
                                  }}
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
                              <td className="px-3 py-1.5">
                                <input
                                  type="text"
                                  value={currentRow.notes ?? ""}
                                  placeholder="Optional"
                                  onChange={(e) => handleRowChange(worker._id, "notes", e.target.value)}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:border-blue-600 focus:outline-none"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              /* MODE 2: JOINT TEAM TASK MULTI-WORKER ENTRY */
              <div className="mt-3 flex-1 flex flex-col gap-3 min-h-[300px] overflow-auto">
                {/* Team Task Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-blue-50/50 p-3 shrink-0">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-700">Total Group Pieces (Q) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1000"
                      value={totalGroupQty}
                      onChange={(e) => setTotalGroupQty(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-700">Piece Allocation Mode</label>
                    <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setSplitMode("equal")}
                        className={`flex-1 rounded-md py-1 text-center font-bold transition-colors ${
                          splitMode === "equal" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Equal Split (Q / N)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitMode("custom")}
                        className={`flex-1 rounded-md py-1 text-center font-bold transition-colors ${
                          splitMode === "custom" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Custom Per-Worker
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-700">Group Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Joint team mould cleaning"
                      value={groupNotes}
                      onChange={(e) => setGroupNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Team Workers Selection & Real-Time Allocation Table */}
                <div className="flex-1 rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 shrink-0 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <button
                        type="button"
                        onClick={toggleSelectAllTeamWorkers}
                        className="flex items-center gap-1.5 text-blue-600 hover:underline"
                      >
                        {selectedTeamWorkerIds.length === activeWorkers.length && activeWorkers.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400" />
                        )}
                        <span>
                          {selectedTeamWorkerIds.length === activeWorkers.length
                            ? "Deselect All"
                            : "Select All Department Workers"}
                        </span>
                      </button>
                    </div>

                    <div className="text-slate-600 font-semibold">
                      Selected Team Members:{" "}
                      <span className="font-bold text-blue-600">{selectedTeamWorkerIds.length}</span> /{" "}
                      {activeWorkers.length}
                    </div>
                  </div>

                  {!commonDeptId ? (
                    <div className="flex flex-1 items-center justify-center p-8 text-center text-xs text-slate-400">
                      Select a department above to display available workers.
                    </div>
                  ) : activeWorkers.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center p-8 text-center text-xs text-slate-400">
                      No active workers found in this department.
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] font-bold uppercase text-slate-600">
                          <tr>
                            <th className="px-4 py-2 w-10">Assign</th>
                            <th className="px-4 py-2">Worker Name</th>
                            <th className="px-4 py-2">Worker CNIC</th>
                            <th className="px-4 py-2 text-right">Calculated Piece Allocation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeWorkers.map((worker) => {
                            const isSelected = selectedTeamWorkerIds.includes(worker._id);
                            return (
                              <tr
                                key={worker._id}
                                onClick={() => toggleTeamWorker(worker._id)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? "bg-blue-50/40" : "hover:bg-slate-50"
                                }`}
                              >
                                <td className="px-4 py-2.5">
                                  {isSelected ? (
                                    <CheckSquare className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-slate-300" />
                                  )}
                                </td>
                                <td className="px-4 py-2.5 font-bold text-slate-800">{worker.name}</td>
                                <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                                  {worker.cnic}
                                </td>
                                <td className="px-4 py-2.5 text-right font-bold">
                                  {isSelected ? (
                                    splitMode === "equal" ? (
                                      <span className="text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                                        {equalSplitQuantity} pcs
                                      </span>
                                    ) : (
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={customAllocations[worker._id] ?? ""}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? "" : Number(e.target.value);
                                          setCustomAllocations((prev) => ({
                                            ...prev,
                                            [worker._id]: val,
                                          }));
                                        }}
                                        className="w-24 rounded border border-slate-300 px-2 py-0.5 text-right text-xs font-bold focus:border-blue-600 focus:outline-none"
                                      />
                                    )
                                  ) : (
                                    <span className="text-slate-300 font-normal">Not assigned</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Joint Summary Footer */}
                  {selectedTeamWorkerIds.length > 0 && totalGroupQty !== "" && (
                    <div className="border-t border-slate-200 bg-slate-50 p-2.5 text-xs flex items-center justify-between shrink-0">
                      <div>
                        Total Group Qty: <span className="font-bold text-slate-900">{totalGroupQty} pcs</span> | Team Size:{" "}
                        <span className="font-bold text-slate-900">{selectedTeamWorkerIds.length} workers</span>
                      </div>
                      <div>
                        {splitMode === "equal" ? (
                          <span className="font-bold text-blue-600">
                            Equal Allocation: {equalSplitQuantity} pcs / worker
                          </span>
                        ) : (
                          <span
                            className={`font-bold ${
                              Math.abs(customAllocationsTotal - Number(totalGroupQty)) < 0.01
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            Allocated: {customAllocationsTotal} / {totalGroupQty} pcs
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 shrink-0">
              <div className="text-xs text-slate-500">
                {entryMode === "individual" ? (
                  <>
                    Entering production for{" "}
                    <span className="font-bold text-slate-900">
                      {Object.values(rowState).filter((r) => Number(r.quantity) > 0).length}
                    </span>{" "}
                    workers.
                  </>
                ) : (
                  <>
                    Assigning joint task to{" "}
                    <span className="font-bold text-slate-900">{selectedTeamWorkerIds.length}</span> workers.
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeWorkers.length === 0 || isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{isSubmitting ? "Saving..." : "Save Production Record(s)"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}