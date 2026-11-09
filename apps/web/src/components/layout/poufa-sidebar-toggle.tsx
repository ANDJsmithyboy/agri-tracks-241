"use client";

import { PanelLeft } from "lucide-react";
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
      className="size-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
    >
      <PanelLeft aria-hidden="true" className="size-4" />
    </Button>
  );
}

