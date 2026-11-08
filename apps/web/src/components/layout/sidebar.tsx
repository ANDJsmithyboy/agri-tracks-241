"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight, Compass, Smartphone } from "lucide-react";
import { startGuidedTour } from "@/components/onboarding/guided-tour";
import { NavList } from "@/components/layout/nav-list";
import { PoufaLogo } from "@/components/poufa-logo";
import { SyncStatusBadge } from "@/components/layout/sync-status";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "poufa-sidebar-collapsed";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-3.5",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <PoufaLogo compact={collapsed} />
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Réduire le menu"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ChevronsLeft className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-sidebar-border px-2 py-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Déplier le menu"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ChevronsRight className="size-4" aria-hidden />
          </button>
        </div>
      )}

      <NavList collapsed={collapsed} />

      <div className="shrink-0 border-t border-sidebar-border p-2.5">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <SyncStatusBadge compact />
            <button
              type="button"
              onClick={() => startGuidedTour()}
              title="Lancer la visite guidée"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Compass className="size-4" aria-hidden />
            </button>
            <Link
              href="/telecharger"
              title="Télécharger l'APK Android"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Smartphone className="size-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <SyncStatusBadge />
            <div className="flex items-center justify-between gap-1 pt-1">
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
              >
                <Smartphone className="size-3.5" />
                <span>APK Android</span>
              </Link>
            </div>
            <p className="px-1 text-[10px] text-muted-foreground/70">
              POUFA · KIMBA 2026 🇬🇦
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
