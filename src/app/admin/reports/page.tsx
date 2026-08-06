"use client";

import React, { useState } from "react";
import LabourWiseReport from "@/components/reports/LabourWiseReport";
import DepartmentWiseReport from "@/components/reports/DepartmentWiseReport";
import MonthlyPayrollReport from "@/components/reports/MonthlyPayrollReport";
import { UserCheck, Building2, CalendarRange } from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"labour" | "department" | "monthly">("labour");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Payroll & Production Analytical Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Detailed reports on worker piece productivity, department cost allocation, and monthly payroll trends.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 gap-1">
        <button
          onClick={() => setActiveTab("labour")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "labour"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Labour-Wise Summary</span>
        </button>

        <button
          onClick={() => setActiveTab("department")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "department"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Department-Wise Summary</span>
        </button>

        <button
          onClick={() => setActiveTab("monthly")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "monthly"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarRange className="h-4 w-4" />
          <span>Monthly Payroll Run History</span>
        </button>
      </div>

      <div>
        {activeTab === "labour" && <LabourWiseReport />}
        {activeTab === "department" && <DepartmentWiseReport />}
        {activeTab === "monthly" && <MonthlyPayrollReport />}
      </div>
    </div>
  );
}
