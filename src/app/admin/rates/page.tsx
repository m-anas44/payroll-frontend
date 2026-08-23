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
import { Coins, Plus, Edit2, History, Layers, Trash2, Loader2 } from "lucide-react";

export default function PieceRatesPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "Admin";

  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  const [ratesData, setRatesData] = useState<PieceRate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rateToEdit, setRateToEdit] = useState<PieceRate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data based on active tab
  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    let res;
    if (activeTab === "Active") {
      res = await getRates({ status: "Active" });
    } else {
      res = await getRateHistory();
    }

    if (res.success) {
      setRatesData(res.items || []);
    } else {
      setErrorMsg(res.message || "Failed to load rate records.");
      setRatesData([]);
    }

    setIsLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleDeleteRate = async (rateId: string) => {
    if (!confirm("Are you sure you want to delete this piece rate entry?")) return;

    const res = await deleteRate(rateId);
    if (res.success) {
      fetchRates();
    } else {
      alert(res.message || "Failed to delete piece rate.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Piece Rate Definition & Rate Lock Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define piece rates per operation. Historical rate revisions are preserved to safeguard past production payroll records.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setRateToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Define / Revise Rate</span>
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("Active")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "Active"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Active Piece Rates</span>
        </button>

        <button
          onClick={() => setActiveTab("History")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "History"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Rate Revision History Log</span>
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Operation Code / Name</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3 text-right">Rate / Piece</th>
              <th className="px-4 py-3">Effective Date</th>
              <th className="px-4 py-3">Notes / Revision Log</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <span>Loading rate data...</span>
                  </div>
                </td>
              </tr>
            ) : ratesData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No rate records in this category.
                </td>
              </tr>
            ) : (
              ratesData.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                        {r.operationCode}
                      </span>
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        {r.operationName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {r.articleName || "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-sm text-emerald-600 font-mono">
                    {formatCurrency(r.ratePerPiece)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                    {formatDate(r.effectiveFrom)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px]">
                    {r.notes || "Standard initial rate configuration"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1.5">
                        {activeTab === "Active" && (
                          <button
                            onClick={() => {
                              setRateToEdit(r);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            title="Revise Piece Rate"
                          >
                            <Edit2 className="h-3 w-3" />
                            Revise Rate
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRate(r.id)}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Rate Entry"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rateToEdit={rateToEdit}
        onSuccess={fetchRates}
      />
    </div>
  );
}