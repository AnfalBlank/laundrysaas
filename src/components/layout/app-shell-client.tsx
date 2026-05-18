"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export interface TenantInfo {
  name: string;
  branchCount: number;
  primaryColor: string;
  logoUrl: string | null;
}

export function AppShellClient({
  children,
  title,
  subtitle,
  tenant,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  tenant: TenantInfo;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      {/* Decorative floating bubbles - fixed background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-br from-primary-200/30 to-accent-200/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-100/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-br from-purple-200/20 to-pink-100/20 blur-3xl" />
      </div>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tenant={tenant}
      />

      <main className="lg:pl-64 min-h-screen">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="px-4 sm:px-5 py-4 sm:py-5 lg:px-7 lg:py-6">{children}</div>
      </main>
    </div>
  );
}
