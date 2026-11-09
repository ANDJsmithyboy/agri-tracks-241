"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  ChevronUp,
  Download,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
  Zap,
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

export function FirstLoginAndroidDialog() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    try {
      // Éviter l'affichage en mode aperçu/test
      const params = new URLSearchParams(window.location.search);
      if (params.get("noandroid") === "1" || params.get("nowelcome") === "1") {
        return;
      }

      const storageKey = `poufa:android-install:${POUFA_ANDROID_RELEASE.version}:${user.id}`;
      const hasSeen = window.localStorage.getItem(storageKey);

      if (!hasSeen) {
        // Délai court pour laisser le shell du tableau de bord s'afficher d'abord
        const timer = setTimeout(() => {
          setOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignorer si localStorage indisponible
    }
  }, [isLoaded, isSignedIn, user]);

  const handleDismiss = () => {
    if (user) {
      try {
        const storageKey = `poufa:android-install:${POUFA_ANDROID_RELEASE.version}:${user.id}`;
        window.localStorage.setItem(storageKey, "dismissed");
      } catch {
        // Ignorer
      }
    }
    setOpen(false);
  };

  const handleDownloadClick = () => {
    if (user) {
      try {
        const storageKey = `poufa:android-install:${POUFA_ANDROID_RELEASE.version}:${user.id}`;
        window.localStorage.setItem(storageKey, "downloaded");
      } catch {
        // Ignorer
      }
    }
    // Laisser la navigation ancre déclencher le téléchargement APK
  };

  return (
    <Dialog open={open} onOpenChange={(val) => (!val ? handleDismiss() : setOpen(val))}>
      <DialogContent className="max-w-xl p-6 sm:p-7 border-border bg-card">
        <DialogHeader className="space-y-3 text-left">
          {/* Top Emblem + Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <PoufaEmblem className="size-9 shrink-0" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Application Officielle
                </span>
                <span className="font-semibold text-xs text-foreground">
                  POUFA Mobile Native
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="font-mono text-[11px]">
                {POUFA_ANDROID_RELEASE.version}
              </Badge>
              <Badge variant="brand" className="text-[11px]">
                KIMBA 2026
              </Badge>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5 pt-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              POUFA, aussi sur Android
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed sm:text-sm">
              Installez l&apos;application native POUFA pour suivre vos élevages sur le terrain, enregistrer vos opérations hors connexion et synchroniser vos données au retour du réseau.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 3 Core Benefits */}
        <div className="grid gap-2.5 py-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <WifiOff className="size-3.5 text-[var(--brand-green)] dark:text-[var(--brand-neon)] shrink-0" />
              <span>Hors connexion</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Saisie en poulailler 100% offline avec base locale SQLite Room.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Zap className="size-3.5 text-[var(--brand-gold)] shrink-0" />
              <span>Synchro différée</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Envoi automatique vers Neon PostgreSQL dès le retour d&apos;Internet.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="size-3.5 text-primary shrink-0" />
              <span>Traçabilité KIMBA</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Pesées, mortalités, lots et assistance IA DeepSeek intégrée.
            </p>
          </div>
        </div>

        {/* Toggle Guide "Comment installer ?" */}
        <div className="rounded-xl border border-border/80 bg-muted/15 p-3 text-xs">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex w-full items-center justify-between font-medium text-foreground hover:text-primary transition-colors text-left"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-muted-foreground" />
              <span>Comment installer l&apos;application ?</span>
            </span>
            {showGuide ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>

          {showGuide && (
            <div className="mt-3 space-y-2 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground leading-relaxed">
              <p>
                <strong>1.</strong> Touchez <em>« Télécharger POUFA pour Android »</em> ci-dessous.
              </p>
              <p>
                <strong>2.</strong> Ouvrez le fichier <code>{POUFA_ANDROID_RELEASE.filename}</code> dans vos notifications ou téléchargements.
              </p>
              <p>
                <strong>3.</strong> Si Android affiche un avertissement de sécurité, appuyez sur <em>Paramètres</em> et activez <em>« Autoriser cette source »</em> (Samsung, Tecno, Infinix, Xiaomi).
              </p>
              <p>
                <strong>4.</strong> Appuyez sur <em>Installer</em> puis <em>Ouvrir</em> pour commencer vos saisies terrain.
              </p>
            </div>
          )}
        </div>

        {/* Release Metadata Row */}
        <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
          <span>Taille : {POUFA_ANDROID_RELEASE.sizeLabel}</span>
          <span className="font-mono text-[10px]">SHA-256 : {POUFA_ANDROID_RELEASE.sha256.slice(0, 16)}…</span>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-xs text-muted-foreground hover:text-foreground order-2 sm:order-1"
          >
            Continuer sur POUFA Web
          </Button>

          <Button
            variant="brand"
            size="lg"
            asChild
            className="gap-2 text-sm font-semibold shadow-xs order-1 sm:order-2"
          >
            <a
              href={POUFA_ANDROID_RELEASE.url}
              onClick={handleDownloadClick}
            >
              <Download className="size-4" aria-hidden />
              <span>Télécharger POUFA pour Android</span>
            </a>
          </Button>
        </DialogFooter>

        <p className="text-[10px] text-center text-muted-foreground -mt-1">
          Android vous demandera de confirmer l&apos;installation lors de l&apos;ouverture du fichier.
        </p>
      </DialogContent>
    </Dialog>
  );
}

