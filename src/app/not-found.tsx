"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  FileQuestion,
  ArrowLeft,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  HardHat,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  const role = currentUser?.role?.toLowerCase();

  // Determine role-aware destination and labels
  const destination = useMemo(() => {
    if (role === "admin") {
      return {
        href: "/admin/dashboard",
        label: "Return to Admin Dashboard",
        icon: LayoutDashboard,
        badge: "Administrator Session",
      };
    }
    if (role === "operator") {
      return {
        href: "/operator",
        label: "Return to Operator Station",
        icon: HardHat,
        badge: "Operator Session",
      };
    }
    return {
      href: "/login",
      label: "Go to Login",
      icon: LogIn,
      badge: "Unauthenticated",
    };
  }, [role]);

  const DestIcon = destination.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-xs mb-6">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>{destination.badge}</span>
        </div>

        {/* 404 Illustration Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner mb-6">
          <FileQuestion className="h-10 w-10" />
        </div>

        {/* Headings */}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl font-mono">
          404
        </h1>
        <h2 className="mt-2 text-base font-bold text-slate-800">
          Page Not Found
        </h2>
        <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          The route you are trying to access does not exist, has been moved, or
          your role does not have authorization to view it.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>

          <Link
            href={destination.href}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <DestIcon className="h-4 w-4" />
            <span>{destination.label}</span>
          </Link>
        </div>

        {/* System Identifier */}
        <p className="mt-12 text-[11px] text-slate-400 font-mono">
          Payroll Askari &bull; Access & Route Guard
        </p>
      </div>
    </div>
  );
}
