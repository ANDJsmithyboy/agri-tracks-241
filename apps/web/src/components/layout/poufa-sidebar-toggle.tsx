"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function PoufaSidebarToggle() {
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar();
  const expanded = isMobile ? openMobile : open;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      aria-label={expanded ? "Masquer la navigation" : "Afficher la navigation"}
      aria-expanded={expanded}
      title={`${expanded ? "Masquer" : "Afficher"} la navigation · Ctrl+B`}
      className="size-9 shrink-0 rounded-[10px] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-150"
    >
      {isMobile ? (
        <Menu aria-hidden="true" className="size-[18px]" />
      ) : expanded ? (
        <PanelLeftClose aria-hidden="true" className="size-[18px]" />
      ) : (
        <PanelLeftOpen aria-hidden="true" className="size-[18px]" />
      )}
    </Button>
  );
}

