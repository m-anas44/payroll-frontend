import React from "react";
import { CheckCircle2 } from "lucide-react";
import { WizardStep } from "@/types/worker";

interface StepTrackerProps {
  currentStep: WizardStep;
}

const STEPS = [
  { num: 1 as WizardStep, title: "Upload File", desc: "Select spreadsheet" },
  { num: 2 as WizardStep, title: "Column Mapping", desc: "Match headers" },
  { num: 3 as WizardStep, title: "Departments", desc: "Reconcile IDs" },
  { num: 4 as WizardStep, title: "Validation", desc: "Review & ingest" },
];

export const StepTracker: React.FC<StepTrackerProps> = ({ currentStep }) => {
  return (
    <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50/60">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {STEPS.map((step) => {
          const isActive = currentStep === step.num;
          const isPast = currentStep > step.num;

          return (
            <div
              key={step.num}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                isActive
                  ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/20"
                  : isPast
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                  : "bg-transparent border-slate-200 text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : isPast
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isPast ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold leading-tight truncate ${
                    isActive ? "text-blue-900" : isPast ? "text-emerald-900" : "text-slate-600"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};