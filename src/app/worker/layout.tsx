"use client";

import { useState } from "react";
import { WorkerHeader } from "@/components/worker/WorkerHeader";
import { WorkerSidebar } from "@/components/worker/WorkerSidebar";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <WorkerHeader setMobileOpen={setMobileOpen} />
      <div className="flex flex-1">
        <WorkerSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
