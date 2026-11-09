"use client";

import Link from "next/link";
import { Compass, Menu, Smartphone } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { PoufaLogo } from "@/components/poufa-logo";
import { NavList } from "@/components/layout/nav-list";
import { SyncStatusBadge } from "@/components/layout/sync-status";
import { startGuidedTour } from "@/components/onboarding/guided-tour";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PoufaSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      id="poufa-sidebar"
      side="left"
      variant="sidebar"
      collapsible="icon"
    >
      {/* ── Brand Header Lockup + Hamburger Toggle inside Sidebar ── */}
      <SidebarHeader
        className={cn(
          "h-14 border-b border-sidebar-border shrink-0 transition-all",
          isCollapsed
            ? "flex flex-col items-center justify-center p-0"
            : "flex flex-row items-center justify-between px-3"
        )}
      >
        {isCollapsed ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Agrandir la navigation"
            title="Agrandir la navigation (Ctrl+B)"
            className="size-10 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent flex items-center justify-center transition-colors"
          >
            <Menu className="size-5 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
          </Button>
        ) : (
          <>
            <Link
              href="/tableau-de-bord"
              className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90"
              title="Aller au tableau de bord"
            >
              <PoufaLogo />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Réduire la navigation"
              title="Réduire la navigation (Ctrl+B)"
              className="size-8 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground shrink-0 transition-colors"
            >
              <Menu className="size-4" />
            </Button>
          </>
        )}
      </SidebarHeader>

      {/* ── Domain Navigation (POUFA Field Symbols) ── */}
      <SidebarContent className={cn("py-2", isCollapsed ? "px-1" : "px-2")}>
        <NavList collapsed={isCollapsed} />
      </SidebarContent>

      {/* ── Footer Affordances ── */}
      <SidebarFooter
        className={cn(
          "border-t border-sidebar-border shrink-0",
          isCollapsed ? "p-2 space-y-2 flex flex-col items-center" : "p-3 space-y-2"
        )}
      >
        <SyncStatusBadge compact={isCollapsed} />
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 pt-1 border-t border-sidebar-border/60 w-full">
            <button
              type="button"
              onClick={() => startGuidedTour()}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="Lancer la visite guidée"
              aria-label="Visite guidée"
            >
              <Compass className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
            </button>
            <Link
              href="/telecharger"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="Télécharger l'APK Android"
              aria-label="Télécharger l'APK Android"
            >
              <Smartphone className="size-4" />
            </Link>
          </div>
        ) : (
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
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

