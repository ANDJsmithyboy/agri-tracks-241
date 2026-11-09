"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import { CommandMenu } from "@/components/layout/command-menu";
import { PoufaSidebarToggle } from "@/components/layout/poufa-sidebar-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_GROUPS } from "@/lib/nav";

function currentPageLabel(pathname: string): string {
  let best: { href: string; label: string } | null = null;
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (
        (pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
        (!best || item.href.length > best.href.length)
      ) {
        best = item;
      }
    }
  }
  return best?.label ?? "Tableau de bord";
}

export function Topbar() {
  const pathname = usePathname();
  const pageLabel = currentPageLabel(pathname);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:px-5">
        {/* ── Left Region: Mobile Trigger + Breadcrumb (Desktop toggle is inside sidebar) ── */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="md:hidden">
            <PoufaSidebarToggle />
          </div>
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <Link
              href="/tableau-de-bord"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              POUFA
            </Link>
            <span className="text-muted-foreground/40" aria-hidden>
              /
            </span>
            <span className="truncate font-semibold text-foreground max-w-[140px] sm:max-w-none">
              {pageLabel}
            </span>
          </nav>
        </div>

        {/* ── Center Region: Dedicated Global Search Command ── */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-tour="search-bar"
            onClick={() => setCommandOpen(true)}
            className="w-full h-8 justify-between text-xs text-muted-foreground bg-secondary/30 hover:bg-secondary/60 hover:text-foreground border-border/80 px-2.5 rounded-lg shadow-none"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5" aria-hidden />
              <span>Rechercher dans POUFA…</span>
            </span>
            <kbd className="font-mono text-[10px] text-muted-foreground/80 bg-background/80 px-1.5 py-0.5 rounded border border-border">
              Ctrl K
            </kbd>
          </Button>
        </div>

        {/* ── Right Region: Workspace Scope, Theme, Notifications, Avatar ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile search trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="size-8 text-muted-foreground md:hidden"
            aria-label="Rechercher"
          >
            <Search className="size-4" />
          </Button>

          {/* Compact scope context */}
          <Badge variant="secondary" className="hidden lg:inline-flex text-[11px] font-mono font-medium">
            Ferme Kango
          </Badge>

          {/* Theme switch */}
          <div data-tour="theme-toggle">
            <ThemeToggle />
          </div>

          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                Aucune alerte sanitaire en attente.
              </p>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User profile avatar */}
          <div className="pl-1">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8",
                },
              }}
            />
          </div>
        </div>
      </header>
    </>
  );
}

export { Topbar as PoufaHeader };
