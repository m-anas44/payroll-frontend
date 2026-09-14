"use client";

import React, { useRef, useState } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { uploadWorkersExcel } from "@/handlers/worker.handler";

interface RowError {
  row: number;
  error: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [generalError, setGeneralError] = useState("");

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setRowErrors([]);
    setGeneralError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls"];
    const isValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValidExt) {
      toast.error("Please select a valid Excel file (.xlsx or .xls).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setSelectedFile(file);
    setRowErrors([]);
    setGeneralError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "Name,CNIC,Department\n" +
      "Muhammad Tariq,3520112345671,Cutting\n" +
      "Zahid Mahmood,3520198765432,Stitching\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "workers_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setRowErrors([]);
      setGeneralError("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await uploadWorkersExcel(formData);

      toast.success(response.message || "Workers imported successfully.");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      const responseData = err.response?.data;
      const detail = responseData?.detail || responseData?.error;

      if (detail && typeof detail === "object" && Array.isArray(detail.errors)) {
        setRowErrors(detail.errors);
        setGeneralError(detail.message || "Please resolve the row errors below.");
      } else if (typeof detail === "string") {
        setGeneralError(detail);
      } else {
        setGeneralError("Failed to upload workers. Please check file formatting.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bulk Import Workers
              </h3>
              <p className="text-xs text-slate-500">
                Upload a verified Excel spreadsheet to register multiple workers.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Template Download Prompt */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                Standard Excel Template
              </p>
              <p className="text-[11px] text-slate-500">
                Ensure headers match: <code>Name</code>, <code>CNIC</code>, and <code>Department</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Drag and Drop Zone */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="rounded-full bg-blue-50 p-3 text-blue-600 mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag and drop file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported formats: .XLSX, .XLS (Up to 5MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleReset}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* General Error Banner */}
          {generalError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>{generalError}</div>
            </div>
          )}

          {/* Granular Row Validation Errors */}
          {rowErrors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="text-rose-600">
                  Validation Issues ({rowErrors.length} found)
                </span>
                <span className="text-[11px] text-slate-400">
                  Fix your spreadsheet and re-upload
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50/30 divide-y divide-rose-100">
                {rowErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2 text-xs"
                  >
                    <span className="shrink-0 rounded bg-rose-200/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-800">
                      Row {err.row}
                    </span>
                    <span className="text-slate-700">{err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Validating & Uploading...</span>
              </>
            ) : (
              <span>Confirm & Import</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}