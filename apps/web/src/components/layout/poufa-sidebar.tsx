"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, PanelLeftClose, Smartphone } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { PoufaLogo, PoufaEmblem } from "@/components/poufa-logo";
import { NavList } from "@/components/layout/nav-list";
import { AiSidebarNav } from "@/components/ai/ai-sidebar-nav";
import { SyncStatusBadge } from "@/components/layout/sync-status";
import { startGuidedTour } from "@/components/onboarding/guided-tour";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PoufaSidebar() {
  const pathname = usePathname();
  const isAiWorkspace = pathname === "/ia" || pathname?.startsWith("/ia/");
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      id="poufa-sidebar"
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
    >
      {/* ── Brand Header Lockup + Close Affordance ── */}
      <SidebarHeader className="h-14 flex-row items-center justify-between border-b border-sidebar-border px-3.5 shrink-0">
        {isAiWorkspace ? (
          <Link
            href="/tableau-de-bord"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 overflow-hidden"
            title="Retour au tableau de bord"
          >
            <PoufaEmblem className="size-7 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                POUFA AI
              </span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                Assistant avicole
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/tableau-de-bord"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 overflow-hidden"
            title="Aller au tableau de bord"
          >
            <PoufaLogo />
          </Link>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Masquer la navigation"
          title="Masquer la navigation (Ctrl+B)"
          className="size-8 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground shrink-0 transition-colors"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </SidebarHeader>

      {/* ── Adaptive Content: Conversation History on /ia, Domain Nav elsewhere ── */}
      <SidebarContent className="py-2 px-2">
        {isAiWorkspace ? <AiSidebarNav /> : <NavList />}
      </SidebarContent>

      {/* ── Calm Footer ── */}
      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2 shrink-0">
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
