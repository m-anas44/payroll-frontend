"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import Heading from "@/components/common/Heading";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { getCurrentMonthStr, formatMonthYear } from "@/lib/format-date";
import { Users, Layers, Coins, Building2, TrendingUp, ShieldCheck } from "lucide-react";
import { getWorkers } from "@/handlers/worker.handler";
import { getDepartments } from "@/handlers/department.handler";
import { getRates } from "@/handlers/rate.handler";
import { getPayrollByMonth } from "@/handlers/payroll.handler";
import { ReportHandler } from "@/handlers/report.handler";
import { Department } from "@/types/department";

interface DeptOutputShare {
  id: string;
  name: string;
  workerCount: number;
  pieces: number;
  percent: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeWorkersCount, setActiveWorkersCount] = useState(0);
  const [totalWorkersCount, setTotalWorkersCount] = useState(0);
  const [totalMonthlyPieces, setTotalMonthlyPieces] = useState(0);
  const [totalMonthlyPayout, setTotalMonthlyPayout] = useState(0);
  const [activeRatesCount, setActiveRatesCount] = useState(0);
  const [avgRate, setAvgRate] = useState(0);
  const [deptShares, setDeptShares] = useState<DeptOutputShare[]>([]);

  const currentMonthStr = getCurrentMonthStr();
  const currentMonthDisplay = formatMonthYear(currentMonthStr);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);

      try {
        // Parallel requests using existing system handlers
        const [
          activeWorkersRes,
          allWorkersRes,
          deptList,
          ratesRes,
          payrollRes,
          deptReportRes,
        ] = await Promise.allSettled([
          getWorkers({ status: "active", limit: 1 }),
          getWorkers({ limit: 1 }),
          getDepartments(),
          getRates({ status: "active", limit: 100 }),
          getPayrollByMonth(currentMonthStr),
          ReportHandler.getDepartmentWiseReportFromBackend(currentMonthStr),
        ]);

        if (!isMounted) return;

        // 1. Worker Counts
        if (activeWorkersRes.status === "fulfilled") {
          setActiveWorkersCount(activeWorkersRes.value?.total ?? 0);
        }
        if (allWorkersRes.status === "fulfilled") {
          setTotalWorkersCount(allWorkersRes.value?.total ?? 0);
        }

        // 2. Active Rates & Average Rate
        if (ratesRes.status === "fulfilled" && ratesRes.value?.success) {
          const rateItems = ratesRes.value.items || [];
          setActiveRatesCount(ratesRes.value.total ?? rateItems.length);
          if (rateItems.length > 0) {
            const sum = rateItems.reduce(
              (acc: number, r: any) => acc + Number(r.rate || 0),
              0
            );
            setAvgRate(sum / rateItems.length);
          } else {
            setAvgRate(0);
          }
        }

        // 3. Current Month Payroll Totals
        let monthlyPieces = 0;
        let monthlyPayout = 0;
        if (payrollRes.status === "fulfilled" && payrollRes.value) {
          const payroll = payrollRes.value;
          monthlyPieces = Number(payroll.totalProductionQuantity || 0);
          monthlyPayout = Number(payroll.totalGrossAmount || payroll.totalNetAmount || 0);
        }
        setTotalMonthlyPieces(monthlyPieces);
        setTotalMonthlyPayout(monthlyPayout);

        // 4. Department Output Share
        const departments: Department[] =
          deptList.status === "fulfilled" && Array.isArray(deptList.value)
            ? deptList.value
            : [];

        const deptReportItems =
          deptReportRes.status === "fulfilled" && Array.isArray(deptReportRes.value)
            ? deptReportRes.value
            : [];

        const shares: DeptOutputShare[] = departments.map((dept) => {
          const reportMatch = deptReportItems.find(
            (r: any) =>
              r.departmentId === dept._id ||
              r.departmentName?.toLowerCase() === dept.name?.toLowerCase()
          );

          const pieces = reportMatch ? Number(reportMatch.totalProduction || 0) : 0;
          const percent =
            monthlyPieces > 0 ? (pieces / monthlyPieces) * 100 : 0;

          return {
            id: dept._id,
            name: dept.name,
            workerCount: dept.workerCount ?? 0,
            pieces,
            percent,
          };
        });

        setDeptShares(shares);
      } catch {
        // Handlers already log or handle errors gracefully
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [currentMonthStr]);

  return (
    <div className="space-y-6">
      <Heading
        title="Piece-Rate Payroll Command Center"
        subtitle="Real-time monitoring of worker output, piece rates, daily logs, and monthly wage disbursements."
        badge={
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Live Data Feed</span>
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workers"
          value={isLoading ? "..." : activeWorkersCount}
          subtitle={`Total Registered: ${isLoading ? "..." : totalWorkersCount}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Monthly Output"
          value={
            isLoading
              ? "..."
              : `${formatQuantity(totalMonthlyPieces)} Pcs`
          }
          subtitle={`This Month (${currentMonthDisplay})`}
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Gross Monthly Earnings"
          value={
            isLoading
              ? "..."
              : formatCurrency(totalMonthlyPayout)
          }
          subtitle="Cumulative Piece Payout"
          icon={Coins}
          color="emerald"
        />
        <StatCard
          title="Average Piece Rate"
          value={
            isLoading
              ? "..."
              : formatCurrency(avgRate)
          }
          subtitle={`${isLoading ? "..." : activeRatesCount} Active Approved Rates`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-purple-600" />
              Department Output Share
            </h3>

            {isLoading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : deptShares.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No department records available.
              </p>
            ) : (
              <div className="space-y-4">
                {deptShares.map((dept) => (
                  <div key={dept.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {dept.name}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {formatQuantity(dept.pieces)} Pcs ({dept.workerCount} workers)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(dept.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Payroll Cycle Status
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Current cycle is tracking logs for <strong>{currentMonthDisplay}</strong>. Piece-rate wages are dynamically tallied based on verified worker logs.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Month Code:</span>
                <span className="font-mono font-bold text-slate-900">{currentMonthStr}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Operators:</span>
                <span className="font-bold text-slate-900">Configured</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Piece Rates:</span>
                <span className="font-bold text-emerald-700">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}