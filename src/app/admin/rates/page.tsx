"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import RateModal from "@/components/master/RateModal";
import Heading from "@/components/common/Heading";
import Pagination from "@/components/common/Pagination";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { PieceRate } from "@/types/rate";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/format-date";
import {
  getRates,
  getRateHistory,
  deleteRate,
} from "@/handlers/rate.handler";
import { getOperations } from "@/handlers/operation.handler";
import { TableRowSkeleton } from "@/skeletons";
import {
  Coins,
  Plus,
  Edit2,
  History,
  Layers,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function PieceRatesPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";

  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  const [activeRates, setActiveRates] = useState<PieceRate[]>([]);
  const [rawHistoryRates, setRawHistoryRates] = useState<PieceRate[]>([]);
  const [operations, setOperations] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rateToEdit, setRateToEdit] = useState<PieceRate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rateToDelete, setRateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load all required data upfront at root level
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const [activeRes, historyRes, opsRes] = await Promise.all([
        getRates({ status: "active" }),
        getRateHistory(),
        getOperations(),
      ]);

      if (activeRes.success) {
        setActiveRates(activeRes.items || []);
      } else {
        setErrorMsg(activeRes.message || "Failed to load active rates.");
      }

      if (historyRes.success) {
        setRawHistoryRates(historyRes.items || []);
      }

      setOperations(opsRes.items || []);
    } catch {
      setErrorMsg("An error occurred while fetching system data.");
    } fontally: {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Strict History Filter: Only superseded/past rates with effectiveTo set
  const filteredHistoryRates = useMemo(() => {
    const now = new Date().getTime();
    return rawHistoryRates.filter((rate) => {
      const isSupersededStatus =
        rate.status === "superseded" || rate.status === "inactive";
      const hasEffectiveTo = Boolean(rate.effectiveTo);
      const isPastEffectiveTo =
        hasEffectiveTo && new Date(rate.effectiveTo!).getTime() <= now;

      return isSupersededStatus && isPastEffectiveTo;
    });
  }, [rawHistoryRates]);

  const handleConfirmDeleteRate = async () => {
    if (!rateToDelete) return;
    try {
      setIsDeleting(true);
      const res = await deleteRate(rateToDelete);
      if (res.success) {
        toast.success("Rate record deleted successfully.");
        setRateToDelete(null);
        await loadInitialData();
      } else {
        toast.error(res.message || "Failed to delete rate.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete rate.");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayedRates =
    activeTab === "Active" ? activeRates : filteredHistoryRates;

  const paginatedRates = displayedRates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Heading
        title="Piece Rate Definitions"
        subtitle="Define, revise, and track operation piece rate history."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadInitialData}
              disabled={isLoading}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setRateToEdit(null);
                  setIsModalOpen(true);
                }}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Define New Rate</span>
              </button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("Active");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "Active"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Coins className="h-4 w-4" />
          Active Rates ({activeRates.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("History");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "History"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="h-4 w-4" />
          Rate History ({filteredHistoryRates.length})
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Rates Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Operation</th>
              <th className="px-4 py-3 text-right">Rate / Piece</th>
              <th className="px-4 py-3">Effective From</th>
              {activeTab === "History" && (
                <th className="px-4 py-3">Effective To</th>
              )}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {isLoading ? (
              <TableRowSkeleton columns={activeTab === "History" ? 7 : 6} rows={6} />
            ) : displayedRates.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "History" ? 7 : 6}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  No piece rate records found for this view.
                </td>
              </tr>
            ) : (
              paginatedRates.map((rate) => {
                const operation = operations.find(
                  (item) => String(item._id) === String(rate.operationId)
                );

                return (
                  <tr
                    key={rate._id}
                    className="hover:bg-slate-50/60 transition"
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>
                          {operation
                            ? `${operation.code || ""} - ${operation.name}`
                            : rate.operationId}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-emerald-600 text-sm">
                      {formatCurrency(rate.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(rate.effectiveFrom)}
                    </td>

                    {activeTab === "History" && (
                      <td className="px-4 py-3.5 text-slate-500">
                        {rate.effectiveTo ? formatDate(rate.effectiveTo) : "—"}
                      </td>
                    )}

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center capitalize px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rate.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {rate.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-1.5">
                          {activeTab === "Active" && (
                            <button
                              title="Revise Rate"
                              onClick={() => {
                                setRateToEdit(rate);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            title="Delete Rate"
                            onClick={() => setRateToDelete(rate._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {displayedRates.length > 0 && (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={displayedRates.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="rates"
          />
        )}
      </div>

      <RateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rateToEdit={rateToEdit}
        operations={operations}
        onSuccess={loadInitialData}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(rateToDelete)}
        itemName="this rate definition"
        isLoading={isDeleting}
        onClose={() => setRateToDelete(null)}
        onConfirm={handleConfirmDeleteRate}
      />
    </div>
  );
}