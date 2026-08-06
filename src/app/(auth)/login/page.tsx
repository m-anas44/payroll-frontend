"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Building, Shield, User, Key, UserCheck, AlertCircle } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";

export default function LoginPage() {
  const { login, isAuthenticated, currentUser } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"Admin" | "Worker">("Admin");
  
  // Form fields
  const [email, setEmail] = useState("admin@piecerate.com");
  const [password, setPassword] = useState("••••••••");
  const [workerName, setWorkerName] = useState("W-1001 (Muhammad Ali)");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (currentUser?.role === "Admin") {
  //       router.push("/admin/dashboard");
  //     } else {
  //       router.push("/worker");
  //     }
  //   }
  // }, [isAuthenticated, currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      try {
        if (activeTab === "Admin") {
          if (!email.trim()) {
            setError("Please enter a valid Admin email");
            setLoading(false);
            return;
          }
          login(email, "Admin");
          router.push("/admin/dashboard");
        } else {
          if (!workerName.trim()) {
            setError("Please enter worker name or code");
            setLoading(false);
            return;
          }
          login(workerName, "Worker");
          router.push("/worker");
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "An error occurred during login";
        setError(errMsg);
        setLoading(false);
      }
    }, 600);
  };

  const handlePresetLogin = (role: "Admin" | "Worker") => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (role === "Admin") {
        login("admin@piecerate.com", "Admin");
        router.push("/admin/dashboard");
      } else {
        login("Muhammad Ali", "Worker");
        router.push("/worker");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md mb-4">
          <Building className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {APP_NAME}
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium uppercase tracking-wider">
          {COMPANY_NAME}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-sm rounded-xl sm:px-10">
          
          {/* Tab buttons */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200/50 mb-6">
            <button
              onClick={() => {
                setActiveTab("Admin");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === "Admin"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200/30"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Access</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("Worker");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === "Worker"
                  ? "bg-white text-emerald-600 shadow-xs border border-slate-200/30"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Worker Portal</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {activeTab === "Admin" ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative rounded-md shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@piecerate.com"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Security Password
                  </label>
                  <div className="relative rounded-md shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="worker-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Worker Code or Full Name
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="worker-id"
                    required
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    placeholder="Enter worker code (e.g. W-1001)"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                  Workers can log in to view their approved rates, registered details, and real-time piecework ledger.
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-bold text-white shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                  activeTab === "Admin"
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                } disabled:opacity-55`}
              >
                {loading ? "Authenticating..." : `Sign in as ${activeTab}`}
              </button>
            </div>
          </form>

          {/* Quick Sandbox Login buttons */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Sandbox Access (1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePresetLogin("Admin")}
                type="button"
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-blue-600" />
                <span>Demo Admin</span>
              </button>
              <button
                onClick={() => handlePresetLogin("Worker")}
                type="button"
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span>Demo Worker</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
