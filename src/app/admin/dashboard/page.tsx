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

import Heading from "@/components/common/Heading";

export default function DashboardPage() {
  const { workers } = useWorkerStore();
  const { entries } = useProductionStore();
  const { departments, rates } = useMasterDataStore();

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const activeWorkersCount = workers.filter((w) => w.status === "active").length;

  const currentMonthStr = getCurrentMonthStr();
  const currentMonthEntries = entries.filter((e) => e.date?.startsWith(currentMonthStr));

  const totalMonthlyPieces = currentMonthEntries.reduce((sum, e) => sum + e.quantity, 0);
  const totalMonthlyPayout = currentMonthEntries.reduce((sum, e) => sum + (e.totalPayment || 0), 0);

  const activeRates = rates.filter((r) => r.status === "active");
  const avgRate =
    activeRates.length > 0
      ? activeRates.reduce((s, r) => s + r.amount, 0) / activeRates.length
      : 0;

  return (
    <div className="space-y-6">
      <Heading
        title="Piece-Rate Payroll Command Center"
        subtitle="Real-time monitoring of worker output, piece rates, daily logs, and monthly wage disbursements."
        badge={
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Rates Locked & Validated</span>
          </span>
        }
      />

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
                const deptWorkers = workers.filter((w) => w.departmentId === dept._id).length;
                const deptEntries = currentMonthEntries.filter((e) => e.departmentId === dept._id);
                const deptPieces = deptEntries.reduce((s, e) => s + e.quantity, 0);

                const percent = totalMonthlyPieces > 0 ? (deptPieces / totalMonthlyPieces) * 100 : 0;

                return (
                  <div key={dept._id} className="space-y-1">
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
    </div>
  );
}
