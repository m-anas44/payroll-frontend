"use client";

import React from "react";
import Link from "next/link";
import {
  UserPlus,
  ClipboardPlus,
  Calculator,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface QuickActionsProps {
  onOpenNewWorker?: () => void;
  onOpenDailyProduction?: () => void;
  onOpenPayroll?: () => void;
}

export default function QuickActions({
  onOpenNewWorker,
  onOpenDailyProduction,
  onOpenPayroll,
}: QuickActionsProps) {
  const { currentUser } = useAuthStore();

  const actions = [
    {
      title: "Log Daily Production",
      desc: "Record piece quantity completed by workers today",
      href: "/admin/production",
      icon: ClipboardPlus,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      roles: ["Admin", "Worker"],
      onClick: onOpenDailyProduction,
    },
    {
      title: "Register New Worker",
      desc: "Add worker personal, CNIC, and department details",
      href: "/admin/workers",
      icon: UserPlus,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
      roles: ["Admin"],
      onClick: onOpenNewWorker,
    },
    {
      title: "Generate Monthly Payroll",
      desc: "Calculate total piece-rate earnings for current month",
      href: "/admin/payroll",
      icon: Calculator,
      color: "bg-purple-600 hover:bg-purple-700 text-white",
      roles: ["Admin"],
      onClick: onOpenPayroll,
    },
    {
      title: "View Labour Reports",
      desc: "Analyze individual worker production & payout totals",
      href: "/admin/reports",
      icon: FileSpreadsheet,
      color: "bg-slate-800 hover:bg-slate-900 text-white",
      roles: ["Admin", "Worker"],
      onClick: undefined,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <h2 className="text-sm font-bold text-slate-900 mb-3">
        Quick Action Hub
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions
          .filter((a) => a.roles.includes(currentUser.role))
          .map((action) => {
            const Icon = action.icon;
            const content = (
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all hover:shadow-xs group w-full text-left cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${action.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            );

            if (action.onClick) {
              return (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  type="button"
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link key={action.title} href={action.href}>
                {content}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
