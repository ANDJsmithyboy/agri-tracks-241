"use client";

import * as React from "react";
import { PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const SIDEBAR_COOKIE_NAME = "poufa_sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "14.5rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextType = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((value: boolean) => boolean)) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);

  // Uncontrolled state initialized identically on SSR & client to prevent hydration mismatch
  const [_open, _setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sidebar") === "closed") {
      _setOpen(false);
      return;
    }
    if (params.get("sidebar") === "open") {
      _setOpen(true);
      return;
    }
    const stored = window.localStorage.getItem(SIDEBAR_COOKIE_NAME);
    if (stored !== null) {
      _setOpen(stored === "true");
    }
  }, []);

  // Query parameter theme override for visual verification / capture
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const themeParam = params.get("theme");
      if (themeParam === "light") {
        try {
          window.localStorage.setItem("theme", "light");
        } catch {}
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      } else if (themeParam === "dark") {
        try {
          window.localStorage.setItem("theme", "dark");
        } catch {}
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      }
    }
  }, []);

  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_COOKIE_NAME, String(openState));
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [setOpenProp, open]
  );

  // Responsive check
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1024px)");
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Keyboard shortcut Ctrl+B / Cmd+B
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        if (isMobile) {
          setOpenMobile((prev) => !prev);
        } else {
          setOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, setOpen]);

  const state = open ? "expanded" : "collapsed";

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev);
  }, [isMobile, setOpen]);

  const contextValue = React.useMemo<SidebarContextType>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full bg-background",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "icon" | "offcanvas" | "none";
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        className={cn(
          "flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Mobile drawer mode
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[var(--sidebar-width-mobile)] bg-sidebar p-0 text-sidebar-foreground border-r border-sidebar-border [&>button]:hidden"
          side={side}
        >
          <SheetTitle className="sr-only">Navigation POUFA</SheetTitle>
          <SheetDescription className="sr-only">Menu principal de l&apos;application</SheetDescription>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  const isCollapsed = state === "collapsed";
  const isOffcanvas = collapsible === "offcanvas";

  return (
    <aside
      className={cn(
        "group peer hidden md:block text-sidebar-foreground transition-[width] duration-200 ease-out shrink-0",
        isCollapsed ? (isOffcanvas ? "w-0 overflow-hidden" : "w-16") : "w-[var(--sidebar-width)]",
        className
      )}
      data-state={state}
      data-collapsible={isCollapsed ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* Gap spacer for layout flow */}
      <div
        className={cn(
          "duration-200 relative h-svh bg-transparent transition-[width] ease-out",
          isCollapsed ? (isOffcanvas ? "w-0" : "w-16") : "w-[var(--sidebar-width)]"
        )}
      />
      {/* Fixed sidebar content */}
      <div
        className={cn(
          "duration-200 fixed inset-y-0 z-20 hidden h-svh transition-[left,right,width] ease-out md:flex md:flex-col",
          side === "left"
            ? isCollapsed && isOffcanvas
              ? "left-[calc(var(--sidebar-width)*-1)]"
              : "left-0"
            : isCollapsed && isOffcanvas
            ? "right-[calc(var(--sidebar-width)*-1)]"
            : "right-0",
          isCollapsed && !isOffcanvas ? "w-16" : "w-[var(--sidebar-width)]",
          "border-r border-sidebar-border bg-sidebar"
        )}
        {...props}
      >
        <div data-sidebar="sidebar" className="flex h-full w-full flex-col">
          {children}
        </div>
      </div>
    </aside>
  );
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background transition-[margin] duration-200 ease-out min-w-0",
        className
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-3 shrink-0", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-3 shrink-0", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    />
  );
}
