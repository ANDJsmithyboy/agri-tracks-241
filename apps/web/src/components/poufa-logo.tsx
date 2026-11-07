import { Bird } from "lucide-react";
import { cn } from "@/lib/utils";

export function PoufaLogo({
  className,
  showWordmark = true,
  compact = false,
}: {
  className?: string;
  showWordmark?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Bird className="size-5" aria-hidden />
      </div>
      {showWordmark && !compact && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight text-foreground">
            POUFA
          </span>
          {!compact && (
            <span className="mt-1 text-[11px] font-medium text-muted-foreground">
              Suivi avicole — Gabon
            </span>
          )}
        </div>
      )}
    </div>
  );
}
