"use client";

import { useState, type ReactNode } from "react";
import { RoleProvider } from "@/components/layout/role-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  MobileBottomNav,
  MobileMenuSheet,
} from "@/components/layout/mobile-nav";
import { OfflineBanner } from "@/components/layout/sync-status";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <RoleProvider>
      <div className="flex min-h-dvh bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMenuOpen(true)} />
          <OfflineBanner />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav onOpenMenu={() => setMenuOpen(true)} />
      <MobileMenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </RoleProvider>
  );
}
