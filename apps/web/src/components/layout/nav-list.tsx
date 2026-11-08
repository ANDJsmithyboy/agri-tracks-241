"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/components/layout/role-provider";
import { navForRole, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const tourAttr =
    item.href === "/bandes"
      ? "nav-bandes"
      : item.href === "/intrants"
      ? "nav-intrants"
      : item.href === "/sante"
      ? "nav-sante"
      : item.href === "/tracabilite"
      ? "nav-tracabilite"
      : item.href === "/rapports"
      ? "nav-rapports"
      : item.href === "/ia"
      ? "nav-poufa-ai"
      : undefined;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        data-tour={tourAttr}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-all duration-150",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute left-1 top-2 bottom-2 w-[3px] rounded-full bg-[var(--brand-green)] dark:bg-[var(--brand-neon)]"
          />
        )}
        <Icon
          className={cn(
            "size-[18px] shrink-0 transition-colors",
            active
              ? "text-[var(--brand-green)] dark:text-[var(--brand-neon)]"
              : "text-muted-foreground group-hover:text-sidebar-foreground",
          )}
          aria-hidden
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.phase === "ultérieur" && (
          <span className="ml-auto rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Bientôt
          </span>
        )}
      </Link>
    </li>
  );
}

export function NavList({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { role } = useRole();
  const groups = navForRole(role);

  return (
    <nav aria-label="Navigation principale" className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {group.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
