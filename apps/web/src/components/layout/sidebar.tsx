"use client";

import { useEffect, useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
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
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-out lg:flex",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <PoufaLogo compact={collapsed} />
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Réduire le menu"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronsLeft className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-border px-2 py-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Déplier le menu"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronsRight className="size-4" aria-hidden />
          </button>
        </div>
      )}

      <NavList collapsed={collapsed} />

      <div className="shrink-0 border-t border-border p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <SyncStatusBadge compact />
          </div>
        ) : (
          <div className="space-y-2">
            <SyncStatusBadge />
            <p className="px-1 text-[11px] text-muted-foreground">
              POUFA · Version MVP
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
