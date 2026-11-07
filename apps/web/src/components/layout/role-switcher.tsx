"use client";

import { Check, UserCog } from "lucide-react";
import { useRole } from "@/components/layout/role-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

/**
 * Permet de prévisualiser la navigation par rôle en attendant l'auth Clerk.
 * Ne constitue PAS une authentification : l'autorisation réelle sera
 * vérifiée côté serveur sur chaque requête API.
 */
export function RoleSwitcher({ className }: { className?: string }) {
  const { role, setRole } = useRole();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          aria-label="Changer de rôle (aperçu)"
        >
          <UserCog className="size-4" aria-hidden />
          <span className="hidden max-w-36 truncate sm:inline">
            {ROLE_LABELS[role]}
          </span>
          <Badge variant="secondary" className="hidden px-1.5 text-[10px] md:inline">
            Aperçu
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Prévisualiser en tant que</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => setRole(r)}
            className="gap-2"
          >
            <Check
              className={cn(
                "size-4",
                role === r ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            />
            {ROLE_LABELS[r]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
          Aperçu de développement — l&apos;accès réel est contrôlé par le
          serveur (Clerk + API).
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
