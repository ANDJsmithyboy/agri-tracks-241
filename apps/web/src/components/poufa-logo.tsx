"use client";

import Image from "next/image";
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
    <div className={cn("inline-flex items-center gap-2.5 shrink-0", className)}>
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: "36px",
          height: "36px",
          maxWidth: "36px",
          maxHeight: "36px",
          flexShrink: 0,
        }}
      >
        <Image
          src="/branding/poufa-symbol.svg"
          alt="POUFA"
          width={36}
          height={36}
          priority
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            flexShrink: 0,
          }}
        />
      </div>
      {showWordmark && !compact && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight text-foreground font-mono">
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
