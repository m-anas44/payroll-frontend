import React from "react";
import { Sparkles, Check, Calendar } from "lucide-react";
import { TARGET_FIELDS } from "@/types/worker";

interface Step2MappingProps {
  headers: string[];
  columnMapping: Record<string, string>;
  setColumnMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  defaultDateOfJoining: string;
  setDefaultDateOfJoining: (val: string) => void;
  autoDetectMapping: (headers: string[]) => void;
}

export const Step2Mapping: React.FC<Step2MappingProps> = ({
  headers,
  columnMapping,
  setColumnMapping,
  defaultDateOfJoining,
  setDefaultDateOfJoining,
  autoDetectMapping,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Columns have been auto-matched against sheet headers. Please verify and map any missing required fields.
          </span>
        </div>
        <button
          type="button"
          onClick={() => autoDetectMapping(headers)}
          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-medium text-amber-900 hover:bg-amber-100/50 shadow-2xs transition shrink-0"
        >
          Re-run Auto Match
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {TARGET_FIELDS.map((field) => {
          const mappedCol = columnMapping[field.key] || "";
          const isMissingRequired = field.required && !mappedCol;

          return (
            <div
              key={field.key}
              className={`p-3.5 rounded-xl border transition-all ${
                isMissingRequired
                  ? "border-rose-300 bg-rose-50/20"
                  : mappedCol
                  ? "border-slate-200 bg-white shadow-xs"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                  <span>{field.label}</span>
                  {field.required ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 rounded uppercase tracking-wider">
                      Required
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  )}
                </label>
                {mappedCol && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium flex items-center gap-1 shrink-0">
                    <Check className="w-2.5 h-2.5" /> Mapped
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mb-2 truncate">
                {field.hint}
              </p>

              <select
                value={mappedCol}
                onChange={(e) =>
                  setColumnMapping((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  isMissingRequired
                    ? "border-rose-300 bg-white text-rose-900"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              >
                <option value="">-- Unmapped --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-800 block">
              Default Date of Joining Fallback
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Used automatically if the sheet is missing the joining date column or if a specific row row has an empty date.
            </p>
            <input
              type="date"
              value={defaultDateOfJoining}
              onChange={(e) => setDefaultDateOfJoining(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};