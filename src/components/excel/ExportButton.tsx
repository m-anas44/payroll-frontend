"use client";

import React from "react";
import { Download, FileUp } from "lucide-react";
import { ExcelHandler } from "@/handlers/excel.handler";

interface ExportButtonProps {
  type: "workers" | "production" | "payroll";
  month?: string;
  label?: string;
}

export default function ExportButton({ type, month, label }: ExportButtonProps) {
  const handleExport = () => {
    if (type === "workers") {
      ExcelHandler.exportWorkers();
    } else if (type === "production") {
      ExcelHandler.exportProduction();
    } else if (type === "payroll") {
      ExcelHandler.exportPayroll(month || "2026-08");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
    >
      <FileUp className="h-3.5 w-3.5 text-emerald-600" />
      <span>{label || "Export CSV"}</span>
    </button>
  );
}
