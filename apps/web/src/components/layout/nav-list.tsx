"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/components/layout/role-provider";
import { useSidebar } from "@/components/ui/sidebar";
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
        title={item.label}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center rounded-lg transition-all duration-150",
          collapsed
            ? "h-10 w-10 mx-auto justify-center px-0"
            : "h-9 w-full gap-2.5 px-2.5 text-[13px] font-medium",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        {active && (
          <span
            aria-hidden
            className={cn(
              "rounded-full bg-[var(--brand-green)] dark:bg-[var(--brand-neon)]",
              collapsed
                ? "absolute left-0.5 top-2.5 bottom-2.5 w-[3px]"
                : "absolute left-1 top-2 bottom-2 w-[3px]"
            )}
          />
        )}
        <Icon
          className={cn(
            "shrink-0 transition-colors",
            collapsed ? "size-5" : "size-[18px]",
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
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { role } = useRole();
  const { state } = useSidebar();
  const isCollapsed = collapsed ?? (state === "collapsed");
  const groups = navForRole(role);

  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden scrollbar-none",
        isCollapsed ? "space-y-2 px-1 py-2" : "space-y-4 px-2 py-3"
      )}
    >
      {groups.map((group, groupIndex) => (
        <div key={group.label}>
          {isCollapsed ? (
            groupIndex > 0 ? (
              <div className="my-2 h-px w-6 mx-auto bg-sidebar-border/60" aria-hidden />
            ) : null
          ) : (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {group.label}
            </p>
          )}
          <ul className={cn("space-y-1", isCollapsed && "space-y-1 flex flex-col items-center")}>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
