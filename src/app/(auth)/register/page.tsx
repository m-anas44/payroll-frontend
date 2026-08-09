"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, UserPlus, Mail, Key, Shield, AlertCircle } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";
import { register as registerRequest } from "@/handlers/authHandler";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "data_entry_operator">("data_entry_operator");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerRequest({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Registration failed. Please try again.";
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
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create a new account</h2>
        <p className="mt-1 text-xs text-slate-500 font-medium uppercase tracking-wider">{APP_NAME}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-sm rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold">
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
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
                  placeholder="At least 8 characters"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Role
              </label>
              <div className="relative rounded-md shadow-xs">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "data_entry_operator")}
                  className="block w-full appearance-none bg-white pl-3 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                >
                  <option value="data_entry_operator">Data Entry Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-bold text-white shadow-xs bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-55"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-[11px] text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-blue-600 underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
