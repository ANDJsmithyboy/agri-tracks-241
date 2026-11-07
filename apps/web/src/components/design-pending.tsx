import { PencilRuler } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Panneau placeholder pour les zones dont le design détaillé est produit
 * par l'équipe UX (Opus) — tableaux de bord, graphiques, workflows.
 * Volontairement sobre : il signale l'emplacement et le rôle de la zone.
 */
export function DesignPending({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-8 text-center",
        className,
      )}
    >
      {children ?? (
        <>
          <PencilRuler className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint ? (
            <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </>
      )}
    </div>
  );
}
