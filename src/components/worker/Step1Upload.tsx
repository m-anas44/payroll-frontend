import React from "react";
import { Download, UploadCloud, CheckCircle2, Info } from "lucide-react";
import { RawRowData } from "@/lib/excel-worker-parser";

interface Step1UploadProps {
  selectedFile: File | null;
  headers: string[];
  rawRows: RawRowData[];
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadSampleTemplate: () => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({
  selectedFile,
  headers,
  rawRows,
  isDragging,
  setIsDragging,
  fileInputRef,
  handleDrop,
  handleFileChange,
  downloadSampleTemplate,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded bg-blue-100 text-blue-700 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs text-blue-950">
            <p className="font-semibold text-sm leading-tight text-blue-900 mb-0.5">
              Client-Side Safe Parsing
            </p>
            <p className="text-blue-800 leading-relaxed">
              Files are sanitized locally to parse Excel date serial codes, remove dashes from CNICs, and normalize status fields before sending.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={downloadSampleTemplate}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shadow-sm transition shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Sample Template
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 bg-white ${
          isDragging
            ? "border-blue-500 bg-blue-50/40 scale-[0.99]"
            : selectedFile
            ? "border-emerald-400 bg-emerald-50/20"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition shadow-sm ${
            selectedFile
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
          }`}
        >
          <UploadCloud className="w-7 h-7" />
        </div>

        <p className="text-sm font-semibold text-slate-800 text-center">
          {selectedFile ? selectedFile.name : "Select an Excel spreadsheet or drag and drop here"}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports .xlsx, .xls spreadsheets up to 10MB
        </p>

        {selectedFile && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {rawRows.length} rows loaded &bull; {headers.length} columns detected
            </span>
          </div>
        )}
      </div>

      {rawRows.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Discovered Sheet Columns
            </span>
            <span className="text-[11px] text-slate-500">
              {headers.length} total
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {headers.map((h, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};