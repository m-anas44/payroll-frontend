"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKER_NAVIGATION_ITEMS } from "@/data/navigation";
import { useAuthStore } from "@/store/auth.store";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { Factory, LogOut, X } from "lucide-react";

interface WorkerSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function WorkerSidebar({ mobileOpen, setMobileOpen }: WorkerSidebarProps) {
  const pathname = usePathname();
  const { logout, currentUser } = useAuthStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between py-5 transition-transform duration-200 ease-in-out lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 overflow-y-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="space-y-6 px-4">
          {/* Mobile Header Inside Drawer */}
          <div className="flex items-center justify-between lg:hidden border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
                <Factory className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block leading-none">{APP_NAME}</span>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase">Worker Portal</span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Profile Summary Badge */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              {currentUser?.name?.charAt(0) || "W"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || "Worker User"}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Worker
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Worker Menu
            </p>
            {WORKER_NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              // Check exact match for /worker, or startsWith for subroutes
              const isActive =
                item.href === "/worker"
                  ? pathname === "/worker"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="px-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
