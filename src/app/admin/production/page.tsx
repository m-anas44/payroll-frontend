"use client";

import React, { useState } from "react";
import ProductionFilter from "@/components/production/ProductionFilter";
import ProductionTable from "@/components/production/ProductionTable";
import ProductionModal from "@/components/production/BatchProductionModal";
import ExportButton from "@/components/excel/ExportButton";
import { ClipboardPlus } from "lucide-react";

export default function ProductionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <ProductionTable />

      <ProductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
