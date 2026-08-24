"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import RateModal from "@/components/master/RateModal";
import { PieceRate } from "@/types/rate";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/format-date";
import {
  getRates,
  getRateHistory,
  deleteRate,
} from "@/handlers/rate.handler";
import { getOperations } from "@/handlers/operation.handler";
import {
  Coins,
  Plus,
  Edit2,
  History,
  Layers,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function PieceRatesPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "Admin";

  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  const [activeRates, setActiveRates] = useState<PieceRate[]>([]);
  const [historyRates, setHistoryRates] = useState<PieceRate[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rateToEdit, setRateToEdit] = useState<PieceRate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all data upfront at once
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const [activeRes, historyRes, opsRes] = await Promise.all([
        getRates(),
        getRateHistory(),
        getOperations(),
      ]);

      if (activeRes.success) {
        setActiveRates(activeRes.items || []);
      } else {
        setErrorMsg(activeRes.message || "Failed to load active rates.");
      }

      if (historyRes.success) {
        setHistoryRates(historyRes.items || []);
      }

      setOperations(opsRes.items || []);
    } catch {
      setErrorMsg("An error occurred while fetching system data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleDeleteRate = async (rateId: string) => {
    if (!confirm("Are you sure you want to delete this rate record?")) return;

    const res = await deleteRate(rateId);
    if (res.success) {
      await loadInitialData();
    } else {
      alert(res.message || "Failed to delete rate.");
    }
  };

  const displayedRates = activeTab === "Active" ? activeRates : historyRates;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Piece Rate Definitions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define, revise, and track operation piece rate history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInitialData}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setRateToEdit(null);
                setIsModalOpen(true);
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Define New Rate
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("Active")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "Active"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Coins className="h-4 w-4" />
          Active Rates ({activeRates.length})
        </button>

        <button
          onClick={() => setActiveTab("History")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === "History"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="h-4 w-4" />
          Rate History ({historyRates.length})
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Rates Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Operation</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3 text-right">Rate / Piece</th>
              <th className="px-4 py-3">Effective Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
                  Loading rate definitions...
                </td>
              </tr>
            ) : displayedRates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No piece rate records found for this view.
                </td>
              </tr>
            ) : (
              displayedRates.map((rate) => {
                const operation = operations.find(
                  (item) => String(item._id) === String(rate.operationId)
                );

                return (
                  <tr key={rate._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>
                          {operation
                            ? `${operation.code} - ${operation.name}`
                            : rate.operationId}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                      {operation?.articleNumber || rate.articleId || "—"}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-emerald-600 text-sm">
                      {formatCurrency(rate.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(rate.effectiveFrom)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            title="Delete Rate"
                            onClick={() => handleDeleteRate(rate._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
      </div>

      <RateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rateToEdit={rateToEdit}
        operations={operations}
        onSuccess={loadInitialData}
      />
    </div>
  );
}