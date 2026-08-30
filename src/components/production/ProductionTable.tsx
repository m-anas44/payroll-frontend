"use client";

import React, { useState } from "react";
import { ProductionEntry } from "@/types/production";
import { Edit, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import EditProductionModal from "./EditProductionModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { Worker } from "@/types/worker";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";
import { deleteProductionEntry } from "@/handlers/production.handler";

interface ProductionTableProps {
  entries: ProductionEntry[];
  workers: Worker[];
  departments: Department[];
  articles: Article[];
  operations: Operation[];
  onRefresh: () => void;
}

export default function ProductionTable({
  entries,
  workers,
  departments,
  articles,
  operations,
  onRefresh,
}: ProductionTableProps) {
  const [editingEntry, setEditingEntry] = useState<ProductionEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<ProductionEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingEntry) return;

    const entryId = deletingEntry._id;
    if (!entryId) return;

    try {
      setIsDeleting(true);
      await deleteProductionEntry(entryId);
      toast.success("Production entry deleted successfully");
      setDeletingEntry(null);
      onRefresh();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || "Failed to delete production entry";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16">
        <FileText className="mb-2 h-10 w-10 text-slate-300" />
        <h3 className="text-sm font-bold text-slate-900">No Production Records</h3>
        <p className="mt-1 text-xs text-slate-500">
          Try adjusting your filters or add a new record to get started.
        </p>
      </div>
    );
  }

  const totalQuantitySum = entries.reduce(
    (sum, entry) => sum + (Number(entry.quantity) || 0),
    0
  );

  const totalPayoutSum = entries.reduce(
    (sum, entry) => sum + (Number(entry.totalAmount) || 0),
    0
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Operation</th>
                <th className="px-4 py-3 text-right">Pcs</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => {
                const currentId = entry._id;
                const isMultiWorker = entry.workers && entry.workers.length > 1;
                const workerDisplayName = isMultiWorker
                  ? `${entry.workers![0].workerName || "Worker"} + ${entry.workers!.length - 1} others`
                  : entry.workerName || (entry.workers && entry.workers[0]?.workerName) || "Unknown Worker";

                return (
                  <tr key={currentId} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                      {entry.productionDate
                        ? new Date(entry.productionDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{workerDisplayName}</span>
                        {isMultiWorker && (
                          <span className="inline-flex rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                            {entry.isGroupTask ? "Team Task" : "Multi"}
                          </span>
                        )}
                      </div>
                      {isMultiWorker && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[220px]" title={entry.workers?.map((w) => `${w.workerName || 'Worker'} (${w.quantity} pcs)`).join(", ")}>
                          {entry.workers?.map((w) => w.workerName || 'Worker').join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {entry.articleNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {entry.operationName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">
                      {entry.quantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-slate-600">
                      Rs {Number(entry.appliedRate || 0).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-emerald-600">
                      Rs {Number(entry.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Completed
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="inline-flex rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit Record"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingEntry(entry)}
                          className="inline-flex rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-xs text-slate-600">
                  Grand Totals:
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-900">
                  {totalQuantitySum}
                </td>
                <td></td>
                <td className="px-4 py-3 text-right text-sm text-emerald-600">
                  Rs {totalPayoutSum.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <EditProductionModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSuccess={() => {
          setEditingEntry(null);
          onRefresh();
        }}
        entry={editingEntry}
        workers={workers}
        departments={departments}
        articles={articles}
        operations={operations}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Production Entry"
        itemName={
          deletingEntry
            ? `${deletingEntry.workerName || "Worker"} entry (${deletingEntry.quantity} pcs)`
            : "this entry"
        }
      />
    </>
  );
}