"use client";

import Link from "next/link";
import { Compass, Smartphone } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { PoufaLogo } from "@/components/poufa-logo";
import { NavList } from "@/components/layout/nav-list";
import { SyncStatusBadge } from "@/components/layout/sync-status";
import { startGuidedTour } from "@/components/onboarding/guided-tour";

export function PoufaSidebar() {
  return (
    <Sidebar
      id="poufa-sidebar"
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
    >
      {/* ── Brand Header Lockup ── */}
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-4">
        <PoufaLogo />
      </SidebarHeader>

      {/* ── Domain Navigation (POUFA Field Symbols) ── */}
      <SidebarContent className="px-2 py-3">
        <NavList />
      </SidebarContent>

      {/* ── Footer Affordances ── */}
      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        <SyncStatusBadge />
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-sidebar-border/60">
          <button
            type="button"
            onClick={() => startGuidedTour()}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Compass className="size-3.5 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
            <span>Visite guidée</span>
          </button>

          <Link
            href="/telecharger"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            title="Télécharger l'APK Android"
          >
            <Smartphone className="size-3.5" />
            <span>APK Android</span>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
