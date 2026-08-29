"use client";

import React, { useState } from "react";
import { ProductionEntry } from "@/types/production";
import { Edit, AlertCircle, FileText } from "lucide-react";
import EditProductionModal from "./EditProductionModal";
import { Worker } from "@/types/worker";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";

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
console.log("entires i am getting: ", entries)
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
              {entries.map((entry) => (
                <tr key={entry._id || entry.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                    {entry.productionDate
                      ? new Date(entry.productionDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {entry.workerName || "Unknown Worker"}
                    </div>
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
                    Rs {Number(entry.appliedRate).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-emerald-600">
                    Rs {Number(entry.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="inline-flex rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit Record"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
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
    </>
  );
}