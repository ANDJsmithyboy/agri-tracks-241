"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Search } from "lucide-react";
import { toast } from "sonner";
import { CommandMenu } from "@/components/layout/command-menu";
import { PoufaLogo } from "@/components/poufa-logo";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { SyncStatusBadge } from "@/components/layout/sync-status";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
  return best?.label ?? "POUFA";
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const pageLabel = currentPageLabel(pathname);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="size-9 lg:hidden"
        onClick={onOpenMenu}
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <PoufaLogo compact />
      </div>

      <div className="hidden min-w-0 items-center gap-2 lg:flex">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">POUFA</span>
          <span className="text-muted-foreground/60" aria-hidden>
            /
          </span>
          <span className="truncate font-medium text-foreground">
            {pageLabel}
          </span>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 gap-2 text-muted-foreground md:inline-flex hover:border-foreground/20 text-xs"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="size-3.5" aria-hidden />
          <span>Rechercher…</span>
          <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </Button>

        <div className="hidden sm:block">
          <SyncStatusBadge />
        </div>

        <RoleSwitcher className="hidden md:inline-flex" />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              aria-label="Notifications"
            >
              <Bell className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              Aucune notification pour le moment.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </div>
    </header>
    </>
  );
}
