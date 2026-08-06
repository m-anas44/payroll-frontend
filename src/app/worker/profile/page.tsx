"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";
import { formatDate } from "@/lib/format-date";
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Lock,
  Save,
  AlertCircle,
} from "lucide-react";

export default function WorkerProfilePage() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { workers, updateWorker } = useWorkerStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const currentWorker =
    workers.find(
      (w) =>
        w.name.toLowerCase() === currentUser?.name?.toLowerCase() ||
        w.workerCode.toLowerCase() === currentUser?.name?.toLowerCase()
    ) || workers[0];

  // Editable fields state
  const [contactInput, setContactInput] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState<string | null>(null);

  // Feedback state
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const contact = contactInput !== null ? contactInput : (currentWorker?.contact || "");
  const address = addressInput !== null ? addressInput : (currentWorker?.address || "");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!contact.trim()) {
      setErrorMsg("Contact number cannot be empty.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Address cannot be empty.");
      return;
    }

    const res = updateWorker(currentWorker.id, {
      contact: contact.trim(),
      address: address.trim(),
    });

    if (res.success) {
      setToastMsg("Contact details updated successfully!");
      setIsEditing(false);
      setTimeout(() => setToastMsg(null), 3000);
    } else {
      setErrorMsg(res.message);
    }
  };

  if (!currentWorker) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
        Loading worker profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-emerald-600" />
          <span>My Worker Profile</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          View your registered personal details and update your contact information.
        </p>
      </div>

      {/* Success Banner */}
      {toastMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-2xl shadow-md">
          {currentWorker.name.charAt(0)}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-black text-slate-900">{currentWorker.name}</h2>
            <span className="rounded-md bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2 py-0.5 border border-emerald-200">
              {currentWorker.workerCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {currentWorker.departmentName} • {currentWorker.skill || "Specialist Worker"}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Police Verification: {currentWorker.policeVerification}
          </span>
        </div>
      </div>

      {/* Profile Information Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Personal & Work Particulars
          </h3>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Lock className="h-3 w-3 text-slate-400" /> Admin Protected Fields
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Read-Only Field: Name */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                value={currentWorker.name}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            {/* Read-Only Field: CNIC */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" /> CNIC Number
              </label>
              <input
                type="text"
                value={currentWorker.cnic}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            {/* Read-Only Field: Department */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" /> Department
              </label>
              <input
                type="text"
                value={currentWorker.departmentName}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            {/* Read-Only Field: Date of Joining */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date of Joining
              </label>
              <input
                type="text"
                value={formatDate(currentWorker.doj || "2024-01-01")}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            {/* Editable Field 1: Contact Number */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-600" /> Contact Number (Editable)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => {
                  setContactInput(e.target.value);
                  setIsEditing(true);
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none bg-white"
                placeholder="0300-1234567"
                required
              />
            </div>

            {/* Read-Only Field: Police Verification */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Police Verification
              </label>
              <input
                type="text"
                value={currentWorker.policeVerification}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-emerald-700 font-extrabold cursor-not-allowed"
              />
            </div>

            {/* Editable Field 2: Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-800 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Residential Address (Editable)
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  setIsEditing(true);
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none bg-white"
                placeholder="Full address details..."
                required
              />
            </div>

          </div>

          {/* Action Button */}
          {isEditing && (
            <div className="pt-2 flex justify-end animate-fadeIn">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}
