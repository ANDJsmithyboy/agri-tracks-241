"use client";

import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POUFA_ANDROID_RELEASE } from "@/lib/android-release";
import { cn } from "@/lib/utils";

interface PoufaAndroidDownloadButtonProps {
  variant?: "primary" | "compact" | "menu" | "outline";
  className?: string;
  label?: string;
  showSize?: boolean;
}

/**
 * Bouton universel de téléchargement direct de l'APK POUFA Android.
 * Utilise une navigation ancre HTML standard vers le binaire GitHub Release v0.3.0.
 */
export function PoufaAndroidDownloadButton({
  variant = "primary",
  className,
  label,
  showSize = true,
}: PoufaAndroidDownloadButtonProps) {
  const displayLabel =
    label ||
    (variant === "compact" || variant === "menu"
      ? "Télécharger APK"
      : `Télécharger POUFA pour Android${showSize ? ` (${POUFA_ANDROID_RELEASE.sizeLabel})` : ""}`);

  if (variant === "menu") {
    return (
      <a
        href={POUFA_ANDROID_RELEASE.url}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted focus:outline-hidden",
          className
        )}
      >
        <Smartphone className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="flex-1 font-medium">{displayLabel}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {POUFA_ANDROID_RELEASE.version}
        </span>
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        variant="brand"
        size="sm"
        asChild
        className={cn("gap-1.5 text-xs font-semibold shadow-xs", className)}
      >
        <a href={POUFA_ANDROID_RELEASE.url}>
          <Download className="size-3.5" aria-hidden />
          <span>{displayLabel}</span>
        </a>
      </Button>
    );
  }

  if (variant === "outline") {
    return (
      <Button
        variant="outline"
        size="sm"
        asChild
        className={cn("gap-2 text-xs", className)}
      >
        <a href={POUFA_ANDROID_RELEASE.url}>
          <Download className="size-4 text-primary" aria-hidden />
          <span>{displayLabel}</span>
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="brand"
      size="lg"
      asChild
      className={cn(
        "gap-2.5 text-sm font-semibold shadow-xs transition-transform active:scale-[0.99]",
        className
      )}
    >
      <a href={POUFA_ANDROID_RELEASE.url}>
        <Download className="size-5" aria-hidden />
        <span>{displayLabel}</span>
      </a>
    </Button>
  );
}
