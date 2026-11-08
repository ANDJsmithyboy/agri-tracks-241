"use client";

import { cn } from "@/lib/utils";
import { PoufaEmblem } from "./poufa-emblem";

export { PoufaEmblem };

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
      <PoufaEmblem className="size-9" />
      {showWordmark && !compact && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight text-foreground">
            POUFA
          </span>
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            Suivi avicole — Gabon
          </span>
        </div>
      )}
    </div>
  );
}

export default PoufaLogo;
