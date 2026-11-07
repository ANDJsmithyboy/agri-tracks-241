"use client";

import { useEffect, useState } from "react";
import {
  CloudCheck,
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";

const PENDING_KEY = "poufa-pending-count";

function usePendingCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      const raw = window.localStorage.getItem(PENDING_KEY);
      const n = raw ? Number.parseInt(raw, 10) : 0;
      setCount(Number.isFinite(n) && n > 0 ? n : 0);
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("poufa:sync-changed", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("poufa:sync-changed", read);
    };
  }, []);
  return count;
}

/**
 * Badge de synchronisation.
 * Règle produit : « en ligne » et « synchronisé » sont deux états distincts.
 * Tant qu'aucun accusé serveur n'est reçu, les opérations restent « en attente ».
 */
export function SyncStatusBadge({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const online = useOnlineStatus();
  const pending = usePendingCount();

  let icon = Wifi;
  let label = "…";
  let tone = "muted" as "muted" | "success" | "warning" | "destructive";

  if (online === false) {
    icon = WifiOff;
    label = pending > 0 ? `${pending} en attente` : "Hors ligne";
    tone = "warning";
  } else if (online === true) {
    if (pending > 0) {
      icon = RefreshCw;
      label = `${pending} en attente`;
      tone = "warning";
    } else {
      icon = CloudCheck;
      label = "Synchronisé";
      tone = "success";
    }
  }

  const Icon = icon;
  const dotClass = {
    muted: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-normal",
        tone === "warning" && "border-warning/40 text-warning",
        tone === "destructive" && "border-destructive/40 text-destructive",
        tone === "success" && "border-success/40 text-success",
        className,
      )}
    >
      <Icon className={cn("size-3.5", dotClass)} aria-hidden />
      {!compact && <span>{label}</span>}
      {compact && <span className="sr-only">{label}</span>}
    </Badge>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-64">
        {online === false
          ? "Hors ligne : les saisies sont conservées sur cet appareil et partiront à la prochaine connexion."
          : pending > 0
            ? `${pending} opération(s) enregistrée(s) localement, en attente de confirmation du serveur.`
            : "Connexion active. Les dernières données ont été confirmées par le serveur."}
      </TooltipContent>
    </Tooltip>
  );
}

export function OfflineBanner() {
  const online = useOnlineStatus();
  const pending = usePendingCount();

  if (online !== false) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm text-foreground"
    >
      <CloudOff className="size-4 shrink-0 text-warning" aria-hidden />
      <p>
        Vous êtes hors ligne.
        {pending > 0
          ? ` ${pending} saisie(s) en attente sur cet appareil.`
          : " Les saisies seront enregistrées localement."}{" "}
        <span className="text-muted-foreground">
          « Enregistré sur cet appareil » n&apos;est pas « synchronisé ».
        </span>
      </p>
    </div>
  );
}
