"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/data/navigation";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/cn";
import { Lock } from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between py-5 transition-transform duration-200 ease-in-out lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 overflow-y-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="space-y-4 px-4">
        {/* We can have a small Brand/Logo area if needed, otherwise standard menu title */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation Menu
          </div>
          <nav className="space-y-0.5">
            {NAVIGATION_ITEMS.map((item) => {
              const hasPermission = item.roles.includes(currentUser.role);
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              if (!hasPermission) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 cursor-not-allowed opacity-50"
                    title="Admin Only"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item.title}</span>
                    </div>
                    <Lock className="h-3 w-3 text-slate-400" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold",
                      isActive ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-700"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-4 py-3 mx-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          Piece Rate Wagers v1.0
        </p>
        <p className="text-[11px] mt-0.5">
          Active: <span className="font-semibold text-slate-600">{currentUser.role}</span>
        </p>
      </div>
    </aside>
  </>
);
}
