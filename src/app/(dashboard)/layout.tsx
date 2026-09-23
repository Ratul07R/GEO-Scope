"use client";

import { useState, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1440px] animate-[fadeUp_0.4s_ease-out]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
