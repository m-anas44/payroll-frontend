"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Building, Shield, User, Key, AlertCircle } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";
import { login as loginRequest } from "@/handlers/authHandler";

type AuthRoleTab = "admin" | "worker";

export default function LoginPage() {
  const { login, isAuthenticated, currentUser } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AuthRoleTab>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const isRoleAdmin = currentUser.role?.toLowerCase() === "admin";
      router.push(isRoleAdmin ? "/admin/dashboard" : "/worker");
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payloadRole = activeTab === "worker" ? "operator" : activeTab;
      const res = await loginRequest({ email, password, role: payloadRole });

      // Store user data (including normalized role) in Zustand for UI components
      useAuthStore.getState().login(res.user, res.token);

      // Redirect based on role
      const isRoleAdmin = res.user?.role?.toLowerCase() === "admin";
      router.replace(isRoleAdmin ? "/admin/dashboard" : "/worker");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md mb-4">
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
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-xs rounded-xl sm:px-10">
          {/* Role Selection Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200/50 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("admin");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === "admin"
                  ? "bg-white text-indigo-600 shadow-xs border border-slate-200/30"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>admin Access</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("worker");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === "worker"
                  ? "bg-white text-emerald-600 shadow-xs border border-slate-200/30"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Worker Portal</span>
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Email Address
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === "admin"
                      ? "admin@piecerate.com"
                      : "worker@piecerate.com"
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password
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
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-bold text-white shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                  activeTab === "admin"
                    ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                } disabled:opacity-55`}
              >
                {loading ? "Authenticating..." : `Sign in as ${activeTab}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}