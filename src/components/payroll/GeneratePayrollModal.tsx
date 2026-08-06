"use client";

import React, { useState } from "react";
import { PayrollHandler } from "@/handlers/payroll.handler";
import { getCurrentMonthStr, formatMonthYear } from "@/lib/format-date";
import { useAuthStore } from "@/store/auth.store";
import { X, Calculator, CheckCircle2 } from "lucide-react";

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GeneratePayrollModal({
  isOpen,
  onClose,
  onSuccess,
}: GeneratePayrollModalProps) {
  const { currentUser } = useAuthStore();
  const [month, setMonth] = useState(getCurrentMonthStr());
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = PayrollHandler.generatePayroll(month, currentUser.name, notes);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSuccessMessage("");
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 ">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-600" />
            Generate Monthly Payroll
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2 animate-bounce" />
            <p className="text-sm font-bold text-slate-900 ">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Payroll Month *
              </label>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Target Period: <span className="font-bold">{formatMonthYear(month)}</span>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payroll Generation Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. End of month wage run, verified against production logs..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none "
              />
            </div>

            <div className="rounded-xl bg-purple-50 p-3 border border-purple-100 text-xs text-purple-900 ">
              <p className="font-bold">Business Rule Assurance:</p>
              <p className="text-[11px] mt-0.5">
                Payroll calculation aggregates all daily piece-rate entries for this month, using the exact approved rates locked in at the time of each production log.
              </p>
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
                type="submit"
                className="rounded-lg bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-colors"
              >
                Run Monthly Calculation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
