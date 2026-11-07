"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Menu } from "lucide-react";
import { useRole } from "@/components/layout/role-provider";
import { NavList } from "@/components/layout/nav-list";
import { PoufaLogo } from "@/components/poufa-logo";
import { SyncStatusBadge } from "@/components/layout/sync-status";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { navForRole, type NavItem } from "@/lib/nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Cibles tactiles généreuses pour le terrain : zones ≥ 44 px. */
const PRIMARY_ORDER = [
  "/tableau-de-bord",
  "/saisie",
  "/bandes",
  "/sante",
  "/fermes",
  "/intrants",
  "/alertes",
];

function primaryItems(role: Role) {
  const visible = navForRole(role).flatMap((g) => g.items);
  const ordered: NavItem[] = [];
  for (const href of PRIMARY_ORDER) {
    const found = visible.find((i) => i.href === href);
    if (found) ordered.push(found);
  }
  // Complète si le rôle a moins de 4 entrées primaires.
  for (const item of visible) {
    if (ordered.length >= 4) break;
    if (!ordered.some((o) => o.href === item.href)) ordered.push(item);
  }
  return ordered.slice(0, 4);
}

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { role } = useRole();
  const pathname = usePathname();
  const items = primaryItems(role);

  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="flex items-stretch">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="max-w-20 truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground transition-colors"
          >
            <LayoutGrid className="size-5" aria-hidden />
            <span>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export function MobileMenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { role } = useRole();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-80 max-w-[85vw] flex-col p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <PoufaLogo />
          <p className="text-xs text-muted-foreground">
            {ROLE_LABELS[role]}
          </p>
        </SheetHeader>
        <NavList onNavigate={() => onOpenChange(false)} />
        <div className="space-y-3 border-t border-border p-4">
          <SyncStatusBadge />
          <p className="text-[11px] text-muted-foreground">
            POUFA · Version MVP
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
