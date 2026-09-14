import React from "react";
import { Department } from "@/types/department";
import { CheckCircle2, AlertCircle, AlertTriangle, Check } from "lucide-react";
import { CandidateRow, WorkerBatchResponse } from "@/types/worker";

interface Step4PreviewProps {
  departments: Department[];
  summaryStats: {
    total: number;
    valid: number;
    invalid: number;
    included: number;
    readyToSubmit: number;
  };
  excludeInvalidRows: boolean;
  handleToggleExcludeInvalid: (exclude: boolean) => void;
  handleSelectAllValid: (selected: boolean) => void;
  filterMode: "all" | "valid" | "invalid";
  setFilterMode: (mode: "all" | "valid" | "invalid") => void;
  displayedRows: CandidateRow[];
  toggleRowInclusion: (index: number) => void;
  batchResult: WorkerBatchResponse | null;
}

export const Step4Preview: React.FC<Step4PreviewProps> = ({
  departments,
  summaryStats,
  excludeInvalidRows,
  handleToggleExcludeInvalid,
  handleSelectAllValid,
  filterMode,
  setFilterMode,
  displayedRows,
  toggleRowInclusion,
  batchResult,
}) => {
  return (
    <div className="space-y-4">
      {batchResult && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Batch Complete: {batchResult.totalCreated} Created, {batchResult.totalSkipped} Skipped
            </span>
          </div>
          {batchResult.skippedRecords.length > 0 && (
            <div className="mt-2.5 text-xs">
              <p className="font-semibold text-emerald-950 mb-1">Skipped Entries:</p>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {batchResult.skippedRecords.map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-white border border-emerald-200 flex justify-between gap-2"
                  >
                    <span>
                      <strong className="text-slate-800">{sk.name}</strong> ({sk.cnic})
                    </span>
                    <span className="text-amber-700 font-medium">{sk.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Rows</span>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{summaryStats.total}</p>
        </div>
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <span className="text-[11px] text-emerald-700 font-medium">Valid</span>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">{summaryStats.valid}</p>
        </div>
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 shadow-2xs">
          <span className="text-[11px] text-rose-700 font-medium">Invalid</span>
          <p className="text-lg font-bold text-rose-700 mt-0.5">{summaryStats.invalid}</p>
        </div>
        <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
          <span className="text-[11px] text-blue-700 font-medium">To Ingest</span>
          <p className="text-lg font-bold text-blue-700 mt-0.5">{summaryStats.readyToSubmit}</p>
        </div>
      </div>

      {/* Filter and Bulk Selection Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
            <input
              type="checkbox"
              checked={excludeInvalidRows}
              onChange={(e) => handleToggleExcludeInvalid(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>Exclude invalid</span>
          </label>
          <button
            type="button"
            onClick={() => handleSelectAllValid(true)}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
          >
            Select Valid
          </button>
          <button
            type="button"
            onClick={() => handleSelectAllValid(false)}
            className="text-slate-500 hover:text-slate-700 font-medium text-xs transition"
          >
            Deselect All
          </button>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs text-xs self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-2.5 py-1 rounded-md transition ${
              filterMode === "all"
                ? "bg-slate-900 text-white font-medium"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({summaryStats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("valid")}
            className={`px-2.5 py-1 rounded-md transition ${
              filterMode === "valid"
                ? "bg-emerald-600 text-white font-medium"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Valid ({summaryStats.valid})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("invalid")}
            className={`px-2.5 py-1 rounded-md transition ${
              filterMode === "invalid"
                ? "bg-rose-600 text-white font-medium"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Invalid ({summaryStats.invalid})
          </button>
        </div>
      </div>

      {/* Review Table Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="max-h-[320px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
            <thead className="bg-slate-50/90 sticky top-0 z-10 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">Inc</th>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">CNIC</th>
                <th className="py-2.5 px-3">Joining Date</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 min-w-[200px]">Validation Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No rows matching current filter criteria.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row) => {
                  const deptObj = departments.find((d) => d._id === row.data.departmentId);
                  return (
                    <tr
                      key={row.index}
                      className={`transition ${
                        !row.included
                          ? "opacity-50 bg-slate-50/40"
                          : row.isValid
                          ? "hover:bg-slate-50/70"
                          : "bg-rose-50/20"
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.included}
                          onChange={() => toggleRowInclusion(row.index)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {row.index}
                      </td>
                      <td className="py-2 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <Check className="w-2.5 h-2.5" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 border border-rose-200 text-rose-700">
                            <AlertTriangle className="w-2.5 h-2.5" /> Invalid
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 max-w-[150px] truncate">
                        {row.data.name || <span className="text-slate-400 italic">Empty</span>}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                        {row.data.cnic || <span className="text-rose-500 italic">Missing</span>}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {row.data.dateOfJoining || <span className="text-rose-500 italic">Missing</span>}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {deptObj?.name || <span className="text-rose-500 italic">Unmapped</span>}
                      </td>
                      <td className="py-2 px-3">
                        {row.errors.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {row.errors.map((err, errIdx) => (
                              <span
                                key={errIdx}
                                className="text-[10px] text-rose-600 flex items-center gap-1 whitespace-normal"
                              >
                                <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                <span>{err}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};