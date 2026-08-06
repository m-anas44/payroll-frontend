"use client";

import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { Building, UserCheck, Menu, LogOut } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              {APP_NAME}
            </h1>
            <p className="text-xs text-slate-500">
              {COMPANY_NAME}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {currentUser.role === "Admin" ? (
          <div className="hidden md:flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">
              Admin
            </span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 border border-slate-100">
            <UserCheck className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">
              {currentUser.name}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              {currentUser.role}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
