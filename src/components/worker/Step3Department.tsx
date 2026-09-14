import React from "react";
import { Department } from "@/types/department";
import { Check, AlertCircle } from "lucide-react";

interface Step3DepartmentProps {
  departments: Department[];
  rawDepartmentValues: string[];
  departmentMapping: Record<string, string>;
  setDepartmentMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  useSingleDepartment: boolean;
  setUseSingleDepartment: (val: boolean) => void;
  singleDepartmentId: string;
  setSingleDepartmentId: (val: string) => void;
}

export const Step3Department: React.FC<Step3DepartmentProps> = ({
  departments,
  rawDepartmentValues,
  departmentMapping,
  setDepartmentMapping,
  useSingleDepartment,
  setUseSingleDepartment,
  singleDepartmentId,
  setSingleDepartmentId,
}) => {
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="singleDeptToggle"
              checked={useSingleDepartment}
              onChange={(e) => setUseSingleDepartment(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="singleDeptToggle"
              className="text-xs font-semibold text-slate-800 cursor-pointer select-none"
            >
              Assign all imported workers to one single department
            </label>
          </div>
          {useSingleDepartment && (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Overrides spreadsheet values
            </span>
          )}
        </div>

        {useSingleDepartment && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Target Department:
            </label>
            <select
              value={singleDepartmentId}
              onChange={(e) => setSingleDepartmentId(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 flex-1 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">-- Choose System Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} {d.code ? `(${d.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!useSingleDepartment && (
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-800">
              Detected Departments Reconciliation ({rawDepartmentValues.length} unique values)
            </h4>
            <p className="text-[11px] text-slate-500">
              Each unique department name found in the file must be mapped to a registered department.
            </p>
          </div>

          {rawDepartmentValues.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
              No department column or values identified in the spreadsheet.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <div className="col-span-5">Value In Sheet</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-5">System Department</div>
              </div>

              {rawDepartmentValues.map((rawVal) => {
                const targetId = departmentMapping[rawVal] || "";
                const isMapped = Boolean(targetId);

                return (
                  <div
                    key={rawVal}
                    className={`grid grid-cols-12 gap-3 px-4 py-2.5 items-center text-xs transition ${
                      !isMapped ? "bg-rose-50/25" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="col-span-5 font-mono text-slate-800 font-medium truncate">
                      "{rawVal}"
                    </div>
                    <div className="col-span-2 text-center">
                      {isMapped ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <Check className="w-2.5 h-2.5" /> Matched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 border border-rose-200 text-rose-700">
                          <AlertCircle className="w-2.5 h-2.5" /> Unmapped
                        </span>
                      )}
                    </div>
                    <div className="col-span-5">
                      <select
                        value={targetId}
                        onChange={(e) =>
                          setDepartmentMapping((prev) => ({
                            ...prev,
                            [rawVal]: e.target.value,
                          }))
                        }
                        className={`w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none transition focus:ring-2 focus:ring-blue-500/20 ${
                          !isMapped
                            ? "border-rose-300 bg-white text-rose-900"
                            : "border-slate-300 bg-white text-slate-800"
                        }`}
                      >
                        <option value="">-- Choose Department --</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} {d.code ? `(${d.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};