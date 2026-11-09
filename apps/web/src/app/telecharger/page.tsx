"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  HelpCircle,
  Laptop,
  Monitor,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { PoufaEmblem } from "@/components/poufa-emblem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TelechargerPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/telecharger/android`
          : "https://poufa.smartandjai.com/telecharger/android";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignorer
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4 sm:py-6">
      {/* Top Breadcrumb & Badges */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-xs">
          <Link href="/tableau-de-bord">
            <ArrowLeft className="size-4" />
            <span>Tableau de bord</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Distribution Cloudflare R2
          </Badge>
          <Badge variant="brand" className="text-xs">
            KIMBA 2026
          </Badge>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <div className="relative">
            <PoufaEmblem className="size-16 sm:size-20 shrink-0" />
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[var(--brand-green)] text-[10px] font-bold text-white dark:bg-[var(--brand-neon)] dark:text-black">
              ✓
            </span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              POUFA pour Android — Version Officielle
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Téléchargement direct depuis notre infrastructure Cloudflare R2 : sans Google Drive, sans compte GitHub et sans archive ZIP. Installez l&apos;APK directement sur votre téléphone.
            </p>
          </div>
        </div>
      </div>

      {/* Main Download Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Android Native Card */}
        <Card className="flex flex-col justify-between border-2 border-primary/25 shadow-sm">
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--brand-green)]/15 text-[var(--brand-green)] dark:bg-[var(--brand-neon)]/15 dark:text-[var(--brand-neon)]">
                  <Smartphone className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">POUFA Android Native</CardTitle>
                  <CardDescription className="text-xs">
                    Package APK vérifié · Kotlin & Jetpack Compose
                  </CardDescription>
                </div>
              </div>
              <Badge variant="brand">Terrain & Offline</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Primary Action Button — Direct Browser Navigation to /telecharger/android */}
            <div className="space-y-2">
              <Button
                variant="brand"
                size="lg"
                className="w-full gap-2.5 text-sm font-semibold shadow-xs transition-transform active:scale-[0.99]"
                asChild
              >
                <a href="/telecharger/android">
                  <Download className="size-5" />
                  <span>Télécharger POUFA pour Android (27.98 Mo)</span>
                </a>
              </Button>
              <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                <span>Format : APK autonome</span>
                <span>Hébergé sur Cloudflare R2</span>
              </div>
            </div>

            {/* QR Code Card for Mobile Scanners */}
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
              <div className="rounded-lg border border-border bg-white p-2.5 shadow-2xs shrink-0">
                <svg
                  viewBox="0 0 140 140"
                  className="size-32 text-[#28251F]"
                  fill="currentColor"
                  aria-label="QR Code APK Android"
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
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-xs font-semibold text-foreground">
                  Vous êtes sur un ordinateur ?
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Scannez ce QR Code avec l&apos;appareil photo de votre téléphone pour télécharger l&apos;APK directement sur votre mobile.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-7 gap-1.5 text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                      <span>Lien copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copier le lien direct</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Technical Verification Table */}
            <div className="space-y-2 rounded-xl border border-border bg-card p-3.5 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Nom du paquet</span>
                <span className="font-mono font-medium">com.poufa.app</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Version de publication</span>
                <span className="font-mono font-medium">0.1.0-kimba-demo</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Poids exact</span>
                <span className="font-mono font-medium">26.55 Mo (27 836 513 octets)</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Compatibilité minimale</span>
                <span className="font-medium">Android 8.0+ (Oreo, API 26)</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Bucket Cloudflare R2</span>
                <span className="font-mono font-medium">poufa-releases</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Somme de contrôle SHA-256</span>
                <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]" title="4b68e8e7a685121b6d92a95c52c6e64c39de558a7b973c75ecf23bc2e48e02d0">
                  4b68e8e7a685121b…
                </span>
              </div>
            </div>

            {/* Offline Key Benefit */}
            <div className="flex items-start gap-2.5 rounded-lg border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/5 p-3 text-xs text-foreground dark:border-[var(--brand-neon)]/30 dark:bg-[var(--brand-neon)]/5">
              <WifiOff className="size-4 shrink-0 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
              <p className="leading-relaxed">
                <strong>Fonctionne 100% sans Internet :</strong> après une première connexion, toutes les opérations de saisie en poulailler (mortalités, pesées, consommations) sont stockées dans la base locale SQLite Room et synchronisées automatiquement dès le retour du réseau.
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/tableau-de-bord">
                Continuer sur la version Web
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Installation Guidance Card */}
        <Card className="flex flex-col justify-between shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Guide d&apos;installation Android</CardTitle>
                <CardDescription className="text-xs">
                  4 étapes simples pour installer l&apos;APK sur votre téléphone
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-foreground">Télécharger le fichier APK</p>
                <p className="text-muted-foreground leading-relaxed">
                  Touchez le bouton « Télécharger POUFA pour Android ». Le téléchargement démarre immédiatement dans votre navigateur Chrome.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-foreground">Ouvrir l&apos;APK téléchargé</p>
                <p className="text-muted-foreground leading-relaxed">
                  Lorsque le téléchargement est achevé, touchez « Ouvrir » dans la barre de notification ou accédez à votre dossier « Téléchargements ».
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground">Autoriser la source (si demandé)</p>
                <p className="text-muted-foreground leading-relaxed">
                  Si Android affiche l&apos;alerte de sécurité standard <em>« Votre téléphone n&apos;est pas autorisé à installer des applications inconnues depuis cette source »</em>, touchez <strong>Paramètres</strong> et activez <strong>« Autoriser cette source »</strong>.
                </p>
                <div className="rounded border border-border/60 bg-muted/30 p-2 text-[11px] text-muted-foreground space-y-0.5">
                  <p>• <strong>Samsung (One UI)</strong> : Paramètres &gt; Applications &gt; Installer applis inconnues</p>
                  <p>• <strong>Xiaomi (HyperOS / MIUI)</strong> : Paramètres &gt; Autoriser cette source (10s)</p>
                  <p>• <strong>Tecno / Infinix (HiOS)</strong> : Sécurité &gt; Sources inconnues &gt; Chrome</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                4
              </span>
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-foreground">Installer & Ouvrir POUFA</p>
                <p className="text-muted-foreground leading-relaxed">
                  Touchez <strong>Installer</strong>. Une fois l&apos;opération terminée, touchez <strong>Ouvrir</strong> et connectez-vous avec votre compte Clerk. Vos données seront prêtes pour le travail en poulailler.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <div className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                <span>Binaire signé et scanné sans danger</span>
              </div>
              <span className="font-mono text-[10px]">SHA-256 OK</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Kimba 2026 Jury Note */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">
          Challenge National KIMBA 2026 · République Gabonaise
        </p>
        <p>
          Développé par <strong>SmartANDJ AI Technologies SARL</strong> (Libreville, Gabon).
          Distribution Cloudflare R2 haute disponibilité · Pas de dépendance tierce à l&apos;installation.
        </p>
      </div>
    </div>
  );
}
