"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { useMasterDataStore } from "@/store/masterData.store";
import { useProductionStore } from "@/store/production.store";
import { formatDate } from "@/lib/format-date";
import {
  History,
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RotateCcw,
} from "lucide-react";

export default function WorkerProductionHistoryPage() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { workers } = useWorkerStore();
  const { articles, operations } = useMasterDataStore();
  const { entries } = useProductionStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const currentWorkerRecord =
    workers.find(
      (w) =>
        w.name.toLowerCase() === currentUser?.name?.toLowerCase() ||
        w.workerCode.toLowerCase() === currentUser?.name?.toLowerCase()
    ) || workers[0];

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedArticle, setSelectedArticle] = useState("ALL");
  const [selectedOperation, setSelectedOperation] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter entries for this specific worker
  const myEntries = useMemo(() => {
    return entries.filter((e) => e.workerId === currentWorkerRecord?.id);
  }, [entries, currentWorkerRecord]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    return myEntries.filter((entry) => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        (entry.articleName || "").toLowerCase().includes(searchLower) ||
        (entry.operationName || "").toLowerCase().includes(searchLower);

      // Date Range
      const matchStart = !startDate || entry.date >= startDate;
      const matchEnd = !endDate || entry.date <= endDate;

      // Dropdown Filters
      const matchArt = selectedArticle === "ALL" || entry.articleId === selectedArticle;
      const matchOp = selectedOperation === "ALL" || entry.operationId === selectedOperation;

      return matchSearch && matchStart && matchEnd && matchArt && matchOp;
    });
  }, [myEntries, searchQuery, startDate, endDate, selectedArticle, selectedOperation]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage]);

  // Totals summary for current filtered set
  const totalFilteredPieces = filteredEntries.reduce((sum, e) => sum + e.quantity, 0);
  const totalFilteredEarned = filteredEntries.reduce((sum, e) => sum + e.totalPayment, 0);

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSelectedArticle("ALL");
    setSelectedOperation("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-600" />
            <span>My Production History</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review and search all daily piece records submitted under your profile.
          </p>
        </div>

        <Link
          href="/worker/production"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Production Entry</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search article/op..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none bg-white font-medium"
            />
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none bg-white font-medium"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none bg-white font-medium"
            />
          </div>

          {/* Article Filter */}
          <div>
            <select
              value={selectedArticle}
              onChange={(e) => {
                setSelectedArticle(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">All Articles</option>
              {articles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.name}
                </option>
              ))}
            </select>
          </div>

          {/* Operation Filter */}
          <div>
            <select
              value={selectedOperation}
              onChange={(e) => {
                setSelectedOperation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">All Operations</option>
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset Button */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Found: <strong className="text-slate-900">{filteredEntries.length}</strong> records
            </span>
            <span>
              Total Quantity: <strong className="text-slate-900">{totalFilteredPieces} pcs</strong>
            </span>
            <span>
              Total Earnings: <strong className="text-emerald-700">Rs. {totalFilteredEarned.toLocaleString()}</strong>
            </span>
          </div>

          <button
            onClick={resetFilters}
            className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Production History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ClipboardList className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No production records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No production records matched your search filters, or you have not logged any work yet.
            </p>
            <div className="pt-2">
              <Link
                href="/worker/production"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Start By Adding Today&apos;s Production</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Article Model</th>
                    <th className="px-4 py-3">Operation Done</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-right">Rate / Pc</th>
                    <th className="px-4 py-3 text-right">Total Payment</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-600 font-bold whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{entry.articleName}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.operationName}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                        {entry.quantity} pcs
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-semibold">
                        Rs. {entry.rateApplied.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700">
                        Rs. {entry.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
                  <strong className="text-slate-900">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
