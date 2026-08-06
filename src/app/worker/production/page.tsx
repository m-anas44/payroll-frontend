"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { useMasterDataStore } from "@/store/masterData.store";
import { useProductionStore } from "@/store/production.store";
import { formatDate } from "@/lib/format-date";
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default function WorkerDailyProductionPage() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { workers } = useWorkerStore();
  const { articles, operations, getApplicableRate } = useMasterDataStore();
  const { addEntry, entries } = useProductionStore();
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

  const todayStr = new Date().toISOString().split("T")[0];

  // Form State
  const [date, setDate] = useState(todayStr);
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [selectedOperationId, setSelectedOperationId] = useState("");
  const [quantity, setQuantity] = useState<number | "">(50);
  const [notes, setNotes] = useState("");

  // Feedback State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Operations filtered by worker's department
  const departmentOps = operations.filter(
    (o) => !currentWorkerRecord?.departmentId || o.departmentId === currentWorkerRecord.departmentId
  );
  const availableOps = departmentOps.length > 0 ? departmentOps : operations;

  const activeArticleId = selectedArticleId || (articles[0]?.id || "");
  const activeOperationId = selectedOperationId || (availableOps[0]?.id || "");

  // Rate calculation
  const applicableRate = activeOperationId
    ? getApplicableRate(activeOperationId, date)
    : 0;
  const estimatedPay = (Number(quantity) || 0) * applicableRate;

  // Form Submission Helper
  const handleSubmitProduction = (addAnother = false) => {
    setErrorMsg(null);

    // Validation
    if (!date) {
      setErrorMsg("Please select a valid production date.");
      return;
    }
    if (date > todayStr) {
      setErrorMsg("Future dates are not allowed for production entries.");
      return;
    }
    if (!activeArticleId) {
      setErrorMsg("Please select an article / shoe model.");
      return;
    }
    if (!activeOperationId) {
      setErrorMsg("Please select an operation.");
      return;
    }
    const qtyNum = Number(quantity);
    if (!qtyNum || qtyNum <= 0) {
      setErrorMsg("Quantity produced must be greater than zero.");
      return;
    }

    const artObj = articles.find((a) => a.id === activeArticleId);
    const opObj = operations.find((o) => o.id === activeOperationId);

    const newEntry = {
      date,
      workerId: currentWorkerRecord.id,
      workerName: currentWorkerRecord.name,
      departmentId: currentWorkerRecord.departmentId,
      departmentName: currentWorkerRecord.departmentName || "General",
      articleId: artObj?.id || "",
      articleName: artObj?.name || "Article",
      operationId: opObj?.id || "",
      operationName: opObj?.name || "Operation",
      quantity: qtyNum,
      rateApplied: applicableRate,
      createdBy: currentWorkerRecord.name || "Worker Portal",
      notes: notes.trim() || undefined,
    };

    addEntry(newEntry);

    const totalEarned = qtyNum * applicableRate;
    setSuccessBanner(
      `Successfully saved ${qtyNum} pcs for "${opObj?.name}" (+Rs. ${totalEarned.toLocaleString()})!`
    );

    if (addAnother) {
      // Reset quantity and notes for quick next entry
      setQuantity(50);
      setNotes("");
    } else {
      setTimeout(() => {
        router.push("/worker/history");
      }, 1500);
    }
  };

  // Recent entries for this worker
  const myEntries = entries.filter((e) => e.workerId === currentWorkerRecord?.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-emerald-600" />
            <span>Daily Production Entry</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Log the quantity of pieces completed today for piece-rate compensation.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Production Submission Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitProduction(false);
          }}
          className="space-y-4 text-xs"
        >
          {/* Worker Auto Info Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Worker Profile</span>
              <span className="font-bold text-slate-900">{currentWorkerRecord?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="font-bold text-emerald-700">{currentWorkerRecord?.departmentName}</span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Field 1: Production Date */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                max={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none bg-white"
                required
              />
              <span className="text-[10px] text-slate-400">Future dates are restricted.</span>
            </div>

            {/* Field 2: Article / Shoe Model */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Article / Shoe Model <span className="text-rose-500">*</span>
              </label>
              <select
                value={activeArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none bg-white"
                required
              >
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.name} ({art.articleCode || art.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Operation */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700">
                Operation Executed <span className="text-rose-500">*</span>
              </label>
              <select
                value={activeOperationId}
                onChange={(e) => setSelectedOperationId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none bg-white"
                required
              >
                {availableOps.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.operationCode}) — {op.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4: Quantity Produced & Quick Options */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-slate-700">
                  Quantity Produced (Pieces) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Tap preset or type</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 font-extrabold text-base focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. 50"
                  required
                />
                <div className="flex gap-1.5 overflow-x-auto">
                  {[25, 50, 75, 100, 150].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                        quantity === num
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field 5: Optional Notes */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700">Optional Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Completed extra batch during shift 2"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 font-normal focus:border-emerald-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Rate & Live Payment Calculation Box */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Applicable Piece Rate
              </span>
              <p className="text-base font-black text-emerald-950">
                Rs. {applicableRate.toFixed(2)}{" "}
                <span className="text-xs font-medium text-emerald-700">/ completed piece</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Estimated Total Pay
              </span>
              <p className="text-2xl font-black text-emerald-700">
                Rs. {estimatedPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setQuantity(50);
                setNotes("");
                setErrorMsg(null);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmitProduction(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Save & Add Another</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Production Entry</span>
            </button>
          </div>

        </form>
      </div>

      {/* Today's Logged Summary List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submitted Production Entries ({myEntries.length})
            </h3>
          </div>
          <button
            onClick={() => router.push("/worker/history")}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
          >
            View Full Log History <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {myEntries.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No production records submitted yet. Use the form above to log today&apos;s work.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 font-bold">Date</th>
                  <th className="py-2 font-bold">Article</th>
                  <th className="py-2 font-bold">Operation</th>
                  <th className="py-2 font-bold text-right">Quantity</th>
                  <th className="py-2 font-bold text-right">Rate</th>
                  <th className="py-2 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myEntries.slice(0, 4).map((e, idx) => (
                  <tr key={e.id} className={idx === 0 ? "bg-emerald-50/40 font-bold" : ""}>
                    <td className="py-2.5 text-slate-500 whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="py-2.5 font-bold text-slate-900">{e.articleName}</td>
                    <td className="py-2.5 text-slate-700">{e.operationName}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{e.quantity} pcs</td>
                    <td className="py-2.5 text-right text-slate-500">Rs. {e.rateApplied}</td>
                    <td className="py-2.5 text-right font-black text-emerald-600">Rs. {e.totalPayment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
