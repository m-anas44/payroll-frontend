"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Building, Shield, User, Key, AlertCircle } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";
import { login as loginRequest } from "@/handlers/authHandler";

type AuthTab = "Admin" | "Worker";

function mapBackendRole(role: string): AuthTab {
  if (role === "admin") return "Admin";
  if (role === "data_entry_operator") return "Worker";
  return "Worker";
}

export default function LoginPage() {
  const { login, isAuthenticated, currentUser } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AuthTab>("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(currentUser.role === "Admin" ? "/admin/dashboard" : "/worker");
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginRequest({ email, password });
      console.log(response)
      const backendUser = response.user;
      const mappedRole = mapBackendRole(backendUser.role);

      login({
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role: mappedRole,
        active: true,
        createdAt: new Date().toISOString().split("T")[0],
      });

      router.push(mappedRole === "Admin" ? "/admin/dashboard" : "/worker");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetLogin = async (role: AuthTab) => {
    const presetEmail = role === "Admin" ? "admin@piecerate.com" : "operator@example.com";
    const presetPassword = "password123";
    setActiveTab(role);
    setEmail(presetEmail);
    setPassword(presetPassword);
    setError("");

    setLoading(true);

    try {
      const response = await loginRequest({ email: presetEmail, password: presetPassword });
      const backendUser = response.user;
      const mappedRole = mapBackendRole(backendUser.role);

      login({
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role: mappedRole,
        active: true,
        createdAt: new Date().toISOString().split("T")[0],
      });

      router.push(mappedRole === "Admin" ? "/admin/dashboard" : "/worker");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md mb-4">
          <Building className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{APP_NAME}</h2>
        <p className="mt-1 text-xs text-slate-500 font-medium uppercase tracking-wider">{COMPANY_NAME}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-sm rounded-xl sm:px-10">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200/50 mb-6">
            <button
              type="button"
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
              type="button"
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
              <span>Operator Portal</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                  placeholder={activeTab === "Admin" ? "admin@piecerate.com" : "operator@example.com"}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 text-xs text-slate-900"
                />
              </div>
            </div>

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

          <div className="mt-4 text-center text-[11px] text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-blue-600 underline">
              Create one now
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Sandbox Access
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
                <span>Demo Operator</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
