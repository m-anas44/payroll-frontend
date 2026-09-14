"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { logout } from "@/handlers/authHandler";
import { APP_NAME } from "@/lib/constants";
import {
  Menu,
  LogOut,
  Factory,
  User as UserIcon,
} from "lucide-react";

interface WorkerHeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export function OperatorHeader({ setMobileOpen }: WorkerHeaderProps) {
  const { currentUser } = useAuthStore();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs lg:px-8">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/operator" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold shadow-xs">
            <Factory className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm block leading-none tracking-tight">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              Operator Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Actions, Role Switcher & Profile */}
      <div className="flex items-center gap-3">

        {/* User Pill & Sign Out */}
        <div className="flex items-center gap-2 px-2">
          <Link
            href="/operator/settings"
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title="Account Settings"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name || "Operator"}</p>
              <p className="text-[10px] text-slate-500 leading-none">Operator Portal</p>
            </div>
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center justify-center p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
