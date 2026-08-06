"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Shield, User } from "lucide-react";

export function RoleSwitcher() {
  const { currentUser, setRole } = useAuthStore();
  const router = useRouter();

  const handleSwitchRole = (role: "Admin" | "Worker") => {
    setRole(role);
    if (role === "Admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/worker");
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
      <button
        onClick={() => handleSwitchRole("Admin")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
          currentUser.role === "Admin"
            ? "bg-white text-blue-600 shadow-xs border border-slate-200/50"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        Admin
      </button>

      <button
        onClick={() => handleSwitchRole("Worker")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
          currentUser.role === "Worker"
            ? "bg-white text-emerald-600 shadow-xs border border-slate-200/50"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        }`}
      >
        <User className="w-3.5 h-3.5" />
        Worker
      </button>
    </div>
  );
}

export default RoleSwitcher;
