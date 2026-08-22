"use client";

import React, { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import WorkerModal from "@/components/worker/WorkerModal";
import ProductionModal from "@/components/production/BatchProductionModal";
import GeneratePayrollModal from "@/components/payroll/GeneratePayrollModal";
import { useWorkerStore } from "@/store/worker.store";
import { useProductionStore } from "@/store/production.store";
import { useMasterDataStore } from "@/store/masterData.store";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { getCurrentMonthStr } from "@/lib/format-date";
import { Users, Layers, Coins, Building2, TrendingUp, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const { workers } = useWorkerStore();
  const { entries } = useProductionStore();
  const { departments, rates } = useMasterDataStore();

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const activeWorkersCount = workers.filter((w) => w.status === "Active").length;

  const currentMonthStr = getCurrentMonthStr();
  const currentMonthEntries = entries.filter((e) => e.date.startsWith(currentMonthStr));

  const totalMonthlyPieces = currentMonthEntries.reduce((sum, e) => sum + e.quantity, 0);
  const totalMonthlyPayout = currentMonthEntries.reduce((sum, e) => sum + e.totalPayment, 0);

  const activeRates = rates.filter((r) => r.status === "Active");
  const avgRate =
    activeRates.length > 0
      ? activeRates.reduce((s, r) => s + r.ratePerPiece, 0) / activeRates.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Piece-Rate Payroll Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring of worker output, piece rates, daily logs, and monthly wage disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Rates Locked & Validated
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workers"
          value={activeWorkersCount}
          subtitle={`Total Registered: ${workers.length}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Monthly Output"
          value={`${formatQuantity(totalMonthlyPieces)} Pcs`}
          subtitle={`This Month (${currentMonthStr})`}
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Gross Monthly Earnings"
          value={formatCurrency(totalMonthlyPayout)}
          subtitle="Cumulative Piece Payout"
          icon={Coins}
          color="emerald"
        />
        <StatCard
          title="Average Piece Rate"
          value={formatCurrency(avgRate)}
          subtitle={`${activeRates.length} Active Approved Rates`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      <QuickActions
        onOpenNewWorker={() => setIsWorkerModalOpen(true)}
        onOpenDailyProduction={() => setIsProdModalOpen(true)}
        onOpenPayroll={() => setIsPayrollModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-purple-600" />
              Department Output Share
            </h3>
            <div className="space-y-3">
              {departments.map((dept) => {
                const deptWorkers = workers.filter((w) => w.departmentId === dept.id).length;
                const deptEntries = currentMonthEntries.filter((e) => e.departmentId === dept.id);
                const deptPieces = deptEntries.reduce((s, e) => s + e.quantity, 0);

                const percent = totalMonthlyPieces > 0 ? (deptPieces / totalMonthlyPieces) * 100 : 0;

                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {dept.name}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {formatQuantity(deptPieces)} Pcs ({deptWorkers} workers)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
      />
      <ProductionModal
        isOpen={isProdModalOpen}
        onClose={() => setIsProdModalOpen(false)}
      />
      <GeneratePayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
      />
    </div>
  );
}
