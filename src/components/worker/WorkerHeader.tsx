"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { APP_NAME } from "@/lib/constants";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import {
  Menu,
  Bell,
  LogOut,
  Factory,
  CheckCircle2,
  FileText,
  X,
  User as UserIcon,
} from "lucide-react";

interface WorkerHeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export function WorkerHeader({ setMobileOpen }: WorkerHeaderProps) {
  const { currentUser, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: "1",
      title: "July 2026 Salary Statement Shared",
      desc: "Admin released your monthly salary statement (Net Payable: Rs. 19,900).",
      time: "1 hour ago",
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      id: "2",
      title: "Production Log Confirmed",
      desc: "Your daily entry of 100 pcs for Stitching was recorded.",
      time: "Today",
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-50",
    },
  ];

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

        <Link href="/worker" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold shadow-xs">
            <Factory className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm block leading-none tracking-tight">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
              Worker Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Actions, Role Switcher & Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher for seamless testing */}
        <div className="hidden sm:block">
          <RoleSwitcher />
        </div>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadCount(0);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            )}
          </button>

          {/* Notifications Modal Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors flex gap-2.5 items-start"
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${n.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 leading-tight">{n.title}</p>
                        <p className="text-[11px] text-slate-600 leading-normal">{n.desc}</p>
                        <span className="text-[9px] font-medium text-slate-400 block pt-0.5">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-2 mt-2 text-center">
                <Link
                  href="/worker/statements"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  View Salary Statements →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <Link
            href="/worker/profile"
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name || "Worker"}</p>
              <p className="text-[10px] text-slate-500 leading-none">Worker Portal</p>
            </div>
          </Link>

          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
