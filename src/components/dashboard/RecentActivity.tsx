"use client";

import React from "react";
import { useProductionStore } from "@/store/production.store";
import { formatDate } from "@/lib/format-date";
import { formatCurrency, formatQuantity } from "@/lib/currency";
import { Clock, Factory } from "lucide-react";

export default function RecentActivity() {
  const { entries } = useProductionStore();
  const recent = entries.slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          Recent Production Log Entries
        </h2>
        <span className="text-xs text-slate-500 font-medium">
          Showing latest {recent.length}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {recent.map((item) => (
          <div
            key={item.id}
            className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-1 rounded-md transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                <Factory className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {item.workerName}
                  </span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                    {item.workerCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {item.operationName} ({item.articleName})
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">
                {formatQuantity(item.quantity)} Pcs @ {formatCurrency(item.rateApplied)}
              </div>
              <div className="text-xs font-extrabold text-emerald-600">
                {formatCurrency(item.totalPayment)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {formatDate(item.date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
