"use client";

import React, { useState } from "react";
import { ExcelHandler } from "@/handlers/excel.handler";
import { FileUp, X, CheckCircle2, Download } from "lucide-react";

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
  const [fileContent, setFileContent] = useState("");
  const [summary, setSummary] = useState<{ imported: number; skipped: number } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!fileContent) return;
    const res = ExcelHandler.importWorkersFromCSV(fileContent);
    setSummary(res);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
      setSummary(null);
      setFileContent("");
    }, 1500);
  };

  const handleDownloadSample = () => {
    const sampleCSV = `Worker Code,Name,CNIC,Department,Skill,Date of Joining,Date of Birth,Contact,Address,Police Verification
W-1009,Zahid Hussain,35202-7766554-1,Cutting Department,Cutting Master,2026-01-15,1992-05-10,0300-9988776,Multan Road Lahore,Verified
W-1010,Sajid Ali,35202-6655443-3,Stitching Department,Stitching Specialist,2026-02-01,1994-08-20,0321-4455667,Ferozepur Road Lahore,Pending`;

    const blob = new Blob([sampleCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Worker_Import_Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileUp className="h-5 w-5 text-emerald-600" />
            Import Workers Batch (CSV / Excel)
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {summary ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2 animate-bounce" />
            <p className="text-sm font-bold text-slate-900 ">
              Successfully Imported {summary.imported} workers!
            </p>
            {summary.skipped > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                Skipped {summary.skipped} duplicate CNICs.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 ">
              <div>
                <span className="text-xs font-bold text-slate-900 ">
                  Need a CSV template?
                </span>
                <p className="text-[11px] text-slate-500">
                  Download the official structured CSV template.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                Template
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-600 border border-slate-300 rounded-lg p-2 bg-slate-50 "
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 ">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 "
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!fileContent}
                onClick={handleImport}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Execute Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
