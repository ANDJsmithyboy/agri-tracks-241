"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Download,
  Eye,
  Layers,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { AndroidInstallModal } from "@/components/onboarding/android-install-modal";
import { startGuidedTour } from "@/components/onboarding/guided-tour";
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

const WELCOME_STORAGE_KEY = "poufa-welcome-seen-v1";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    // Écoute des demandes d'ouverture manuelle (via Topbar ou CommandMenu)
    const handleManualOpen = () => setOpen(true);
    window.addEventListener("open-poufa-welcome", handleManualOpen);

    // Vérifie si l'utilisateur a déjà vu la visite ou si l'aperçu désactive le modal
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("nowelcome") === "1" || params.get("nowelcome") === "true") {
        return;
      }
      const seen = window.localStorage.getItem(WELCOME_STORAGE_KEY);
      if (!seen) {
        // Petit délai pour laisser l'interface se stabiliser
        const timer = setTimeout(() => {
          setOpen(true);
        }, 600);
        return () => {
          clearTimeout(timer);
          window.removeEventListener("open-poufa-welcome", handleManualOpen);
        };
      }
    } catch {
      // Ignorer si localStorage indisponible
    }

    return () => {
      window.removeEventListener("open-poufa-welcome", handleManualOpen);
    };
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        window.localStorage.setItem(WELCOME_STORAGE_KEY, "true");
      } catch {
        // localStorage indisponible
      }
    }
    setOpen(false);
  };

  const handleStartTour = () => {
    handleClose();
    // Laisser la modal se fermer avant de lancer la tournée Driver.js
    setTimeout(() => {
      startGuidedTour();
    }, 300);
  };

  const handleOpenAndroid = () => {
    setOpen(false);
    setAndroidModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl sm:max-w-2xl p-6 sm:p-8">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <PoufaEmblem className="size-8" />
              <Badge variant="outline" className="font-mono text-xs">
                KIMBA 2026 · Gabon 🇬🇦
              </Badge>
              <Badge variant="brand" className="text-xs">
                Version Officielle
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Bienvenue sur POUFA
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Le système national intégré de suivi avicole, d&apos;assistance zootechnique et de traçabilité unitaire de la filière agricole gabonaise.
            </DialogDescription>
          </DialogHeader>

          {/* 3 Core Experience Cards */}
          <div className="grid gap-3.5 py-4 sm:grid-cols-3">
            {/* Card 1: Guided Tour */}
            <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/30 hover:shadow-xs">
              <div className="space-y-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-green)]/10 text-[var(--brand-green)] dark:bg-[var(--brand-neon)]/10 dark:text-[var(--brand-neon)]">
                  <Compass className="size-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">
                  Visite interactive
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Découvrez en 1 minute les 10 zones clés du logiciel : bandes, santé, courbes de croissance et rapports officiels.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartTour}
                className="mt-4 w-full gap-1.5 text-xs font-medium"
              >
                <span>Démarrer le guide</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>

            {/* Card 2: Android Native APK */}
            <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/30 hover:shadow-xs">
              <div className="space-y-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="size-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-foreground">
                    Application Android
                  </h3>
                  <span className="rounded bg-[var(--brand-green)]/15 px-1.5 py-0.2 text-[10px] font-semibold text-[var(--brand-green)] dark:bg-[var(--brand-neon)]/20 dark:text-[var(--brand-neon)]">
                    APK
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  100% hors-ligne en poulailler avec base SQLite Room et synchronisation différée dès le retour du réseau.
                </p>
              </div>
              <Button
                variant="brand"
                size="sm"
                onClick={handleOpenAndroid}
                className="mt-4 w-full gap-1.5 text-xs font-medium"
              >
                <Download className="size-3.5" />
                <span>Installer l&apos;APK</span>
              </Button>
            </div>

            {/* Card 3: POUFA AI */}
            <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/30 hover:shadow-xs">
              <div className="space-y-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]">
                  <Sparkles className="size-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">
                  POUFA AI
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conseil zootechnique alimenté par DeepSeek en streaming : rations, indice de consommation et diagnostics d&apos;élevage.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mt-4 w-full gap-1.5 text-xs font-medium"
              >
                <Link href="/ia" onClick={handleClose}>
                  <span>Ouvrir l&apos;assistant</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer & Controls */}
          <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="size-3.5 rounded border-border text-primary focus:ring-1 focus:ring-primary"
              />
              <span>Ne plus afficher automatiquement au démarrage</span>
            </label>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="text-xs"
              >
                Accéder au tableau de bord
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={handleStartTour}
                className="text-xs gap-1.5"
              >
                <Compass className="size-3.5" />
                <span>Visite guidée</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Android Dedicated Install Modal */}
      <AndroidInstallModal
        open={androidModalOpen}
        onOpenChange={setAndroidModalOpen}
      />
    </>
  );
}

