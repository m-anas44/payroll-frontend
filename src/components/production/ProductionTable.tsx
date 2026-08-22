"use client";

import React, { useState } from "react";
import { ProductionEntry } from "@/types/production";
import { useProductionStore } from "@/store/production.store";
import { useAuthStore } from "@/store/auth.store";
import { ProductionHandler } from "@/handlers/production.handler";
import { formatDate } from "@/lib/format-date";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import ProductionModal from "./BatchProductionModal";
import { Edit2, Trash2, Calendar, Package, Layers } from "lucide-react";

export default function ProductionTable() {
  const { entries, filters } = useProductionStore();
  const { currentUser } = useAuthStore();

  const isAdmin = currentUser.role === "Admin";

  const [entryToEdit, setEntryToEdit] = useState<ProductionEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredEntries = entries.filter((e) => {
    if (filters.startDate && e.date < filters.startDate) return false;
    if (filters.endDate && e.date > filters.endDate) return false;
    if (filters.workerId && filters.workerId !== "ALL" && e.workerId !== filters.workerId)
      return false;
    if (filters.departmentId && filters.departmentId !== "ALL" && e.departmentId !== filters.departmentId)
      return false;
    if (filters.articleId && filters.articleId !== "ALL" && e.articleId !== filters.articleId)
      return false;
    if (filters.operationId && filters.operationId !== "ALL" && e.operationId !== filters.operationId)
      return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        (e.workerName && e.workerName.toLowerCase().includes(q)) ||
        (e.workerCode && e.workerCode.toLowerCase().includes(q)) ||
        (e.articleName && e.articleName.toLowerCase().includes(q)) ||
        (e.operationName && e.operationName.toLowerCase().includes(q)) ||
        (e.remarks && e.remarks.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const totalItems = filteredEntries.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + pageSize);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this production entry?")) {
      ProductionHandler.deleteEntry(id);
    }
  };

  const totalQuantitySum = filteredEntries.reduce((sum, item) => sum + item.quantity, 0);
  const totalPayoutSum = filteredEntries.reduce((sum, item) => sum + item.totalPayment, 0);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 ">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Worker</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Article / Operation</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Total Payment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-slate-400 font-medium"
                >
                  No production records found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedEntries.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 ">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(e.date)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-bold text-slate-900 ">
                        {e.workerName}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {e.workerCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 ">
                    {e.departmentName}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Package className="h-3 w-3 text-blue-500" />
                        <span>{e.articleName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Layers className="h-3 w-3 text-slate-400" />
                        <span>{e.operationName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 ">
                    {formatQuantity(e.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 ">
                    {formatCurrency(e.rateApplied)}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-600 ">
                    {formatCurrency(e.totalPayment)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEntryToEdit(e);
                          setIsModalOpen(true);
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 "
                        title="Edit Record"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600 "
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300 ">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase">
                Filtered Production Totals:
              </td>
              <td className="px-4 py-3 text-right text-xs">
                {formatQuantity(totalQuantitySum)} Pcs
              </td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right text-sm font-black text-emerald-600 ">
                {formatCurrency(totalPayoutSum)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900 ">
              {totalItems === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 ">
              {Math.min(startIndex + pageSize, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 ">
              {totalItems}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs "
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Previous
              </button>
              <span className="px-2 font-semibold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalItems === 0}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entryToEdit={entryToEdit}
      />
    </>
  );
}
