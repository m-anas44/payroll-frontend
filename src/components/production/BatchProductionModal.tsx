"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getOperations,
} from "@/handlers/operation.handler";

import {
  getArticles,
} from "@/handlers/article.handler";

import {
  getDepartments,
} from "@/handlers/department.handler";

import {
  createProductionBatch,
} from "@/handlers/production.handler";

import {
  X,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getWorkers } from "@/handlers/worker.handler";

interface BatchProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface BatchRow {
  workerId: string;
  articleId: string;
  operationId: string;
  quantity: number | "";
  notes: string;
}

interface Worker {
  _id: string;
  workerCode?: string;
  name: string;
  departmentId: string;
}

interface Department {
  _id: string;
  code: string;
  name: string;
}

interface Article {
  _id: string;
  articleNumber?: string;
  name: string;
}

interface Operation {
  _id: string;
  code?: string;
  name: string;
  articleId?: string;
}

export default function BatchProductionModal({
  isOpen,
  onClose,
  onSuccess,
}: BatchProductionModalProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [commonDate, setCommonDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [commonDeptId, setCommonDeptId] = useState("");
  const [commonArticleId, setCommonArticleId] = useState("");
  const [commonOperationId, setCommonOperationId] = useState("");

  const [rows, setRows] = useState<BatchRow[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(
    null
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadModalData = useCallback(async () => {
    setIsLoadingData(true);
    setErrorMessage("");

    try {
      const [
        departmentsData,
        articlesData,
        operationsData,
        workersData,
      ] = await Promise.all([
        getDepartments(),
        getArticles({
          page: 1,
          limit: 100,
        }),
        getOperations({
          page: 1,
          limit: 100,
        }),
        getWorkers({ page: 1, limit: 100 }),
      ]);

      setDepartments(departmentsData);

      setArticles(
        (articlesData.items || []).map((item: any) => ({
          _id: String(item._id || item.id),
          articleNumber:
            item.articleNumber || item.articleCode,
          name: item.name || "",
        }))
      );

      setOperations(
        (operationsData.items || []).map((item: any) => ({
          _id: String(item._id || item.id),
          code: item.code || item.operationCode,
          name: item.name || "",
          articleId: item.articleId
            ? String(item.articleId)
            : undefined,
        }))
      );

      setWorkers(workersData.items);
    } catch (error) {
      console.error("Failed to load production data:", error);

      setErrorMessage(
        "Failed to load required production data."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadModalData();
    }
  }, [isOpen, loadModalData]);

  useEffect(() => {
    if (!commonDeptId) {
      setRows([]);
      return;
    }

    const departmentWorkers = workers.filter(
      (worker) =>
        String(worker.departmentId) ===
        String(commonDeptId)
    );

    setRows(
      departmentWorkers.map((worker) => ({
        workerId: worker._id,
        articleId: commonArticleId,
        operationId: commonOperationId,
        quantity: "",
        notes: "",
      }))
    );
  }, [
    commonDeptId,
    workers,
    commonArticleId,
    commonOperationId,
  ]);

  const availableHeaderOperations = operations.filter(
    (operation) =>
      !commonArticleId ||
      String(operation.articleId) ===
      String(commonArticleId)
  );

  const handleRowChange = <
    K extends keyof BatchRow
  >(
    index: number,
    key: K,
    value: BatchRow[K]
  ) => {
    setRows((previousRows) =>
      previousRows.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const updatedRow = {
          ...row,
          [key]: value,
        };

        if (key === "articleId") {
          const matchingOperations =
            operations.filter(
              (operation) =>
                String(operation.articleId) ===
                String(value)
            );

          updatedRow.operationId =
            matchingOperations[0]?._id || "";
        }

        return updatedRow;
      })
    );
  };

  const applyHeaderToAllRows = () => {
    setRows((previousRows) =>
      previousRows.map((row) => ({
        ...row,
        articleId: commonArticleId,
        operationId: commonOperationId,
      }))
    );
  };

  const handleSubmitBatch = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessCount(null);

    if (!commonDeptId) {
      setErrorMessage(
        "Please select a department."
      );
      return;
    }

    const validRows = rows.filter(
      (row) => Number(row.quantity) > 0
    );

    if (validRows.length === 0) {
      setErrorMessage(
        "Please enter quantity for at least one worker."
      );
      return;
    }

    const invalidRow = validRows.find(
      (row) =>
        !row.workerId ||
        !row.articleId ||
        !row.operationId
    );

    if (invalidRow) {
      setErrorMessage(
        "Every submitted row must have an article and operation."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createProductionBatch({
        productionDate: commonDate,

        items: validRows.map((row) => ({
          workerId: row.workerId,
          departmentId: commonDeptId,
          articleId: row.articleId,
          operationId: row.operationId,
          quantity: Number(row.quantity),
          notes: row.notes || undefined,
        })),
      });

      const successfulCount =
        Number(response?.totalSuccessful) ||
        validRows.length;

      setSuccessCount(successfulCount);

      onSuccess?.();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to save production records."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

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
                  onChange={(event) =>
                    setCommonDate(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Select Department *
                </label>

                <select
                  value={commonDeptId}
                  onChange={(event) =>
                    setCommonDeptId(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department._id}
                      value={department._id}
                    >
                      {department.code} - {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Default Article
                </label>

                <select
                  value={commonArticleId}
                  onChange={(event) => {
                    setCommonArticleId(event.target.value);
                    setCommonOperationId("");
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="">
                    Select Shared Article
                  </option>

                  {articles.map((article) => (
                    <option
                      key={article._id}
                      value={article._id}
                    >
                      {article.articleNumber} - {article.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Default Operation
                </label>

                <div className="flex gap-1.5">
                  <select
                    value={commonOperationId}
                    onChange={(event) =>
                      setCommonOperationId(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option value="">
                      Select Shared Operation
                    </option>

                    {availableHeaderOperations.map(
                      (operation) => (
                        <option
                          key={operation._id}
                          value={operation._id}
                        >
                          {operation.code} - {operation.name}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={applyHeaderToAllRows}
                    className="whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-100"
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
                <span>
                  Successfully logged {successCount} production
                  entries.
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmitBatch}
              className="mt-4 flex flex-1 flex-col overflow-y-auto"
            >
              {!commonDeptId ? (
                <div className="py-20 text-center text-xs font-medium text-slate-400">
                  Select a department to load its workers.
                </div>
              ) : rows.length === 0 ? (
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
                      <th className="p-2.5 text-right">
                        Completed Pcs
                      </th>
                      <th className="p-2.5">Notes</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, index) => {
                      const worker = workers.find(
                        (item) =>
                          String(item._id) ===
                          String(row.workerId)
                      );

                      const rowOperations =
                        operations.filter(
                          (operation) =>
                            !row.articleId ||
                            String(operation.articleId) ===
                            String(row.articleId)
                        );

                      return (
                        <tr
                          key={row.workerId}
                          className="hover:bg-slate-50"
                        >
                          <td className="p-2.5 text-slate-400">
                            {index + 1}
                          </td>

                          <td className="p-2.5 font-bold text-slate-800">
                            {worker?.workerCode
                              ? `${worker.workerCode} - ${worker.name}`
                              : worker?.name}
                          </td>

                          <td className="p-2.5">
                            <select
                              value={row.articleId}
                              onChange={(event) =>
                                handleRowChange(
                                  index,
                                  "articleId",
                                  event.target.value
                                )
                              }
                              className="w-full rounded border border-slate-200 bg-white p-1 text-xs"
                            >
                              <option value="">
                                Select Article
                              </option>

                              {articles.map((article) => (
                                <option
                                  key={article._id}
                                  value={article._id}
                                >
                                  {article.articleNumber} -{" "}
                                  {article.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-2.5">
                            <select
                              value={row.operationId}
                              onChange={(event) =>
                                handleRowChange(
                                  index,
                                  "operationId",
                                  event.target.value
                                )
                              }
                              className="w-full rounded border border-slate-200 bg-white p-1 text-xs"
                            >
                              <option value="">
                                Select Operation
                              </option>

                              {rowOperations.map(
                                (operation) => (
                                  <option
                                    key={operation._id}
                                    value={operation._id}
                                  >
                                    {operation.code} -{" "}
                                    {operation.name}
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          <td className="p-2.5">
                            <input
                              ref={(element) => {
                                inputRefs.current[index] =
                                  element;
                              }}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={row.quantity}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();

                                  inputRefs.current[
                                    index + 1
                                  ]?.focus();
                                }
                              }}
                              onChange={(event) =>
                                handleRowChange(
                                  index,
                                  "quantity",
                                  event.target.value === ""
                                    ? ""
                                    : Number(
                                      event.target.value
                                    )
                                )
                              }
                              className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs font-bold focus:border-blue-600 focus:outline-none"
                            />
                          </td>

                          <td className="p-2.5">
                            <input
                              type="text"
                              value={row.notes}
                              placeholder="Optional"
                              onChange={(event) =>
                                handleRowChange(
                                  index,
                                  "notes",
                                  event.target.value
                                )
                              }
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
                    {
                      rows.filter(
                        (row) =>
                          Number(row.quantity) > 0
                      ).length
                    }
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
                    disabled={
                      rows.length === 0 ||
                      isSubmitting
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    <span>
                      {isSubmitting
                        ? "Saving..."
                        : "Save All Batch Records"}
                    </span>
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