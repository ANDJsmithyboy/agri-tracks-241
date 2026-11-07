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

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
          "hover:bg-accent hover:text-accent-foreground",
          active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground",
          collapsed && "justify-center px-2",
        )}
      >
        <Icon
          className={cn("size-4 shrink-0", active && "text-primary")}
          aria-hidden
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.phase === "ultérieur" && (
          <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
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
