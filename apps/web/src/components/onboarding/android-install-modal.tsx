"use client";

import Link from "next/link";
import {
  Download,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { PoufaEmblem } from "@/components/poufa-emblem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POUFA_ANDROID_RELEASE } from "@/lib/android-release";

interface AndroidInstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AndroidInstallModal({
  open,
  onOpenChange,
}: AndroidInstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <PoufaEmblem className="size-6" />
            <Badge variant="outline" className="font-mono text-xs">
              GitHub Release
            </Badge>
            <Badge variant="brand" className="text-xs">
              {POUFA_ANDROID_RELEASE.version}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Télécharger POUFA pour Android
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Application 100% native Kotlin conçue pour les éleveurs en poulailler :
            téléchargement direct du binaire APK officiel, sans inscription préalable.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-5">
          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-4 text-center sm:col-span-2">
            <div className="relative rounded-lg border border-border bg-white p-3 shadow-xs">
              <svg
                viewBox="0 0 140 140"
                className="size-36 text-[#28251F]"
                fill="currentColor"
                aria-label="QR Code de téléchargement POUFA Android"
              >
                <rect x="10" y="10" width="35" height="35" rx="4" fill="currentColor" />
                <rect x="16" y="16" width="23" height="23" rx="2" fill="#FFFFFF" />
                <rect x="22" y="22" width="11" height="11" rx="1" fill="currentColor" />
                <rect x="95" y="10" width="35" height="35" rx="4" fill="currentColor" />
                <rect x="101" y="16" width="23" height="23" rx="2" fill="#FFFFFF" />
                <rect x="107" y="22" width="11" height="11" rx="1" fill="currentColor" />
                <rect x="10" y="95" width="35" height="35" rx="4" fill="currentColor" />
                <rect x="16" y="101" width="23" height="23" rx="2" fill="#FFFFFF" />
                <rect x="22" y="107" width="11" height="11" rx="1" fill="currentColor" />
                <rect x="52" y="12" width="6" height="6" rx="1" />
                <rect x="64" y="12" width="6" height="6" rx="1" />
                <rect x="76" y="12" width="6" height="6" rx="1" />
                <rect x="52" y="24" width="6" height="6" rx="1" />
                <rect x="64" y="24" width="6" height="6" rx="1" />
                <rect x="76" y="36" width="6" height="6" rx="1" />
                <rect x="52" y="48" width="6" height="6" rx="1" />
                <rect x="64" y="60" width="6" height="6" rx="1" />
                <rect x="76" y="48" width="6" height="6" rx="1" />
                <rect x="16" y="52" width="6" height="6" rx="1" />
                <rect x="28" y="52" width="6" height="6" rx="1" />
                <rect x="40" y="52" width="6" height="6" rx="1" />
                <rect x="16" y="64" width="6" height="6" rx="1" />
                <rect x="28" y="76" width="6" height="6" rx="1" />
                <rect x="95" y="52" width="6" height="6" rx="1" />
                <rect x="107" y="64" width="6" height="6" rx="1" />
                <rect x="119" y="52" width="6" height="6" rx="1" />
                <rect x="95" y="76" width="6" height="6" rx="1" />
                <rect x="107" y="76" width="6" height="6" rx="1" />
                <rect x="52" y="95" width="6" height="6" rx="1" />
                <rect x="64" y="107" width="6" height="6" rx="1" />
                <rect x="76" y="95" width="6" height="6" rx="1" />
                <rect x="64" y="119" width="6" height="6" rx="1" />
                <rect x="95" y="95" width="6" height="6" rx="1" />
                <rect x="107" y="107" width="6" height="6" rx="1" />
                <rect x="119" y="119" width="6" height="6" rx="1" />
                <rect x="95" y="119" width="6" height="6" rx="1" />
              </svg>
            </div>
            <p className="mt-2 text-[11px] font-medium text-foreground">
              Scannez avec votre téléphone
            </p>
            <p className="text-[10px] text-muted-foreground">
              Téléchargement direct immédiat
            </p>
          </div>

          {/* Release Specifications & Steps */}
          <div className="space-y-3 sm:col-span-3">
            <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono font-medium text-foreground">{POUFA_ANDROID_RELEASE.version}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Taille du paquet</span>
                <span className="font-mono font-medium text-foreground">{POUFA_ANDROID_RELEASE.sizeLabel}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Compatibilité</span>
                <span className="font-medium text-foreground">{POUFA_ANDROID_RELEASE.minAndroid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode hors-ligne</span>
                <span className="inline-flex items-center gap-1 font-medium text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                  <WifiOff className="size-3" />
                  Room SQLite + Outbox
                </span>
              </div>
            </div>

            {/* 3 Steps */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  1
                </span>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Téléchargez l&apos;APK</strong> directement sur votre smartphone Android.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  2
                </span>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Autorisez l&apos;installation</strong> depuis votre navigateur Chrome si demandé.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  3
                </span>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Connectez-vous une première fois</strong> avec Clerk : toutes les saisies ultérieures fonctionnent même sans réseau.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/telecharger" onClick={() => onOpenChange(false)}>
              <ExternalLink className="size-3.5" aria-hidden />
              Voir la page détaillée
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
            <Button
              variant="brand"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href={POUFA_ANDROID_RELEASE.url}>
                <Download className="size-4" aria-hidden />
                <span>Télécharger pour Android</span>
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
