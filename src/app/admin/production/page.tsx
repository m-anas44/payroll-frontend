"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProductionFilter from "@/components/production/ProductionFilter";
import ProductionTable from "@/components/production/ProductionTable";
import ProductionModal from "@/components/production/BatchProductionModal";
import ExportButton from "@/components/excel/ExportButton";
import { ClipboardPlus, Loader2 } from "lucide-react";
import { useProductionStore } from "@/store/production.store";
import { getProductionEntries, ProductionEntry } from "@/handlers/production.handler";

export default function ProductionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { filters } = useProductionStore();

  const fetchProductionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductionEntries({
        startDate: filters.startDate,
        endDate: filters.endDate,
        workerId: filters.workerId,
        departmentId: filters.departmentId,
        articleId: filters.articleId,
        operationId: filters.operationId,
        status: filters.status,
        page: filters.page || 1,
        limit: filters.limit || 20,
      });

      setEntries(data.items);
      // if (setPagination) {
      //   setPagination({
      //     total: data.total,
      //     page: data.page,
      //     limit: data.limit,
      //   });
      // }
    } catch (err) {
      console.error("Failed to load production entries:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, setEntries]);

  useEffect(() => {
    fetchProductionData();
  }, [fetchProductionData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Daily Production Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record daily pieces completed per worker, operation, and article. Piece rates are automatically locked in.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton type="production" label="Export Production Logs" />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <ClipboardPlus className="h-3.5 w-3.5" />
            <span>Record Production</span>
          </button>
        </div>
      </div>

      <ProductionFilter />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-xs font-medium text-slate-500">Loading production logs...</span>
        </div>
      ) : (
        <ProductionTable onRefresh={fetchProductionData} />
      )}

      <ProductionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchProductionData();
        }}
      />
    </div>
  );
}

function setEntries(items: ProductionEntry[]) {
  throw new Error("Function not implemented.");
}
