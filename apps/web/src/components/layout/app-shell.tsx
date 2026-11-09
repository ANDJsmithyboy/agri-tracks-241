"use client";

import type { ReactNode } from "react";
import { RoleProvider } from "@/components/layout/role-provider";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { PoufaSidebar } from "@/components/layout/poufa-sidebar";
import { PoufaHeader } from "@/components/layout/topbar";
import { OfflineBanner } from "@/components/layout/sync-status";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <SidebarProvider
        defaultOpen={true}
        style={
          {
            "--sidebar-width": "15.5rem",
            "--sidebar-width-mobile": "18rem",
          } as React.CSSProperties
        }
      >
        <PoufaSidebar />
        <SidebarInset>
          <PoufaHeader />
          <OfflineBanner />
          <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <WelcomeModal />
    </RoleProvider>
  );
}
