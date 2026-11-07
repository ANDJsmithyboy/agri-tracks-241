import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Carte KPI générique — prête pour les vraies métriques API. */
export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 py-4", className)}>
      <CardContent className="px-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {value ?? <Skeleton className="h-7 w-20" />}
        </div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
