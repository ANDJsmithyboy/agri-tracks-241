import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Carte KPI de haute précision — chiffres tabulaires, micro-hover, icônes optionnelles. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "gap-0 py-3.5 px-4 transition-all duration-150 hover:border-foreground/20 hover:shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <Icon className="size-3.5 text-muted-foreground/70" aria-hidden />
        )}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value ?? <Skeleton className="h-7 w-20" />}
      </div>
      {hint ? (
        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}
