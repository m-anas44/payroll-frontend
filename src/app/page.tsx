"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function Home() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (currentUser?.role === "Worker") {
      router.push("/worker");
    } else {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, currentUser, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-medium">
      Loading workspace...
    </div>
  );
}
